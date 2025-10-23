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
  where: { email: 'mhmdfdln14@gmail.com' },
  update: {},
  create: {
    email: 'mhmdfdln14@gmail.com',
    name: 'Requester',
    password: await bcrypt.hash('requester123', 12),
    role: 'REQUESTER',
    department: 'Testing',
  },
});

const approver1 = await prisma.user.upsert({
  where: { email: 'aquaswing4@gmail.com' },
  update: {},
  create: {
    email: 'aquaswing4@gmail.com',
    name: 'Approver 1',
    password: await bcrypt.hash('approver123', 12),
    role: 'FIRST_APPROVER',
    department: 'Testing',
  },
});

  const approver2 = await prisma.user.upsert({
    where: { email: 'vc.ag@atreusg.com' },
    update: {},
    create: {
      email: 'vc.ag@atreusg.com',
      name: 'Approver 2',
      password: approverPassword,
      role: 'SECOND_APPROVER',
      department: 'Demo Department',
    },
  });

  const approver3 = await prisma.user.upsert({
    where: { email: 'muhammad.hafiz@atreusg.com' },
    update: {},
    create: {
      email: 'muhammad.hafiz@atreusg.com',
      name: 'Approver 3',
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
