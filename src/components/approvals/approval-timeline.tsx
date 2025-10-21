import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  User,
} from "lucide-react";

interface ApprovalTimelineProps {
  approval: any;
}

export function ApprovalTimeline({ approval }: ApprovalTimelineProps) {
  const layers = [
    {
      number: 1,
      name: "Layer 1",
      approver: approval.firstLayerApprover?.name,
      status: approval.firstLayerStatus,
      feedback: approval.firstLayerFeedback,
      reviewedAt: approval.firstLayerReviewedAt,
      isDone: approval.firstLayerStatus !== "PENDING",
    },
    {
      number: 2,
      name: "Layer 2",
      approver: approval.secondLayerApprover?.name,
      status: approval.secondLayerStatus,
      feedback: approval.secondLayerFeedback,
      reviewedAt: approval.secondLayerReviewedAt,
      isDone: approval.secondLayerStatus !== "PENDING",
    },
    {
      number: 3,
      name: "Layer 3",
      approver: approval.thirdLayerApprover?.name,
      status: approval.thirdLayerStatus,
      feedback: approval.thirdLayerFeedback,
      reviewedAt: approval.thirdLayerReviewedAt,
      isDone: approval.thirdLayerStatus !== "PENDING",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="w-6 h-6 text-green-400" />;
      case "REJECTED":
        return <XCircle className="w-6 h-6 text-red-400" />;
      case "PENDING":
        return <Clock className="w-6 h-6 text-yellow-400 animate-spin" />;
      default:
        return <Clock className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusBgColor = (status: string, isDone: boolean) => {
    if (!isDone) return "bg-slate-700/50";
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20";
      case "REJECTED":
        return "bg-red-500/20";
      default:
        return "bg-slate-700/50";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Approval Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {layers.map((layer, index) => (
            <div key={layer.number}>
              {/* Layer Box */}
              <div
                className={`p-4 rounded-lg border border-slate-600 ${getStatusBgColor(
                  layer.status,
                  layer.isDone
                )}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(layer.status)}
                    <div>
                      <h3 className="font-semibold text-white">{layer.name}</h3>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {layer.approver || "Not assigned"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      layer.status === "APPROVED"
                        ? "bg-green-500/20 text-green-400"
                        : layer.status === "REJECTED"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {layer.status}
                  </span>
                </div>

                {layer.feedback && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-xs text-slate-400 mb-1">Feedback:</p>
                    <p className="text-sm text-slate-200">{layer.feedback}</p>
                  </div>
                )}

                {layer.reviewedAt && (
                  <div className="mt-2 text-xs text-slate-400">
                    Reviewed: {new Date(layer.reviewedAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-slate-600 to-slate-700" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}