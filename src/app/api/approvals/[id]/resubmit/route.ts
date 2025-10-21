import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notificationService } from "@/services/notifications";

export async function POST(
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
        requester: { select: { id: true, name: true, email: true } },
        firstLayerApprover: { select: { id: true, name: true, email: true } },
      },
    });

    if (!approval) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Only requester can resubmit
    if (approval.requesterId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Can only resubmit if NEEDS_REVISION
    if (approval.status !== "NEEDS_REVISION") {
      return NextResponse.json(
        { error: "Approval is not in revision state" },
        { status: 400 }
      );
    }

    // Reset to Layer 1
    const revisionHistory = Array.isArray(approval.revisionHistory)
      ? approval.revisionHistory
      : [];

    // Mark last revision as resubmitted
    if (revisionHistory.length > 0) {
      revisionHistory[revisionHistory.length - 1].resubmittedAt = new Date();
    }

    const updated = await prisma.approval.update({
      where: { id: params.id },
      data: {
        // Reset to Layer 1
        currentLayer: 1,
        status: "PENDING",
        firstLayerStatus: "PENDING",
        secondLayerStatus: "PENDING",
        thirdLayerStatus: "PENDING",
        // Clear feedback from layers that were set before
        firstLayerReviewedAt: null,
        firstLayerFeedback: null,
        secondLayerReviewedAt: null,
        secondLayerFeedback: null,
        thirdLayerReviewedAt: null,
        thirdLayerFeedback: null,
        revisionHistory,
        updatedAt: new Date(),
      },
      include: {
        requester: { select: { name: true, email: true } },
        firstLayerApprover: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify Layer 1 approver that resubmission is ready
    if (updated.firstLayerApprover) {
      await notificationService.createNotification(
        updated.firstLayerApprover.id,
        {
          type: "LAYER_READY",
          title: `Revised Approval Ready for Review`,
          message: `"${updated.title}" has been revised and resubmitted by ${updated.requester.name}. (Revision #${updated.revisionCount})`,
          approvalId: updated.id,
        }
      );
    }

    return NextResponse.json({ approval: updated });
  } catch (error) {
    console.error("POST /api/approvals/[id]/resubmit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}