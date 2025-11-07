/**
 * RBAC Migration Script
 * 
 * Migrates existing users to the new RBAC system by:
 * 1. Converting ADMIN role to SUPER_ADMIN
 * 2. Assigning default permissions based on roles
 * 3. Setting roleLevel for all users
 * 
 * Run this script AFTER updating the database schema and deploying the RBAC code.
 * 
 * Usage: npx tsx scripts/migrate-to-rbac.ts [--dry-run]
 */

import { PrismaClient, UserRole } from '@prisma/client';
import { ROLE_PERMISSIONS, ROLE_LEVELS } from '../src/lib/rbac/permissions';

const prisma = new PrismaClient();

// ============================================================================
// CONFIGURATION
// ============================================================================

const DRY_RUN = process.argv.includes('--dry-run');

// ============================================================================
// MIGRATION LOGIC
// ============================================================================

async function migrateToRBAC() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        RBAC SYSTEM MIGRATION SCRIPT                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be saved to the database\n');
  }

  try {
    // Step 1: Fetch all users
    console.log('📊 Fetching all users from database...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        roleLevel: true,
      },
    });

    console.log(`✅ Found ${users.length} users\n`);

    if (users.length === 0) {
      console.log('⚠️  No users found in database. Exiting.');
      return;
    }

    // Step 2: Prepare updates
    console.log('🔄 Preparing user updates...\n');

    const updates: Array<{
      id: string;
      email: string;
      oldRole: UserRole;
      newRole: UserRole;
      roleLevel: number;
      permissions: string[];
    }> = [];

    for (const user of users) {
      let newRole = user.role;
      let roleLevel = user.roleLevel || ROLE_LEVELS.VIEWER;
      let permissions = user.permissions || [];

      // Convert legacy ADMIN role to SUPER_ADMIN
      if (user.role === 'ADMIN') {
        newRole = 'SUPER_ADMIN';
        roleLevel = ROLE_LEVELS.SUPER_ADMIN;
        permissions = ROLE_PERMISSIONS.SUPER_ADMIN;
        
        console.log(`  🔄 ${user.email}`);
        console.log(`     OLD: ADMIN (no roleLevel, no permissions)`);
        console.log(`     NEW: SUPER_ADMIN (level ${roleLevel}) with ${permissions.length} permissions`);
        console.log('');
      } else {
        // Assign default role level and permissions if missing
        const needsRoleLevel = user.roleLevel === null || user.roleLevel === undefined;
        const needsPermissions = !user.permissions || user.permissions.length === 0;

        if (needsRoleLevel || needsPermissions) {
          roleLevel = ROLE_LEVELS[user.role] || ROLE_LEVELS.VIEWER;
          permissions = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.VIEWER;

          console.log(`  🔄 ${user.email}`);
          console.log(`     ROLE: ${user.role}`);
          if (needsRoleLevel) {
            console.log(`     ASSIGNING: roleLevel = ${roleLevel}`);
          }
          if (needsPermissions) {
            console.log(`     ASSIGNING: ${permissions.length} default permissions`);
          }
          console.log('');
        }
      }

      updates.push({
        id: user.id,
        email: user.email,
        oldRole: user.role,
        newRole,
        roleLevel,
        permissions,
      });
    }

    // Step 3: Apply updates
    if (updates.length === 0) {
      console.log('✅ All users are already up-to-date. No migration needed.\n');
      return;
    }

    console.log(`\n📝 Summary: ${updates.length} users need updates\n`);

    if (!DRY_RUN) {
      console.log('💾 Applying updates to database...\n');

      for (const update of updates) {
        await prisma.user.update({
          where: { id: update.id },
          data: {
            role: update.newRole,
            roleLevel: update.roleLevel,
            permissions: update.permissions,
          },
        });

        console.log(`  ✅ Updated ${update.email}`);
      }

      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('ℹ️  DRY RUN - No changes were saved');
      console.log('   To apply these changes, run: npx tsx scripts/migrate-to-rbac.ts\n');
    }

    // Step 4: Display final statistics
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                  MIGRATION STATISTICS                      ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    
    const roleCount = updates.reduce((acc, u) => {
      acc[u.newRole] = (acc[u.newRole] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [role, count] of Object.entries(roleCount)) {
      console.log(`║  ${role.padEnd(20)} : ${String(count).padStart(3)} users`);
    }
    
    console.log('╚════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================================================
// VERIFY MIGRATION (Optional check)
// ============================================================================

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...\n');

  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        roleLevel: true,
        permissions: true,
      },
    });

    let issuesFound = 0;

    for (const user of users) {
      const issues: string[] = [];

      // Check 1: roleLevel should not be null
      if (user.roleLevel === null || user.roleLevel === undefined) {
        issues.push('Missing roleLevel');
      }

      // Check 2: roleLevel should match role
      const expectedLevel = ROLE_LEVELS[user.role];
      if (user.roleLevel !== expectedLevel) {
        issues.push(`roleLevel mismatch (expected ${expectedLevel}, got ${user.roleLevel})`);
      }

      // Check 3: Should have permissions
      if (!user.permissions || user.permissions.length === 0) {
        issues.push('No permissions assigned');
      }

      // Check 4: No ADMIN role should exist (should be SUPER_ADMIN)
      if (user.role === 'ADMIN') {
        issues.push('Still using legacy ADMIN role');
      }

      if (issues.length > 0) {
        issuesFound++;
        console.log(`  ⚠️  ${user.email}:`);
        issues.forEach((issue) => console.log(`     - ${issue}`));
        console.log('');
      }
    }

    if (issuesFound === 0) {
      console.log('✅ Migration verification passed! All users are correctly configured.\n');
    } else {
      console.log(`⚠️  Found ${issuesFound} user(s) with issues. Please review and fix.\n`);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================================================
// RUN MIGRATION
// ============================================================================

async function main() {
  if (process.argv.includes('--verify')) {
    await verifyMigration();
  } else {
    await migrateToRBAC();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
