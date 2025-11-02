/**
 * Check Users and Roles Script
 * Shows all users in the database with their roles
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking users in database...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (users.length === 0) {
    console.log('❌ No users found in database!');
    console.log('');
    console.log('This means:');
    console.log('  1. You need to sign up first at /sign-up');
    console.log('  2. After signing up, the user will be auto-created');
    console.log('  3. Then run this script again to see your user');
    console.log('  4. Then promote yourself to admin using:');
    console.log('     node --import tsx scripts/setup-super-admin.ts --email=YOUR_EMAIL');
    console.log('');
    return;
  }

  console.log(`✅ Found ${users.length} user(s):\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt.toLocaleString()}`);
    console.log('');
  });

  const adminCount = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length;
  const viewerCount = users.filter(u => u.role === 'VIEWER').length;

  console.log('📊 Summary:');
  console.log(`   Admins: ${adminCount}`);
  console.log(`   Viewers: ${viewerCount}`);
  console.log('');

  if (adminCount === 0) {
    console.log('⚠️  WARNING: No admin users found!');
    console.log('');
    console.log('To promote a user to admin, run:');
    console.log(`   node --import tsx scripts/setup-super-admin.ts --email=YOUR_EMAIL`);
    console.log('');
    console.log('Example:');
    if (users.length > 0) {
      console.log(`   node --import tsx scripts/setup-super-admin.ts --email=${users[0].email}`);
    }
    console.log('');
  } else {
    console.log('✅ You have admin access configured!');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
