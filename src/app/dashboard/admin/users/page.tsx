import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Building,
} from "lucide-react";

async function getUsers(search?: string, role?: string, department?: string) {
  const where: any = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role && role !== "ALL") {
    where.role = role;
  }

  if (department && department !== "ALL") {
    where.department = department;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      phone: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          approvalsAsRequester: true,
          approvalsAsFirstApprover: true,
          approvalsAsSecondApprover: true,
          approvalsAsThirdApprover: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get unique departments for filter
  const departments = await prisma.user.findMany({
    where: { isActive: true, department: { not: null } },
    select: { department: true },
    distinct: ["department"],
  });

  return {
    users,
    departments: departments.map((d) => d.department).filter(Boolean),
  };
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string; role?: string; department?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Only admins can access this page
  if ((session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const search = searchParams.search || "";
  const role = searchParams.role || "ALL";
  const department = searchParams.department || "ALL";

  const { users, departments } = await getUsers(search, role, department);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/20 text-red-400";
      case "APPROVER":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-green-500/20 text-green-400";
    }
  };

  const getTotalApprovals = (user: any) => {
    return (
      user._count.approvalsAsRequester +
      user._count.approvalsAsFirstApprover +
      user._count.approvalsAsSecondApprover +
      user._count.approvalsAsThirdApprover
    );
  };

  return (
    <main className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            User Management
          </h1>
          <p className="text-slate-400">Manage users, roles, and permissions</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  defaultValue={search}
                />
              </div>
            </div>
            <Select defaultValue={role}>
              <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem
                  value="ALL"
                  className="text-white hover:bg-slate-600"
                >
                  All Roles
                </SelectItem>
                <SelectItem
                  value="REQUESTER"
                  className="text-white hover:bg-slate-600"
                >
                  Requester
                </SelectItem>
                <SelectItem
                  value="APPROVER"
                  className="text-white hover:bg-slate-600"
                >
                  Approver
                </SelectItem>
                <SelectItem
                  value="ADMIN"
                  className="text-white hover:bg-slate-600"
                >
                  Admin
                </SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue={department}>
              <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem
                  value="ALL"
                  className="text-white hover:bg-slate-600"
                >
                  All Departments
                </SelectItem>
                {departments.map((dept) => (
                  <SelectItem
                    key={dept}
                    value={dept}
                    className="text-white hover:bg-slate-600"
                  >
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Approvals
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-slate-900">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-slate-400 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-slate-400 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getRoleColor(user.role)} border`}>
                          {user.role === "ADMIN" && (
                            <Shield className="w-3 h-3 mr-1" />
                          )}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-slate-400" />
                          {user.department || "Not set"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {getTotalApprovals(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 hover:bg-slate-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-slate-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{users.length}</p>
                <p className="text-sm text-slate-400">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-red-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {users.filter((u) => u.role === "ADMIN").length}
                </p>
                <p className="text-sm text-slate-400">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserPlus className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {users.filter((u) => u.role === "APPROVER").length}
                </p>
                <p className="text-sm text-slate-400">Approvers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-cyan-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {users.filter((u) => u.role === "REQUESTER").length}
                </p>
                <p className="text-sm text-slate-400">Requesters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
