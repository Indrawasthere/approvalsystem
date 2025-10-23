// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getDashboardData(userId: string, userRole: string) {
  let where: any = {};

  if (userRole === "REQUESTER") {
    where = { requesterId: userId };
  } else if (userRole !== "ADMIN") {
    where = {
      OR: [
        { requesterId: userId },
        { firstLayerApproverId: userId },
        { secondLayerApproverId: userId },
        { thirdLayerApproverId: userId },
      ],
    };
  }

  const [total, pending, approved, rejected] = await Promise.all([
    prisma.approval.count({ where }),
    prisma.approval.count({ where: { ...where, status: "PENDING" } }),
    prisma.approval.count({ where: { ...where, status: "APPROVED" } }),
    prisma.approval.count({ where: { ...where, status: "REJECTED" } }),
  ]);

  const recent = await prisma.approval.findMany({
    where,
    include: { requester: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return { total, pending, approved, rejected, recent };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getDashboardData(
    (session.user as any).id,
    (session.user as any).role
  );
  const userName = (session.user as any).name?.split(" ")[0] || "User";

  return (
    <main className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-slate-400">
            Here's your approval workflow dashboard
          </p>
        </div>
        {(session.user as any).role === "REQUESTER" && (
          <Link href="/dashboard/approvals/new">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
              + New Approval Request
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Approvals"
          value={data.total}
          description="All time approvals"
          icon={<FileText className="w-5 h-5" />}
        />
        <StatsCard
          title="Pending"
          value={data.pending}
          description="Awaiting review"
          icon={<Clock className="w-5 h-5" />}
          trend={{ value: 5, isPositive: false }}
        />
        <StatsCard
          title="Approved"
          value={data.approved}
          description="Successfully approved"
          icon={<CheckCircle className="w-5 h-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Rejected"
          value={data.rejected}
          description="Needs revision"
          icon={<AlertCircle className="w-5 h-5" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Approvals</h2>
        <div className="space-y-3">
          {data.recent.length > 0 ? (
            data.recent.map((approval) => (
              <Link
                key={approval.id}
                href={`/dashboard/approvals/${approval.id}`}
              >
                <div className="p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors cursor-pointer border border-slate-600 hover:border-blue-500/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{approval.title}</p>
                      <p className="text-sm text-slate-400">
                        by {approval.requester.name}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        approval.status === "APPROVED"
                          ? "bg-green-500/20 text-green-400"
                          : approval.status === "REJECTED"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {approval.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-400 text-center py-8">No approvals yet</p>
          )}
        </div>
      </div>
    </main>
  );
}
