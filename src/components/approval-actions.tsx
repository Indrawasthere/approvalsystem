"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ApprovalActionsProps {
  approvalId: string;
  userId: string;
  approval: any;
}

export function ApprovalActions({ approvalId, userId, approval }: ApprovalActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState("");

  const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
    if (!comments.trim()) {
      toast.error("Please provide a comment for your decision");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/approvals/${approvalId}/decide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decision,
          comments: comments.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit decision");
      }

      toast.success(`Approval ${decision.toLowerCase()} successfully!`);
      router.refresh();
    } catch (error) {
      console.error("Error submitting decision:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which layer the current user is
  let userLayer: number | null = null;
  if (approval.firstLayerApproverId === userId) userLayer = 1;
  else if (approval.secondLayerApproverId === userId) userLayer = 2;
  else if (approval.thirdLayerApproverId === userId) userLayer = 3;

  // Check if it's the user's turn to approve
  const canAct = (() => {
    if (!userLayer) return false;

    switch (userLayer) {
      case 1:
        return approval.status === "PENDING" && !approval.firstLayerDecision;
      case 2:
        return (
          approval.status === "PENDING" &&
          approval.firstLayerDecision === "APPROVED" &&
          !approval.secondLayerDecision
        );
      case 3:
        return (
          approval.status === "PENDING" &&
          approval.secondLayerDecision === "APPROVED" &&
          !approval.thirdLayerDecision
        );
      default:
        return false;
    }
  })();

  if (!canAct) return null;

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Your Decision
        </CardTitle>
        <CardDescription>
          Review and provide your decision on this approval request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="comments" className="text-white">
            Comments *
          </Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 mt-1"
            placeholder="Provide your comments or reasoning for the decision..."
            rows={3}
          />
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={() => handleDecision("APPROVED")}
            disabled={isSubmitting || !comments.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? "Approving..." : "Approve"}
          </Button>
          <Button
            onClick={() => handleDecision("REJECTED")}
            disabled={isSubmitting || !comments.trim()}
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
