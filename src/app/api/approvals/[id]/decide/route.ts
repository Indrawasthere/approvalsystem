import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notificationService } from "@/services/notifications";
import { z } from "zod";

const decideSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT", "REQUEST_REVISION"]),
  feedback: z.string().min(1, "Feedback is required"),
});

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
        secondLayerApprover: { select: { id: true, name: true, email: true } },
        thirdLayerApprover: { select: { id: true, name: true, email: true } },
      },
    });

    if (!approval) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const { decision, feedback } = decideSchema.parse(body);

    // Determine which layer the current user is
    let userLayer: number | null = null;
    if (approval.firstLayerApproverId === (session.user as any).id) userLayer = 1;
    else if (approval.secondLayerApproverId === (session.user as any).id) userLayer = 2;
    else if (approval.thirdLayerApproverId === (session.user as any).id) userLayer = 3;

    if (!userLayer) {
      return NextResponse.json({ error: "You are not an approver for this" }, { status: 403 });
    }

    // Verify user can only act on their turn
    // Layer 1 can act anytime if it's PENDING
    // Layer 2 can act only if Layer 1 APPROVED and Layer 2 PENDING
    // Layer 3 can act only if Layer 1 & 2 APPROVED and Layer 3 PENDING
    const canAct = (() => {
      if (approval.status !== "PENDING" && approval.status !== "NEEDS_REVISION") {
        return false; // Already finalized
      }

      if (userLayer === 1) {
        return approval.firstLayerStatus === "PENDING";
      } else if (userLayer === 2) {
        return (
          approval.firstLayerStatus === "APPROVED" &&
          approval.secondLayerStatus === "PENDING"
        );
      } else if (userLayer === 3) {
        return (
          approval.firstLayerStatus === "APPROVED" &&
          approval.secondLayerStatus === "APPROVED" &&
          approval.thirdLayerStatus === "PENDING"
        );
      }
      return false;
    })();

    if (!canAct) {
      return NextResponse.json(
        { error: "It's not your turn to approve or approval is already decided" },
        { status: 403 }
      );
    }

    // Build update data based on decision
    let updateData: any = {};
    const layerField = `${userLayer === 1 ? "first" : userLayer === 2 ? "second" : "third"}Layer`;

    if (decision === "APPROVE") {
      // Move to next layer or complete
      updateData[`${layerField}Status`] = "APPROVED";
      updateData[`${layerField}ReviewedAt`] = new Date();
      updateData[`${layerField}Feedback`] = feedback;

      if (userLayer < 3) {
        // Move to next layer
        updateData.currentLayer = userLayer + 1;
        updateData.status = "PENDING"; // Stay pending for next layer
      } else {
        // Layer 3 approved - COMPLETE!
        updateData.status = "APPROVED";
      }
    } else if (decision === "REJECT") {
      // Hard rejection - back to requester but CANNOT revise
      updateData[`${layerField}Status`] = "REJECTED";
      updateData[`${layerField}ReviewedAt`] = new Date();
      updateData[`${layerField}Feedback`] = feedback;
      updateData.status = "REJECTED";
      updateData.rejectionNote = feedback;
    } else if (decision === "REQUEST_REVISION") {
      // Soft rejection - requester can revise and resubmit
      updateData[`${layerField}Status`] = "REJECTED";
      updateData[`${layerField}ReviewedAt`] = new Date();
      updateData[`${layerField}Feedback`] = feedback;
      updateData.status = "NEEDS_REVISION";

      // Track revision
      const revisionHistory = Array.isArray(approval.revisionHistory)
        ? approval.revisionHistory
        : [];
      revisionHistory.push({
        rejectedAt: new Date().toISOString(),
        rejectedBy: (session.user as any).name,
        rejectedAtLayer: userLayer,
        feedback,
        resubmittedAt: null,
      });
      updateData.revisionHistory = revisionHistory;
      updateData.revisionCount = (approval.revisionCount || 0) + 1;
    }

    const updated = await prisma.approval.update({
      where: { id: params.id },
      data: updateData,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        firstLayerApprover: { select: { id: true, name: true, email: true } },
        secondLayerApprover: { select: { id: true, name: true, email: true } },
        thirdLayerApprover: { select: { id: true, name: true, email: true } },
      },
    });

    // Create appropriate notifications based on decision
    if (decision === "APPROVE") {
      if (userLayer < 3) {
        // Notify next layer approver
        const nextApprover =
          userLayer === 1
            ? updated.secondLayerApprover
            : updated.thirdLayerApprover;

        if (nextApprover) {
          await notificationService.createNotification(nextApprover.id, {
            type: "LAYER_READY",
            title: `Approval Ready for Layer ${userLayer + 1} Review`,
            message: `"${updated.title}" is ready for your review (Layer ${userLayer + 1})`,
            approvalId: updated.id,
          });
        }
      } else {
        // Layer 3 approved - notify requester
        await notificationService.createNotification(updated.requester.id, {
          type: "APPROVAL_APPROVED",
          title: "Approval Completed ✅",
          message: `Your approval "${updated.title}" has been fully approved!`,
          approvalId: updated.id,
        });
      }
    } else if (decision === "REJECT") {
      // Hard rejection - notify requester
      await notificationService.createNotification(updated.requester.id, {
        type: "APPROVAL_REJECTED",
        title: "Approval Rejected ❌",
        message: `Your approval "${updated.title}" was rejected by Layer ${userLayer}. Reason: ${feedback}`,
        approvalId: updated.id,
      });
    } else if (decision === "REQUEST_REVISION") {
      // Soft rejection - notify requester
      await notificationService.createNotification(updated.requester.id, {
        type: "NEEDS_REVISION",
        title: "Revision Needed 🔄",
        message: `Layer ${userLayer} approver requested revision. Feedback: ${feedback}`,
        approvalId: updated.id,
      });
    }

    return NextResponse.json({ approval: updated });
  } catch (error) {
    console.error("POST /api/approvals/[id]/decide error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}