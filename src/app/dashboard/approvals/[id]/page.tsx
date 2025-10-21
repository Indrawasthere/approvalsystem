import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApprovalTimeline } from "@/components/approvals/approval-timeline";
import { ApprovalActions } from "@/components/approvals/approval-actions";
import { ApprovalDetails } from "@/components/approvals/approval-details";
import { RevisionHistory } from "@/components/approvals/revision-history";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

async function getApprovalDetail(id: string) {
  const approval = await prisma.approval.findUnique({
    where: { id },
    include: {
      requester: true,
      firstLayerApprover: true,
      secondLayerApprover: true,
      thirdLayerApprover: true,
    },
  });
  return approval;
}

export default async function ApprovalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const approval = await getApprovalDetail(params.id);

  if (!approval) {
    redirect("/dashboard/approvals");
  }

  // Check authorization
  const canView =
    (session.user as any).role === "ADMIN" ||
    approval.requesterId === (session.user as any).id ||
    approval.firstLayerApproverId === (session.user as any).id ||
    approval.secondLayerApproverId === (session.user as any).id ||
    approval.thirdLayerApproverId === (session.user as any).id;

  if (!canView) {
    redirect("/dashboard/approvals");
  }

  // Determine user's role in this approval
  let userRole = "viewer";
  if (approval.requesterId === (session.user as any).id) userRole = "requester";
  if (approval.firstLayerApproverId === (session.user as any).id) userRole = "layer1";
  if (approval.secondLayerApproverId === (session.user as any).id) userRole = "layer2";
  if (approval.thirdLayerApproverId === (session.user as any).id) userRole = "layer3";
  if ((session.user as any).role === "ADMIN") userRole = "admin";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-400";
      case "REJECTED":
        return "bg-red-500/20 text-red-400";
      case "NEEDS_REVISION":
        return "bg-orange-500/20 text-orange-400";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <main className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <Link href="/dashboard/approvals">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Approvals
          </Button>
        </Link>
      </div>

      {/* Title Section */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{approval.title}</h1>
            <p className="text-sm text-slate-400 mt-1">
              Code: <span className="font-mono text-blue-400">{approval.approvalCode}</span>
            </p>
          </div>
          <Badge className={`${getStatusColor(approval.status)}`}>
            {approval.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Timeline & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <ApprovalTimeline approval={approval} />

          {/* Document */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{approval.documentName}</p>
                  <p className="text-xs text-slate-400">
                    {(approval.documentSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <a
                  href={approval.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Document
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Approval Details */}
          <ApprovalDetails approval={approval} />

          {/* Revision History */}
          {approval.revisionCount > 0 && (
            <RevisionHistory approval={approval} />
          )}
        </div>

        {/* Right: Action Panel */}
        <div className="space-y-6">
          {/* Quick Status */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1">Overall Status</p>
                <Badge className={`${getStatusColor(approval.status)} w-full justify-center`}>
                  {approval.status}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Layer Progress</p>
                <div className="space-y-2">
                  {[1, 2, 3].map((layer) => (
                    <div
                      key={layer}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        layer <= approval.currentLayer
                          ? "bg-blue-600/20 text-blue-300"
                          : "bg-slate-700/50 text-slate-400"
                      }`}
                    >
                      Layer {layer}: {layer <= approval.currentLayer ? "Active" : "Pending"}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">SLA Deadline</p>
                <p className="text-sm font-mono text-white">
                  {approval.dueDate
                    ? new Date(approval.dueDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              {approval.revisionCount > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Revisions</p>
                  <p className="text-lg font-bold text-orange-400">#{approval.revisionCount}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Card */}
          <ApprovalActions
            approval={approval}
            userRole={userRole}
            currentUserId={(session.user as any).id}
          />

          {/* Info */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <p className="text-slate-400">Submitted by</p>
                <p className="text-white font-medium">{approval.requester.name}</p>
              </div>
              <div>
                <p className="text-slate-400">Created</p>
                <p className="text-white">
                  {new Date(approval.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Last Updated</p>
                <p className="text-white">
                  {new Date(approval.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Type</p>
                <p className="text-white font-mono">{approval.documentType}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}