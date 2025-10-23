import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Search, Filter, Plus, Eye, Edit, Clock, CheckCircle, XCircle } from "lucide-react";

async function getApprovals(userId: string, userRole: string, search?: string, status?: string, page: number = 1) {
  const limit = 10;
  const offset = (page - 1) * limit;

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

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  const [approvals, total] = await Promise.all([
    prisma.approval.findMany({
      where,
      include: {
        requester: { select: { name: true, email: true } },
        firstLayerApprover: { select: { name: true } },
        secondLayerApprover: { select: { name: true } },
        thirdLayerApprover: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.approval.count({ where }),
  ]);

  return { approvals, total, totalPages: Math.ceil(total / limit) };
}

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; page?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const search = searchParams.search || "";
  const status = searchParams.status || "ALL";
  const page = parseInt(searchParams.page || "1");

  const { approvals, total, totalPages } = await getApprovals(
    (session.user as any).id,
    (session.user as any).role,
    search,
    status,
    page
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-400";
      case "REJECTED":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  return (
    <main className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Approvals</h1>
          <p className="text-slate-400">
            Manage and track all your approval requests
          </p>
        </div>
        {(session.user as any).role === "REQUESTER" && (
          <Link href="/dashboard/approvals/new">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Approval Request
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search approvals..."
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                defaultValue={search}
              />
            </div>
          </div>
          <Select defaultValue={status}>
            <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="ALL" className="text-white hover:bg-slate-600">All Status</SelectItem>
              <SelectItem value="PENDING" className="text-white hover:bg-slate-600">Pending</SelectItem>
              <SelectItem value="APPROVED" className="text-white hover:bg-slate-600">Approved</SelectItem>
              <SelectItem value="REJECTED" className="text-white hover:bg-slate-600">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {approvals.length > 0 ? (
                approvals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{approval.title}</div>
                      <div className="text-sm text-slate-400 truncate max-w-xs">
                        {approval.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(approval.status)}
                        <span className={`ml-2 text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(approval.status)}`}>
                          {approval.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {approval.requester.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/dashboard/approvals/${approval.id}`}>
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-slate-600">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No approvals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/dashboard/approvals?page=${pageNum}&search=${search}&status=${status}`}
              >
                <Button
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  className={pageNum === page ? "bg-blue-600 hover:bg-blue-700" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
                >
                  {pageNum}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
