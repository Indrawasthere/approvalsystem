// prisma/update-approvers.ts
// Jalankan: npx tsx prisma/update-approvers.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateApprovers() {
  console.log('🔄 Updating approver emails...');

  const approverPassword = await bcrypt.hash('approver123', 12);

  try {
    // Update or create approvers dengan email yang bener
    const approver1 = await prisma.user.upsert({
      where: { email: 'aquaswing4@gmail.com' },
      update: {
        role: 'FIRST_APPROVER',
        password: approverPassword,
        isActive: true,
      },
      create: {
        email: 'aquaswing4@gmail.com',
        name: 'Approver 1',
        password: approverPassword,
        role: 'FIRST_APPROVER',
        department: 'Testing',
        isActive: true,
      },
    });

    const approver2 = await prisma.user.upsert({
      where: { email: 'vc.ag@atreusg.com' },
      update: {
        role: 'SECOND_APPROVER',
        password: approverPassword,
        isActive: true,
      },
      create: {
        email: 'vc.ag@atreusg.com',
        name: 'Approver 2',
        password: approverPassword,
        role: 'SECOND_APPROVER',
        department: 'Testing',
        isActive: true,
      },
    });

    const approver3 = await prisma.user.upsert({
      where: { email: 'muhammad.hafiz@atreusg.com' },
      update: {
        role: 'THIRD_APPROVER',
        password: approverPassword,
        isActive: true,
      },
      create: {
        email: 'muhammad.hafiz@atreusg.com',
        name: 'Approver 3',
        password: approverPassword,
        role: 'THIRD_APPROVER',
        department: 'Testing',
        isActive: true,
      },
    });

    // IMPORTANT: Hapus approver lama yang pake @approvalhub.com
    console.log('🗑️ Removing old dummy approvers...');
    
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'approver1@approvalhub.com',
            'approver2@approvalhub.com',
            'approver3@approvalhub.com',
          ]
        }
      }
    });

    console.log('✅ Approvers updated successfully!');
    console.log({
      approver1: approver1.email,
      approver2: approver2.email,
      approver3: approver3.email,
    });

  } catch (error) {
    console.error('❌ Error updating approvers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateApprovers();