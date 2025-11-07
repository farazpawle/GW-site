/**
 * Check what roles exist in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking user roles in database...\n');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log(`📊 Found ${users.length} users:\n`);
    
    users.forEach(user => {
      console.log(`- ${user.email}`);
      console.log(`  Name: ${user.name || 'N/A'}`);
      console.log(`  Role: ${user.role}`);
      console.log('');
    });

    // Count by role
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📈 Role distribution:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
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
