/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Test script to verify RBAC is working correctly
 * 
 * Usage: npx tsx scripts/test-rbac-system.ts
 */

import { PrismaClient } from '@prisma/client';
import { ROLE_PERMISSIONS } from '../src/lib/rbac/permissions';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing RBAC System\n');

  const email = 'farazkhld@gmail.com';
  
  // 1. Check database permissions
  console.log('1️⃣ Checking Database Permissions...');
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    process.exit(1);
  }

  const customPermissions = (user as any).permissions || [];
  console.log(`   User: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Custom Permissions Count: ${customPermissions.length}`);
  
  // 2. Check what permissions will be used
  console.log('\n2️⃣ Checking Effective Permissions...');
  
  const effectivePermissions = customPermissions.length > 0 
    ? customPermissions 
    : ROLE_PERMISSIONS[user.role] || [];
  
  console.log(`   Using: ${customPermissions.length > 0 ? 'Custom' : 'Default Role'} Permissions`);
  console.log(`   Total Permissions: ${effectivePermissions.length}`);
  
  // 3. Test homepage permissions
  console.log('\n3️⃣ Testing Homepage Permissions...');
  
  const hasHomepageView = effectivePermissions.includes('homepage.view') || 
                          effectivePermissions.includes('homepage.*');
  const hasHomepageEdit = effectivePermissions.includes('homepage.edit') || 
                          effectivePermissions.includes('homepage.*');
  
  console.log(`   ✅ homepage.view: ${hasHomepageView ? 'GRANTED' : 'DENIED'}`);
  console.log(`   ${hasHomepageEdit ? '✅' : '❌'} homepage.edit: ${hasHomepageEdit ? 'GRANTED' : 'DENIED'}`);
  
  // 4. Test the permission check function
  console.log('\n4️⃣ Testing Permission Check Function...');
  
  const { hasPermission } = await import('../src/lib/rbac/check-permission');
  
  const rbacUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    roleLevel: (user as any).roleLevel || 10,
    permissions: customPermissions,
  };
  
  const canView = hasPermission(rbacUser, 'homepage.view');
  const canEdit = hasPermission(rbacUser, 'homepage.edit');
  
  console.log(`   ✅ hasPermission('homepage.view'): ${canView ? 'true' : 'false'}`);
  console.log(`   ${canEdit ? '✅' : '❌'} hasPermission('homepage.edit'): ${canEdit ? 'true' : 'false'}`);
  
  // 5. Expected behavior
  console.log('\n5️⃣ Expected Behavior:');
  console.log(`   - User should ${hasHomepageView ? 'SEE' : 'NOT SEE'} homepage CMS`);
  console.log(`   - Edit buttons should be ${hasHomepageEdit ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   - API calls to edit should ${hasHomepageEdit ? 'SUCCEED' : 'RETURN 403'}`);
  
  if (!canEdit) {
    console.log('\n✅ RBAC IS WORKING CORRECTLY');
    console.log('   User does NOT have homepage.edit permission');
    console.log('   Edit buttons should be disabled (showing lock icons)');
    console.log('\n💡 To see the changes:');
    console.log('   1. Log out of the application');
    console.log('   2. Log back in as farazkhld@gmail.com');
    console.log('   3. Navigate to /admin/homepage-cms');
    console.log('   4. Verify edit buttons show lock icons and are disabled');
  } else {
    console.log('\n⚠️  WARNING: User CAN edit homepage');
    console.log('   Either permission was not removed, or RBAC logic is broken');
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
