/**
 * Migration Script: Analytics to Dashboard Permissions
 * 
 * This script migrates old analytics permissions to the new granular dashboard permissions.
 * 
 * Migration mapping:
 * - analytics.view → dashboard.statistics (basic stats view)
 * - analytics.export → dashboard.search_analytics (advanced analytics)
 * - analytics.* → All new dashboard.* permissions
 * 
 * Run with: npx tsx scripts/migrate-analytics-to-dashboard.ts
 */

import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/rbac/permissions';

const OLD_PERMISSIONS = {
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  ANALYTICS_ALL: 'analytics.*',
};

// Mapping of old permissions to new ones
const PERMISSION_MAPPING: Record<string, string[]> = {
  [OLD_PERMISSIONS.ANALYTICS_VIEW]: [
    PERMISSIONS.DASHBOARD_STATISTICS,
  ],
  [OLD_PERMISSIONS.ANALYTICS_EXPORT]: [
    PERMISSIONS.DASHBOARD_SEARCH_ANALYTICS,
  ],
  [OLD_PERMISSIONS.ANALYTICS_ALL]: [
    PERMISSIONS.DASHBOARD_MESSAGE_CENTER,
    PERMISSIONS.DASHBOARD_ENGAGEMENT_OVERVIEW,
    PERMISSIONS.DASHBOARD_PRODUCT_INSIGHTS,
    PERMISSIONS.DASHBOARD_SEARCH_ANALYTICS,
    PERMISSIONS.DASHBOARD_STATISTICS,
    PERMISSIONS.DASHBOARD_RECENT_ACTIVITY,
  ],
};

async function migrateAnalyticsToDashboard() {
  console.log('🔄 Starting analytics to dashboard permissions migration...\n');

  try {
    // Get all users with analytics permissions
    const usersWithAnalytics = await prisma.user.findMany({
      where: {
        OR: [
          { permissions: { has: OLD_PERMISSIONS.ANALYTICS_VIEW } },
          { permissions: { has: OLD_PERMISSIONS.ANALYTICS_EXPORT } },
          { permissions: { has: OLD_PERMISSIONS.ANALYTICS_ALL } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
      },
    });

    if (usersWithAnalytics.length === 0) {
      console.log('✅ No users with old analytics permissions found. Nothing to migrate.');
      return;
    }

    console.log(`📋 Found ${usersWithAnalytics.length} user(s) with old analytics permissions:\n`);

    let migrationCount = 0;

    for (const user of usersWithAnalytics) {
      console.log(`👤 Migrating: ${user.name} (${user.email}) - Role: ${user.role}`);
      console.log(`   Current permissions: ${user.permissions.join(', ')}`);

      const currentPermissions = user.permissions || [];
      const newPermissions = new Set<string>(currentPermissions);

      // Track what was changed
      let hasChanges = false;

      // Remove old analytics permissions and add new dashboard ones
      Object.entries(OLD_PERMISSIONS).forEach(([, oldPerm]) => {
        if (currentPermissions.includes(oldPerm)) {
          console.log(`   🔄 Found: ${oldPerm}`);
          
          // Remove old permission
          newPermissions.delete(oldPerm);
          hasChanges = true;

          // Add new permissions
          const mappedPermissions = PERMISSION_MAPPING[oldPerm] || [];
          mappedPermissions.forEach(newPerm => {
            newPermissions.add(newPerm);
            console.log(`   ✅ Added: ${newPerm}`);
          });
        }
      });

      if (hasChanges) {
        // Update user with new permissions
        await prisma.user.update({
          where: { id: user.id },
          data: {
            permissions: Array.from(newPermissions),
          },
        });

        migrationCount++;
        console.log(`   ✅ Migration completed for ${user.name}\n`);
      } else {
        console.log(`   ℹ️  No changes needed for ${user.name}\n`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log(`   Total users migrated: ${migrationCount}`);
    console.log(`   Total users checked: ${usersWithAnalytics.length}\n`);

    // Summary
    console.log('📊 Summary of changes:');
    console.log(`   - Removed: ${OLD_PERMISSIONS.ANALYTICS_VIEW}, ${OLD_PERMISSIONS.ANALYTICS_EXPORT}, ${OLD_PERMISSIONS.ANALYTICS_ALL}`);
    console.log(`   - Added: ${Object.values(PERMISSION_MAPPING).flat().length} new granular dashboard permissions`);
    console.log('\n✨ Users can now have fine-grained control over dashboard elements!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateAnalyticsToDashboard()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
