"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  FileText,
  Plus,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Bell,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Approvals", href: "/dashboard/approvals", icon: FileText },
  { name: "New Approval", href: "/dashboard/approvals/new", icon: Plus },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Users", href: "/dashboard/admin/users", icon: Users, adminOnly: true },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface ModernSidebarProps {
  userRole?: string;
}

export function ModernSidebar({ userRole }: ModernSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white transition-all duration-300 fixed left-0 top-0 z-40 border-r border-slate-800",
          isOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-slate-900">A</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ApprovalHub
              </span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className={cn("w-5 h-5 transition-transform", !isOpen && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              if (item.adminOnly && userRole !== "ADMIN") return null;
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-600/50"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 flex-shrink-0", isOpen && "mr-3")} />
                    {isOpen && <span className="text-sm">{item.name}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t border-slate-800 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className={cn("w-5 h-5 flex-shrink-0", isOpen && "mr-3")} />
            {isOpen && <span className="text-sm">Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-slate-800 border-t border-slate-700 px-2 py-2 z-40">
        <div className="flex justify-around">
          {navigation.slice(0, 4).map((item) => {
            if (item.adminOnly && userRole !== "ADMIN") return null;
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <button
                  className={cn(
                    "p-3 rounded-lg transition-all",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}