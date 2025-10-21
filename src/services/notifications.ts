import { prisma } from "@/lib/db";
import { emailService } from "./email";

class NotificationService {
  private baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  async createNotification(
    userId: string,
    data: {
      type: "APPROVAL_REQUEST" | "APPROVAL_APPROVED" | "APPROVAL_REJECTED" | "NEEDS_REVISION" | "LAYER_READY";
      title: string;
      message: string;
      approvalId?: string;
    }
  ) {
    try {
      // Create in-app notification
      const notification = await prisma.notification.create({
        data: {
          userId,
          approvalId: data.approvalId,
          type: data.type,
          title: data.title,
          message: data.message,
        },
      });

      // Get user and approval details for email
      const [user, approval] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        }),
        data.approvalId
          ? prisma.approval.findUnique({
              where: { id: data.approvalId },
              include: {
                requester: { select: { name: true, email: true } },
              },
            })
          : null,
      ]);

      if (!user || !approval) return notification;

      // Send email based on notification type
      const emailData = {
        recipientName: user.name,
        recipientEmail: user.email,
        approval: {
          id: approval.id,
          title: approval.title,
          code: approval.approvalCode,
          type: approval.documentType,
          dueDate: approval.dueDate || undefined,
        },
        sender: {
          name: approval.requester.name,
          email: approval.requester.email,
        },
        feedback: approval.rejectionNote || undefined,
        layer: approval.currentLayer,
        actionUrl: `${this.baseUrl}/dashboard/approvals/${approval.id}`,
      };

      switch (data.type) {
        case "APPROVAL_REQUEST":
          await emailService.sendApprovalRequest(emailData);
          break;
        case "LAYER_READY":
          await emailService.sendLayerReady(emailData);
          break;
        case "APPROVAL_APPROVED":
          await emailService.sendApprovalCompleted(emailData);
          break;
        case "NEEDS_REVISION":
          await emailService.sendNeedsRevision(emailData);
          break;
        case "APPROVAL_REJECTED":
          await emailService.sendApprovalRejected(emailData);
          break;
      }

      return notification;
    } catch (error) {
      console.error("Notification creation error:", error);
    }
  }

  async getNotifications(userId: string, limit = 20) {
    return await prisma.notification.findMany({
      where: { userId },
      include: {
        approval: { select: { id: true, title: true, approvalCode: true, status: true } },
      },
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

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
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