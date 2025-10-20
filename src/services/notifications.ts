import { prisma } from "@/lib/db";

class NotificationService {
  async createNotification(
    userId: string,
    data: {
      type: "APPROVAL_REQUEST" | "APPROVAL_APPROVED" | "APPROVAL_REJECTED" | "NEEDS_REVISION";
      title: string;
      message: string;
      approvalId?: string;
    }
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          approvalId: data.approvalId,
          type: data.type,
          title: data.title,
          message: data.message,
        },
      });

      // TODO: Send email notification (mock for now)
      console.log(`📧 Notification: ${data.title} - ${data.message}`);

      return notification;
    } catch (error) {
      console.error("Notification creation error:", error);
    }
  }

  async getNotifications(userId: string, limit = 20) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}

export const notificationService = new NotificationService();