/**
 * Test /api/auth/me endpoint
 * This directly tests what the endpoint returns
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAuthMeLogic() {
  console.log('\n🧪 Testing /api/auth/me Logic\n');
  console.log('=' .repeat(60));
  
  try {
    const email = 'farazkhld@gmail.com';
    
    // Simulate what getCurrentUser() returns
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📦 User object from database:');
    console.log(JSON.stringify(user, null, 2));

    console.log('\n🔍 Has permissions field?', 'permissions' in user);
    console.log('🔍 Permissions value:', user.permissions);
    console.log('🔍 Permissions length:', user.permissions?.length);

    // Simulate the OLD buggy logic (always returned role defaults)
    const { ROLE_PERMISSIONS } = await import('../src/lib/rbac/permissions');
    const oldPermissions = ROLE_PERMISSIONS[user.role];
    
    console.log('\n❌ OLD LOGIC (Buggy):');
    console.log('   Always returned:', oldPermissions);
    console.log('   Includes homepage.edit?', oldPermissions.includes('homepage.edit'));

    // Simulate the NEW fixed logic
    const newPermissions = user.permissions && user.permissions.length > 0
      ? user.permissions
      : ROLE_PERMISSIONS[user.role];
    
    console.log('\n✅ NEW LOGIC (Fixed):');
    console.log('   Returns:', newPermissions);
    console.log('   Includes homepage.edit?', newPermissions.includes('homepage.edit'));

    console.log('\n' + '=' .repeat(60));
    console.log('🎯 RESULT:');
    if (!newPermissions.includes('homepage.edit')) {
      console.log('✅ homepage.edit permission is DENIED');
      console.log('✅ UI should show lock icons and disabled buttons');
    } else {
      console.log('⚠️  homepage.edit permission is ALLOWED');
      console.log('⚠️  UI will show edit/delete buttons as enabled');
    }
    console.log('=' .repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthMeLogic();
