/**
 * Check user's saved permissions in database
 * Usage: npx tsx scripts/check-user-permissions.ts <email>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'farazkhld@gmail.com';

  console.log(`🔍 Checking permissions for: ${email}\n`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    process.exit(1);
  }

  console.log('📋 User Details:');
  console.log('  Email:', user.email);
  console.log('  Role:', user.role);
  console.log('  Role Level:', (user as any).roleLevel || 10);
  console.log('\n🔑 Permissions Array:');
  
  const permissions = (user as any).permissions || [];
  
  if (permissions.length === 0) {
    console.log('  ⚠️  EMPTY - Will use default role permissions');
  } else {
    console.log(`  ✅ ${permissions.length} custom permissions:`);
    permissions.forEach((perm: string) => {
      console.log(`     - ${perm}`);
    });
  }

  console.log('\n🏠 Homepage Permissions:');
  const hasViewHomepage = permissions.includes('homepage.view') || permissions.includes('homepage.*');
  const hasEditHomepage = permissions.includes('homepage.edit') || permissions.includes('homepage.*');
  
  console.log(`  View: ${hasViewHomepage ? '✅ Yes' : '❌ No'}`);
  console.log(`  Edit: ${hasEditHomepage ? '✅ Yes' : '❌ No'}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
