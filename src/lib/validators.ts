import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
  department: z.string().optional(),
});

export const approvalSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
  documentType: z.enum(["ICC", "QUOTATION", "PROPOSAL"]),
});

export const approvalActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  feedback: z.string().optional(),
  layer: z.number().min(1).max(3),
});

// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@approvalhub.com" },
    update: {},
    create: {
      email: "admin@approvalhub.com",
      name: "System Admin",
      password: adminPassword,
      role: "ADMIN",
      department: "IT",
    },
  });

  // Approvers
  const layer1Password = await bcrypt.hash("approver123", 12);
  const layer1 = await prisma.user.upsert({
    where: { email: "approver1@approvalhub.com" },
    update: {},
    create: {
      email: "approver1@approvalhub.com",
      name: "First Layer Approver",
      password: layer1Password,
      role: "FIRST_APPROVER",
      department: "Management",
    },
  });

  const layer2Password = await bcrypt.hash("approver123", 12);
  const layer2 = await prisma.user.upsert({
    where: { email: "approver2@approvalhub.com" },
    update: {},
    create: {
      email: "approver2@approvalhub.com",
      name: "Second Layer Approver",
      password: layer2Password,
      role: "SECOND_APPROVER",
      department: "Finance",
    },
  });

  const layer3Password = await bcrypt.hash("approver123", 12);
  const layer3 = await prisma.user.upsert({
    where: { email: "approver3@approvalhub.com" },
    update: {},
    create: {
      email: "approver3@approvalhub.com",
      name: "Third Layer Approver",
      password: layer3Password,
      role: "THIRD_APPROVER",
      department: "Executive",
    },
  });

  // Requester
  const requesterPassword = await bcrypt.hash("requester123", 12);
  const requester = await prisma.user.upsert({
    where: { email: "requester@approvalhub.com" },
    update: {},
    create: {
      email: "requester@approvalhub.com",
      name: "John Doe",
      password: requesterPassword,
      role: "REQUESTER",
      department: "Sales",
    },
  });

  console.log("✅ Seeded users:");
  console.log(`  Admin: admin@approvalhub.com / admin123`);
  console.log(`  Layer 1 Approver: approver1@approvalhub.com / approver123`);
  console.log(`  Layer 2 Approver: approver2@approvalhub.com / approver123`);
  console.log(`  Layer 3 Approver: approver3@approvalhub.com / approver123`);
  console.log(`  Requester: requester@approvalhub.com / requester123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });