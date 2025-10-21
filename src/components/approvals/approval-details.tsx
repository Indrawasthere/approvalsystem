import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApprovalDetailsProps {
  approval: any;
}

export function ApprovalDetails({ approval }: ApprovalDetailsProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Description</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {approval.description || "No description provided"}
          </p>
        </div>

        {approval.rejectionNote && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <h4 className="text-sm font-semibold text-red-400 mb-1">
              Rejection Reason
            </h4>
            <p className="text-sm text-red-200">{approval.rejectionNote}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}