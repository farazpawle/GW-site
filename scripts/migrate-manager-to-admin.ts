/**
 * Migration Script: Update MANAGER role to ADMIN
 * 
 * This script updates all users with MANAGER role to ADMIN role
 * to match the renamed role in the system.
 * 
 * Usage: npx tsx scripts/migrate-manager-to-admin.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting MANAGER to ADMIN migration...\n');

  try {
    // Find all users with MANAGER role (if any exist)
    const managersCount = await prisma.$executeRaw`
      SELECT COUNT(*) FROM users WHERE role = 'MANAGER'
    `;
    
    console.log(`📊 Found ${managersCount} users with MANAGER role`);

    if (managersCount === 0) {
      console.log('✅ No users with MANAGER role found. Migration not needed.');
      return;
    }

    // Update all MANAGER users to ADMIN
    const result = await prisma.$executeRaw`
      UPDATE users 
      SET role = 'ADMIN'::"UserRole"
      WHERE role = 'MANAGER'::"UserRole"
    `;

    console.log(`✅ Updated ${result} user(s) from MANAGER to ADMIN role`);
    console.log('\n🎉 Migration completed successfully!');

  } catch (error: any) {
    // If MANAGER enum value doesn't exist anymore, that's actually fine
    if (error.message.includes('invalid input value for enum')) {
      console.log('ℹ️  MANAGER enum value already removed from schema');
      console.log('✅ No migration needed - all users already updated');
      return;
    }
    
    console.error('❌ Migration failed:', error);
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
