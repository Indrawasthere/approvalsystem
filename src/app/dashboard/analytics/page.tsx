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
      status: "APPROVED",
      updatedAt: { not: null }
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Monthly Trends
            </CardTitle>
            <CardDescription>Approval activity over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.monthlyData.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 text-sm text-slate-400">{month.month}</div>
                    <div className="flex space-x-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
                        <span className="text-xs text-slate-300">{month.created}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
                        <span className="text-xs text-slate-300">{month.approved}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-400 rounded-full mr-1"></div>
                        <span className="text-xs text-slate-300">{month.rejected}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-4 mt-4 text-xs text-slate-400">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
                Created
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
                Approved
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-1"></div>
                Rejected
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Priority Distribution</CardTitle>
            <CardDescription>Breakdown by priority levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.priorityStats.map((priority) => {
                const percentage = data.totalApprovals > 0
                  ? Math.round((priority._count.id / data.totalApprovals) * 100)
                  : 0;

                const getPriorityColor = (priority: string) => {
                  switch (priority) {
                    case "URGENT": return "bg-red-500";
                    case "HIGH": return "bg-orange-500";
                    case "MEDIUM": return "bg-yellow-500";
                    default: return "bg-green-500";
                  }
                };

                return (
                  <div key={priority.priority} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getPriorityColor(priority.priority)} text-white`}>
                        {priority.priority}
                      </Badge>
                      <span className="text-slate-300">{priority._count.id}</span>
                    </div>
                    <span className="text-sm text-slate-400">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Department Stats */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Department Activity
            </CardTitle>
            <CardDescription>Top departments by approval requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.departmentStats.map((dept) => (
                <div key={dept.requesterDepartment} className="flex items-center justify-between">
                  <span className="text-slate-300">{dept.requesterDepartment}</span>
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                    {dept._count.id}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest approval updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-slate-400 text-xs">
                      by {activity.requester.name}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      activity.status === "APPROVED"
                        ? "bg-green-500/20 text-green-400"
                        : activity.status === "REJECTED"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    } text-xs`}
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
