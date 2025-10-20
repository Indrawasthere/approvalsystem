import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateApprovalCode } from "@/lib/utils";

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

    const body = await request.json();
    const { title, description, documentType, documentUrl, documentName, documentSize } = body;

    if (!title || !documentType || !documentUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get approvers
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

    const approval = await prisma.approval.create({
      data: {
        title,
        description,
        documentType,
        documentUrl,
        documentName,
        documentSize: documentSize || 0,
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

    // Create notification for first approver
    if (layer1) {
      await prisma.notification.create({
        data: {
          userId: layer1.id,
          approvalId: approval.id,
          type: "APPROVAL_REQUEST",
          title: `New Approval Request`,
          message: `${approval.requester.name} submitted "${title}" for approval`,
        },
      });
    }

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    console.error("POST /api/approvals error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}