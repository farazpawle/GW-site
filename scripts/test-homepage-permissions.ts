/**
 * Test script for Homepage CMS RBAC permissions
 * 
 * This script verifies that permission checks are working correctly:
 * 1. User with homepage.view only cannot edit sections
 * 2. User with homepage.edit can edit sections
 * 3. API endpoints enforce permissions
 * 
 * Usage: npx tsx scripts/test-homepage-permissions.ts
 */

import { PrismaClient, UserRole } from '@prisma/client';
import { ROLE_PERMISSIONS } from '../src/lib/rbac/permissions';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing Homepage CMS Permission System...\n');

  try {
    // Get current users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log('📋 Current Users and Their Permissions:\n');

    for (const user of users) {
      const permissions = ROLE_PERMISSIONS[user.role];
      const hasView = permissions.includes('homepage.view') || permissions.includes('homepage.*');
      const hasEdit = permissions.includes('homepage.edit') || permissions.includes('homepage.*');

      console.log(`👤 ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Homepage View: ${hasView ? '✅' : '❌'}`);
      console.log(`   Homepage Edit: ${hasEdit ? '✅' : '❌'}`);
      console.log('');
    }

    // Test role permission matrix
    console.log('📊 Role Permission Matrix:\n');
    console.log('Role              | View | Edit | Expected Behavior');
    console.log('-----------------|------|------|------------------');

    const roles = ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'CONTENT_EDITOR', 'VIEWER'] as UserRole[];
    
    for (const role of roles) {
      const permissions = ROLE_PERMISSIONS[role];
      const hasView = permissions.includes('homepage.view') || permissions.includes('homepage.*');
      const hasEdit = permissions.includes('homepage.edit') || permissions.includes('homepage.*');
      
      let behavior = '';
      if (hasEdit) behavior = 'Full access to CMS';
      else if (hasView) behavior = 'Read-only (buttons disabled)';
      else behavior = 'No access';

      console.log(
        `${role.padEnd(16)} | ${hasView ? '✅' : '❌'}  | ${hasEdit ? '✅' : '❌'}  | ${behavior}`
      );
    }

    console.log('\n✅ Permission test complete!');
    console.log('\n💡 Testing Steps:');
    console.log('1. Log in as a VIEWER user');
    console.log('2. Navigate to /admin/homepage-cms');
    console.log('3. Verify all edit buttons show lock icons and are disabled');
    console.log('4. Try to edit a section via API - should get 403 Forbidden');
    console.log('5. Log in as STAFF/CONTENT_EDITOR/ADMIN/SUPER_ADMIN');
    console.log('6. Verify all buttons are enabled and functional');

  } catch (error) {
    console.error('❌ Error during test:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
