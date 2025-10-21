import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

interface RevisionHistoryProps {
  approval: any;
}

export function RevisionHistory({ approval }: RevisionHistoryProps) {
  const revisions = Array.isArray(approval.revisionHistory)
    ? approval.revisionHistory
    : [];

  if (revisions.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          Revision History ({revisions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {revisions.map((revision: any, index: number) => (
          <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-white">
                  Revision #{index + 1}
                </p>
                <p className="text-xs text-slate-400">
                  Rejected by {revision.rejectedBy} at Layer {revision.rejectedAtLayer}
                </p>
              </div>
              <Badge className="bg-orange-500/20 text-orange-400">
                {revision.resubmittedAt ? "Resubmitted" : "Pending"}
              </Badge>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-600 space-y-1 text-xs">
              <p className="text-slate-300">
                <span className="text-slate-400">Feedback:</span> {revision.feedback}
              </p>
              <p className="text-slate-400">
                Rejected: {new Date(revision.rejectedAt).toLocaleString()}
              </p>
              {revision.resubmittedAt && (
                <p className="text-slate-400">
                  Resubmitted: {new Date(revision.resubmittedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}