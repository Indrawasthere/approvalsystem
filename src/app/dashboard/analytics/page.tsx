import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Activity
} from "lucide-react";
import AnalyticsCharts from "@/components/analytics-charts";

async function getAnalyticsData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Overall stats
  const [totalApprovals, pendingApprovals, approvedApprovals, rejectedApprovals] = await Promise.all([
    prisma.approval.count(),
    prisma.approval.count({ where: { status: "PENDING" } }),
    prisma.approval.count({ where: { status: "APPROVED" } }),
    prisma.approval.count({ where: { status: "REJECTED" } }),
  ]);

  // Monthly data for the last 6 months
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const [created, approved, rejected] = await Promise.all([
      prisma.approval.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      prisma.approval.count({
        where: {
          status: "APPROVED",
          updatedAt: { gte: monthStart, lte: monthEnd }
        }
      }),
      prisma.approval.count({
        where: {
          status: "REJECTED",
          updatedAt: { gte: monthStart, lte: monthEnd }
        }
      }),
    ]);

    monthlyData.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      created,
      approved,
      rejected,
    });
  }

  // Recent activity (last 7 days)
  const recentActivity = await prisma.approval.findMany({
    where: {
      updatedAt: { gte: sevenDaysAgo }
    },
    include: {
      requester: { select: { name: true } }
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  // Department stats - get departments from users
  const departmentStats = await prisma.user.groupBy({
    by: ['department'],
    _count: { id: true },
    where: { department: { not: null } },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  // Priority distribution - since priority doesn't exist on approval, we'll use a different approach
  const priorityStats = [
    { priority: "LOW", _count: { id: 0 } },
    { priority: "MEDIUM", _count: { id: 0 } },
    { priority: "HIGH", _count: { id: 0 } },
    { priority: "URGENT", _count: { id: 0 } },
  ];

  // Average approval time (in days)
  const approvedApprovalsWithTime = await prisma.approval.findMany({
    where: {
      status: "APPROVED"
    },
    select: {
      createdAt: true,
      updatedAt: true,
    },
  });

  const avgApprovalTime = approvedApprovalsWithTime.length > 0
    ? approvedApprovalsWithTime.reduce((acc, approval) => {
        const diffTime = approval.updatedAt.getTime() - approval.createdAt.getTime();
        return acc + (diffTime / (1000 * 60 * 60 * 24)); // Convert to days
      }, 0) / approvedApprovalsWithTime.length
    : 0;

  return {
    totalApprovals,
    pendingApprovals,
    approvedApprovals,
    rejectedApprovals,
    monthlyData,
    recentActivity,
    departmentStats,
    priorityStats,
    avgApprovalTime: Math.round(avgApprovalTime * 10) / 10, // Round to 1 decimal
  };
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getAnalyticsData();

  const approvalRate = data.totalApprovals > 0
    ? Math.round((data.approvedApprovals / data.totalApprovals) * 100)
    : 0;

  return (
    <main className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-slate-400">
          Insights and trends for your approval workflow
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Approvals</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.totalApprovals}</div>
            <p className="text-xs text-slate-400">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{approvalRate}%</div>
            <p className="text-xs text-slate-400">Success rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Avg. Approval Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{data.avgApprovalTime}</div>
            <p className="text-xs text-slate-400">Days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pending</CardTitle>
            <Activity className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{data.pendingApprovals}</div>
            <p className="text-xs text-slate-400">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts data={data} />
    </main>
  );
}
