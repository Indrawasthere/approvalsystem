import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateApprovalCode } from "@/lib/utils";
import { googleDriveService } from "@/services/google-drive";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    let where: any = {};

    if (userRole === "REQUESTER") {
      where.requesterId = userId;
    } else if (userRole !== "ADMIN") {
      where.OR = [
        { requesterId: userId },
        { firstLayerApproverId: userId },
        { secondLayerApproverId: userId },
        { thirdLayerApproverId: userId },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { approvalCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const approvals = await prisma.approval.findMany({
      where,
      include: {
        requester: { select: { name: true, email: true, department: true } },
        firstLayerApprover: { select: { name: true, email: true } },
        secondLayerApprover: { select: { name: true, email: true } },
        thirdLayerApprover: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ approvals });
  } catch (error) {
    console.error("GET /api/approvals error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📝 Creating new approval...");

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const documentType = formData.get("documentType") as string;
    const file = formData.get("file") as File;

    console.log("Form data:", { title, documentType, fileSize: file?.size });

    if (!title || !documentType || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }

    // Upload to Google Drive first
    console.log("📤 Starting Google Drive upload...");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let fileId: string;
    let webViewLink: string;

    try {
      const uploadResult = await googleDriveService.uploadFile(
        buffer,
        file.name,
        file.type
      );
      fileId = uploadResult.fileId;
      webViewLink = uploadResult.webViewLink;
      console.log("✅ Google Drive upload successful:", fileId);
    } catch (driveError: any) {
      console.error("❌ Google Drive upload failed:", driveError);
      return NextResponse.json(
        { 
          error: `Google Drive upload failed: ${driveError.message}`,
          details: "Check server logs for more information"
        },
        { status: 500 }
      );
    }

    // Get approvers
    console.log("👥 Finding approvers...");
    const [layer1, layer2, layer3] = await Promise.all([
      prisma.user.findFirst({
        where: { role: "FIRST_APPROVER", isActive: true },
      }),
      prisma.user.findFirst({
        where: { role: "SECOND_APPROVER", isActive: true },
      }),
      prisma.user.findFirst({
        where: { role: "THIRD_APPROVER", isActive: true },
      }),
    ]);

    if (!layer1) {
      console.error("❌ No Layer 1 approver found");
      return NextResponse.json(
        { error: "No approvers available. Contact admin." },
        { status: 500 }
      );
    }

    // Create approval with document info
    console.log("💾 Saving approval to database...");
    const approval = await prisma.approval.create({
      data: {
        title,
        description,
        documentType: documentType as any,
        documentUrl: webViewLink,
        documentName: file.name,
        documentSize: file.size,
        documentFileId: fileId,
        documentMimeType: file.type,
        approvalCode: generateApprovalCode(),
        requesterId: (session.user as any).id,
        firstLayerApproverId: layer1?.id,
        secondLayerApproverId: layer2?.id,
        thirdLayerApproverId: layer3?.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      },
      include: {
        requester: { select: { name: true, email: true } },
        firstLayerApprover: { select: { name: true, email: true } },
      },
    });

    console.log("✅ Approval created:", approval.id);

    // Create notification for first approver
    if (layer1) {
      await prisma.notification.create({
        data: {
          userId: layer1.id,
          approvalId: approval.id,
          type: "APPROVAL_REQUEST",
          title: `New Approval Request`,
          message: `${(approval as any).requester.name} submitted "${title}" for approval`,
        },
      });

      console.log("✅ Notification created for Layer 1");

      // Mock email log
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL NOTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${layer1.email}
Subject: 🔔 New Approval Request - ${title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi ${layer1.name},

${(approval as any).requester.name} has submitted a new approval request.

📄 Title: ${title}
🔖 Code: ${approval.approvalCode}
📁 Type: ${documentType}
📅 Due: ${approval.dueDate?.toLocaleDateString()}

👉 Review: ${process.env.NEXTAUTH_URL}/dashboard/approvals/${approval.id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    }

    return NextResponse.json(approval, { status: 201 });
  } catch (error: any) {
    console.error("❌ POST /api/approvals error:", error);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}