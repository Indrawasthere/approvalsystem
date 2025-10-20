import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ModernSidebar } from "@/components/dashboard/modern-sidebar";
import { ModernHeader } from "@/components/dashboard/modern-header";
import { Providers } from "@/components/providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <Providers>
      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <ModernSidebar userRole={(session.user as any)?.role} />
        <div className="flex flex-col flex-1">
          <ModernHeader />
          <div className="flex-1 overflow-y-auto md:ml-64 mb-20 md:mb-0">
            {children}
          </div>
        </div>
      </div>
    </Providers>
  );
}
