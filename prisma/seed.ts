import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo users...');

  // Hash passwords
  const requesterPassword = await bcrypt.hash('requester123', 12);
  const approverPassword = await bcrypt.hash('approver123', 12);

  // Create requester
  const requester = await prisma.user.upsert({
    where: { email: 'requester@approvalhub.com' },
    update: {},
    create: {
      email: 'requester@approvalhub.com',
      name: 'Demo Requester',
      password: requesterPassword,
      role: 'REQUESTER',
      department: 'Demo Department',
    },
  });

  // Create approvers
  const approver1 = await prisma.user.upsert({
    where: { email: 'approver1@approvalhub.com' },
    update: {},
    create: {
      email: 'approver1@approvalhub.com',
      name: 'Demo Approver 1',
      password: approverPassword,
      role: 'FIRST_APPROVER',
      department: 'Demo Department',
    },
  });

  const approver2 = await prisma.user.upsert({
    where: { email: 'approver2@approvalhub.com' },
    update: {},
    create: {
      email: 'approver2@approvalhub.com',
      name: 'Demo Approver 2',
      password: approverPassword,
      role: 'SECOND_APPROVER',
      department: 'Demo Department',
    },
  });

  const approver3 = await prisma.user.upsert({
    where: { email: 'approver3@approvalhub.com' },
    update: {},
    create: {
      email: 'approver3@approvalhub.com',
      name: 'Demo Approver 3',
      password: approverPassword,
      role: 'THIRD_APPROVER',
      department: 'Demo Department',
    },
  });

  console.log('Demo users created:', {
    requester: requester.email,
    approver1: approver1.email,
    approver2: approver2.email,
    approver3: approver3.email
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
