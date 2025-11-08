/**
 * Temporarily change a user's role to VIEWER for testing
 * 
 * Usage: npx tsx scripts/set-user-to-viewer.ts <email>
 * Example: npx tsx scripts/set-user-to-viewer.ts farazkhld@gmail.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: npx tsx scripts/set-user-to-viewer.ts <email>');
    process.exit(1);
  }

  console.log(`🔄 Changing role to VIEWER for: ${email}\n`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    process.exit(1);
  }

  console.log(`Current role: ${user.role}`);

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { role: 'VIEWER' },
  });

  console.log(`✅ Role updated to: ${updatedUser.role}`);
  console.log('\n💡 Test the homepage CMS now:');
  console.log('1. Log in as this user');
  console.log('2. Go to /admin/homepage-cms');
  console.log('3. Verify buttons are disabled with lock icons');
  console.log('\n🔄 To restore, run:');
  console.log(`   npx tsx scripts/promote-to-admin.ts ${email} CONTENT_EDITOR`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
