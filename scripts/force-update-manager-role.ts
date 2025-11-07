/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Direct SQL Migration: Update MANAGER to ADMIN
 * 
 * This uses direct SQL to update the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Checking for MANAGER roles...\n');

  try {
    // Simple query without type casting
    const users = await prisma.$queryRaw<Array<{ id: string; email: string; role: string }>>`
      SELECT id, email, role FROM users WHERE role = 'MANAGER'
    `;

    console.log(`📊 Found ${users.length} users with MANAGER role`);

    if (users.length === 0) {
      console.log('✅ No MANAGER roles found!');
      return;
    }

    // Update each user
    for (const user of users) {
      console.log(`  Updating ${user.email}...`);
      await prisma.$executeRaw`
        UPDATE users SET role = 'ADMIN' WHERE id = ${user.id}
      `;
    }

    console.log(`\n✅ Updated ${users.length} user(s) to ADMIN role`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
