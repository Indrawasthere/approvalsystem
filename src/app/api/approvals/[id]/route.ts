import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const approval = await prisma.approval.findUnique({
      where: { id: params.id },
      include: {
        requester: true,
        firstLayerApprover: { select: { name: true, email: true } },
        secondLayerApprover: { select: { name: true, email: true } },
        thirdLayerApprover: { select: { name: true, email: true } },
      },
    });

    if (!approval) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check authorization
    const canView =
      (session.user as any).role === "ADMIN" ||
      approval.requesterId === (session.user as any).id ||
      approval.firstLayerApproverId === (session.user as any).id ||
      approval.secondLayerApproverId === (session.user as any).id ||
      approval.thirdLayerApproverId === (session.user as any).id;

    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ approval });
  } catch (error) {
    console.error("GET /api/approvals/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, feedback, layer } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const approval = await prisma.approval.findUnique({
      where: { id: params.id },
      include: {
        requester: { select: { name: true, email: true } },
        firstLayerApprover: { select: { name: true, email: true } },
        secondLayerApprover: { select: { name: true, email: true } },
        thirdLayerApprover: { select: { name: true, email: true } },
      },
    });

    if (!approval) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify approver
    const isApprover =
      (layer === 1 && approval.firstLayerApproverId === (session.user as any).id) ||
      (layer === 2 && approval.secondLayerApproverId === (session.user as any).id) ||
      (layer === 3 && approval.thirdLayerApproverId === (session.user as any).id);

    if (!isApprover) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const layerField = `layer${layer === 1 ? "First" : layer === 2 ? "Second" : "Third"}`;

    const updateData: any = {
      [`${layerField}Status`]: action === "approve" ? "APPROVED" : "REJECTED",
      [`${layerField}ReviewedAt`]: new Date(),
      [`${layerField}Feedback`]: feedback,
    };

    if (action === "approve") {
      if (layer < 3) {
        updateData.currentLayer = layer + 1;
        updateData.status = "PENDING";
      } else {
        updateData.status = "APPROVED";
      }
    } else {
      updateData.status = "REJECTED";
    }

    const updated = await prisma.approval.update({
      where: { id: params.id },
      data: updateData,
      include: {
        requester: true,
        firstLayerApprover: { select: { name: true, email: true } },
        secondLayerApprover: { select: { name: true, email: true } },
        thirdLayerApprover: { select: { name: true, email: true } },
      },
    });

    // Create notifications
    if (action === "approve" && layer < 3) {
      const nextApprover =
        layer === 1
          ? updated.secondLayerApprover
          : updated.thirdLayerApprover;

      if (nextApprover) {
        await prisma.notification.create({
          data: {
            userId: nextApprover?.id!,
            approvalId: updated.id,
            type: "APPROVAL_REQUEST",
            title: `Approval Ready for Layer ${layer + 1}`,
            message: `"${updated.title}" is ready for your review`,
          },
        });
      }
    } else if (action === "approve" && layer === 3) {
      await prisma.notification.create({
        data: {
          userId: updated.requesterId,
          approvalId: updated.id,
          type: "APPROVAL_APPROVED",
          title: "Approval Completed",
          message: `Your approval for "${updated.title}" has been completed`,
        },
      });
    } else if (action === "reject") {
      await prisma.notification.create({
        data: {
          userId: updated.requesterId,
          approvalId: updated.id,
          type: "APPROVAL_REJECTED",
          title: "Approval Rejected",
          message: `Your approval for "${updated.title}" was rejected`,
        },
      });
    }

    return NextResponse.json({ approval: updated });
  } catch (error) {
    console.error("PUT /api/approvals/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}