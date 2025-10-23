import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const requesterPassword = await bcrypt.hash('requester123', 12);
  const approverPassword = await bcrypt.hash('approver123', 12);

  // 1. Create Requester
  const requester = await prisma.user.upsert({
    where: { email: 'mhmdfdln14@gmail.com' },
    update: {
      password: requesterPassword,
      role: 'REQUESTER',
      isActive: true,
    },
    create: {
      email: 'mhmdfdln14@gmail.com',
      name: 'Muhammad Fadlan',
      password: requesterPassword,
      role: 'REQUESTER',
      department: 'Tech and Product',
      isActive: true,
    },
  });

  // 2. Create Layer 1 Approver
  const approver1 = await prisma.user.upsert({
    where: { email: 'aquaswing4@gmail.com' },
    update: {
      password: approverPassword,
      role: 'FIRST_APPROVER',
      isActive: true,
    },
    create: {
      email: 'aquaswing4@gmail.com',
      name: 'Layer 1 Approver',
      password: approverPassword,
      role: 'FIRST_APPROVER',
      department: 'Head of Department',
      isActive: true,
    },
  });

  // 3. Create Layer 2 Approver
  const approver2 = await prisma.user.upsert({
    where: { email: 'vc.ag@atreusg.com' },
    update: {
      password: approverPassword,
      role: 'SECOND_APPROVER',
      isActive: true,
    },
    create: {
      email: 'vc.ag@atreusg.com',
      name: 'Layer 2 Approver',
      password: approverPassword,
      role: 'SECOND_APPROVER',
      department: 'Finance',
      isActive: true,
    },
  });

  // 4. Create Layer 3 Approver
  const approver3 = await prisma.user.upsert({
    where: { email: 'muhammad.hafiz@atreusg.com' },
    update: {
      password: approverPassword,
      role: 'THIRD_APPROVER',
      isActive: true,
    },
    create: {
      email: 'muhammad.hafiz@atreusg.com',
      name: 'Layer 3 Approver',
      password: approverPassword,
      role: 'THIRD_APPROVER',
      department: 'CEO',
      isActive: true,
    },
  });

  // 5. Clean up old dummy approvers
  console.log('🗑️ Cleaning up old approvers...');
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'approver1@approvalhub.com',
          'approver2@approvalhub.com',
          'approver3@approvalhub.com',
          'requester@approvalhub.com',
          'admin@approvalhub.com',
        ]
      }
    }
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Created users:');
  console.log(`  Requester: ${requester.email} / requester123`);
  console.log(`  Layer 1: ${approver1.email} / approver123`);
  console.log(`  Layer 2: ${approver2.email} / approver123`);
  console.log(`  Layer 3: ${approver3.email} / approver123`);
  console.log('\n🔐 All passwords: requester123 or approver123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });