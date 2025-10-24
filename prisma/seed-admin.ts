import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('👑 Creating admin user...');

  const adminPassword = await bcrypt.hash('@admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@atreusg.com' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: 'admin@atreusg.com',
      name: 'System Administrator',
      password: adminPassword,
      role: 'ADMIN',
      department: 'IT',
      isActive: true,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log(`📧 Email: ${admin.email}`);
  console.log(`🔑 Password: admin123`);
  console.log(`👤 Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
