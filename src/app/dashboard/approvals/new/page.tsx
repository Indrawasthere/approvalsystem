import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ApprovalForm } from "@/components/forms/approval-form";

async function getUsers() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true, role: true, department: true },
    orderBy: { name: "asc" },
  });
  return users;
}

export default async function NewApprovalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Only requesters can create new approvals
  if ((session.user as any).role !== "REQUESTER") {
    redirect("/dashboard");
  }

  const users = await getUsers();

  return (
    <main className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Approval</h1>
          <p className="text-slate-400">
            Submit a new approval request for review and approval
          </p>
        </div>

        {/* Form */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-6">
          <ApprovalForm users={users} />
        </div>
      </div>
    </main>
  );
}
