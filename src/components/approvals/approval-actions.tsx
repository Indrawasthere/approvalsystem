"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Loader,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApprovalActionsProps {
  approval: any;
  userRole: string;
  currentUserId: string;
}

export function ApprovalActions({
  approval,
  userRole,
  currentUserId,
}: ApprovalActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [actionType, setActionType] = useState("approve");

  // Determine if user can act
  const canApprove = (() => {
    if (approval.status !== "PENDING" && approval.status !== "NEEDS_REVISION") {
      return false;
    }

    if (userRole === "layer1") {
      return approval.firstLayerStatus === "PENDING";
    } else if (userRole === "layer2") {
      return (
        approval.firstLayerStatus === "APPROVED" &&
        approval.secondLayerStatus === "PENDING"
      );
    } else if (userRole === "layer3") {
      return (
        approval.firstLayerStatus === "APPROVED" &&
        approval.secondLayerStatus === "APPROVED" &&
        approval.thirdLayerStatus === "PENDING"
      );
    }
    return false;
  })();

  const canResubmit =
    userRole === "requester" && approval.status === "NEEDS_REVISION";

  const handleDecision = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please provide feedback for your decision",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/approvals/${approval.id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: actionType.toUpperCase(),
          feedback,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit decision");
      }

      toast({
        title: "Success",
        description: "Decision submitted successfully!",
      });
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/approvals/${approval.id}/resubmit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to resubmit");
      }

      toast({
        title: "Success",
        description: "Approval resubmitted for review!",
      });
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (canApprove) {
    return (
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Your Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white text-sm mb-2 block">
              Action
            </Label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="approve" className="text-white hover:bg-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Approve
                  </div>
                </SelectItem>
                <SelectItem value="request_revision" className="text-white hover:bg-slate-600">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    Request Revision
                  </div>
                </SelectItem>
                <SelectItem value="reject" className="text-white hover:bg-slate-600">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    Reject
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="feedback" className="text-white text-sm mb-2 block">
              Feedback/Comments *
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-24"
              placeholder="Provide your feedback or reason for this decision..."
            />
          </div>

          <Button
            onClick={handleDecision}
            disabled={isSubmitting || !feedback.trim()}
            className={`w-full ${
              actionType === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : actionType === "request_revision"
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            {isSubmitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
            Submit Decision
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (canResubmit) {
    return (
      <Card className="bg-gradient-to-br from-blue-800/50 to-cyan-800/50 border-blue-600">
        <CardHeader>
          <CardTitle className="text-blue-200">Resubmit Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              Your approval needs revision. After updating the document, click
              resubmit to send it for review again.
            </p>
          </div>

          <Button
            onClick={handleResubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
            <RotateCcw className="w-4 h-4 mr-2" />
            Resubmit for Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}