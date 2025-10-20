import { prisma } from "@/lib/db";

class ApprovalService {
  async getApprovalsByUser(userId: string, role: string) {
    if (role === "REQUESTER") {
      return await prisma.approval.findMany({
        where: { requesterId: userId },
        include: {
          requester: true,
          firstLayerApprover: { select: { name: true } },
          secondLayerApprover: { select: { name: true } },
          thirdLayerApprover: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "ADMIN") {
      return await prisma.approval.findMany({
        include: {
          requester: true,
          firstLayerApprover: { select: { name: true } },
          secondLayerApprover: { select: { name: true } },
          thirdLayerApprover: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return await prisma.approval.findMany({
        where: {
          OR: [
            { requesterId: userId },
            { firstLayerApproverId: userId },
            { secondLayerApproverId: userId },
            { thirdLayerApproverId: userId },
          ],
        },
        include: {
          requester: true,
          firstLayerApprover: { select: { name: true } },
          secondLayerApprover: { select: { name: true } },
          thirdLayerApprover: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }
  }

  async getApprovalStats(userId: string, role: string) {
    let where: any = {};

    if (role === "REQUESTER") {
      where = { requesterId: userId };
    } else if (role !== "ADMIN") {
      where = {
        OR: [
          { requesterId: userId },
          { firstLayerApproverId: userId },
          { secondLayerApproverId: userId },
          { thirdLayerApproverId: userId },
        ],
      };
    }

    const [total, pending, approved, rejected] = await Promise.all([
      prisma.approval.count({ where }),
      prisma.approval.count({ where: { ...where, status: "PENDING" } }),
      prisma.approval.count({ where: { ...where, status: "APPROVED" } }),
      prisma.approval.count({ where: { ...where, status: "REJECTED" } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      successRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    };
  }
}

export const approvalService = new ApprovalService();