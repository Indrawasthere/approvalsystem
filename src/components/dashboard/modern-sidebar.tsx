"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileText,
  Plus,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Bell,
  Search,
  Command,
  Home,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
  { name: "My Approvals", href: "/dashboard/approvals", icon: FileText, badge: null },
  { name: "New Request", href: "/dashboard/approvals/new", icon: Plus, badge: null },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, badge: null, adminOnly: true },
  { name: "Users", href: "/dashboard/admin/users", icon: Users, badge: null, adminOnly: true },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, badge: null },
];

interface AppSidebarProps {
  userRole?: string;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative flex flex-col h-screen border-r bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-700 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo & Toggle */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <span className="font-semibold text-lg text-white">4ProveIt</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-slate-800"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => {
              if (item.adminOnly && userRole !== "ADMIN") return null;
              
              const isActive = pathname === item.href;
              const Icon = item.icon;

              const navItem = (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 transition-all text-white hover:bg-slate-800 hover:text-white",
                      isActive && "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.badge && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Button>
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-2">
                      {item.name}
                      {item.badge && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return navItem;
            })}
          </nav>
        </ScrollArea>

        <Separator />

        {/* Footer */}
        <div className="p-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950",
              isCollapsed && "justify-center px-2"
            )}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}