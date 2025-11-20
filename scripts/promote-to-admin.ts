/**
 * Promote a user to ADMIN role
 * Usage: npx tsx scripts/promote-to-admin.ts --email=user@example.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const emailArg = args.find(arg => arg.startsWith('--email='));
  
  if (!emailArg) {
    console.error('❌ Please provide an email address:');
    console.error('   npx tsx scripts/promote-to-admin.ts --email=user@example.com');
    process.exit(1);
  }

  const email = emailArg.split('=')[1];
  
  console.log(`🔄 Promoting ${email} to ADMIN role...\n`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`📋 Current role: ${user.role}`);

    const updated = await prisma.user.update({
      where: { email },
      data: { 
        role: 'ADMIN',
      },
    });

    console.log(`✅ Successfully promoted ${email} to ADMIN role`);
    console.log(`📋 New role: ${updated.role}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
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
