/**
 * Reset User Permissions to Role Defaults
 * 
 * This script clears custom permissions for all users, forcing them to use
 * the default permissions defined in ROLE_PERMISSIONS.
 * 
 * When to use:
 * - After updating role permission definitions
 * - When permissions in database are outdated
 * - To ensure all users get the latest permission sets
 * 
 * Usage:
 * npm run script -- scripts/reset-permissions-to-defaults.ts [role]
 * 
 * Examples:
 * npm run script -- scripts/reset-permissions-to-defaults.ts
 * npm run script -- scripts/reset-permissions-to-defaults.ts SUPER_ADMIN
 * npm run script -- scripts/reset-permissions-to-defaults.ts ADMIN
 */

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetRole = process.argv[2] as UserRole | undefined;

  console.log('🔄 Resetting user permissions to role defaults...\n');

  try {
    // Build where clause
    const where = targetRole ? { role: targetRole } : {};

    // Find affected users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
      },
    });

    if (users.length === 0) {
      console.log(targetRole 
        ? `⚠️  No users found with role ${targetRole}`
        : '⚠️  No users found'
      );
      return;
    }

    console.log(`Found ${users.length} user(s) to update:\n`);

    // Show current state
    users.forEach((user) => {
      console.log(`📧 ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Custom Permissions: ${user.permissions.length > 0 ? user.permissions.join(', ') : 'None (using role defaults)'}\n`);
    });

    // Ask for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    await new Promise<void>((resolve) => {
      readline.question(
        '⚠️  This will clear all custom permissions and use role defaults. Continue? (yes/no): ',
        async (answer: string) => {
          readline.close();
          
          if (answer.toLowerCase() !== 'yes') {
            console.log('\n❌ Operation cancelled');
            resolve();
            return;
          }

          // Update users
          const result = await prisma.user.updateMany({
            where,
            data: {
              permissions: [],
            },
          });

          console.log(`\n✅ Successfully reset permissions for ${result.count} user(s)`);
          console.log('\n📋 Summary:');
          console.log('   - Custom permissions cleared');
          console.log('   - Users will now use default permissions from ROLE_PERMISSIONS');
          console.log('   - Changes take effect immediately (users may need to refresh)');

          resolve();
        }
      );
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
