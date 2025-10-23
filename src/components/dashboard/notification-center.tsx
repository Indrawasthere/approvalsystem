"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  approval?: {
    id: string;
    title: string;
    approvalCode: string;
    status: string;
  };
}

export function NotificationCenter() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notifications: Notification[] = data?.notifications || [];
  const unreadCount: number = data?.unreadCount || 0;

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (!res.ok) throw new Error("Failed to mark as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
    if (notification.approval?.id) {
      router.push(`/dashboard/approvals/${notification.approval.id}`);
      setOpen(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "APPROVAL_REQUEST":
      case "LAYER_READY":
        return "🔔";
      case "APPROVAL_APPROVED":
        return "✅";
      case "APPROVAL_REJECTED":
        return "❌";
      case "NEEDS_REVISION":
        return "🔄";
      default:
        return "📧";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "APPROVAL_REQUEST":
      case "LAYER_READY":
        return "text-blue-400";
      case "APPROVAL_APPROVED":
        return "text-green-400";
      case "APPROVAL_REJECTED":
        return "text-red-400";
      case "NEEDS_REVISION":
        return "text-orange-400";
      default:
        return "text-slate-400";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-slate-700 text-slate-300 hover:text-white"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] bg-slate-900 border-slate-700 p-0"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Notifications</h3>
            <p className="text-xs text-slate-400">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              className="text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-800"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              <p className="mt-2 text-sm">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-xs mt-1">We'll notify you when something happens</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-slate-800 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-slate-800/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-2xl">
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p
                          className={`text-sm font-semibold ${
                            !notification.isRead ? "text-white" : "text-slate-300"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                        {notification.message}
                      </p>

                      {notification.approval && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">
                            {notification.approval.approvalCode}
                          </span>
                          <span className={getTypeColor(notification.approval.status)}>
                            {notification.approval.status}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-slate-500 mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-700 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-800 w-full"
              onClick={() => {
                router.push("/dashboard/notifications");
                setOpen(false);
              }}
            >
              View all notifications →
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}