# Analytics to Dashboard Permissions Migration

## Overview
Migrated from a generic "analytics" permission to granular dashboard element permissions, giving admins fine-grained control over which dashboard features users can access.

## Changes Made

### 1. **Permission System Updates** (`src/lib/rbac/permissions.ts`)

#### Removed:
- `RESOURCES.ANALYTICS` resource
- `PERMISSIONS.ANALYTICS_VIEW`
- `PERMISSIONS.ANALYTICS_EXPORT`
- `PERMISSIONS.ANALYTICS_ALL`

#### Added New Granular Dashboard Permissions:
- `PERMISSIONS.DASHBOARD_VIEW` - Basic dashboard access
- `PERMISSIONS.DASHBOARD_MESSAGE_CENTER` - View message center widget
- `PERMISSIONS.DASHBOARD_ENGAGEMENT_OVERVIEW` - View engagement analytics charts
- `PERMISSIONS.DASHBOARD_PRODUCT_INSIGHTS` - View top products and performance widgets
- `PERMISSIONS.DASHBOARD_SEARCH_ANALYTICS` - View search analytics widget
- `PERMISSIONS.DASHBOARD_STATISTICS` - View statistics cards (users, products, categories)
- `PERMISSIONS.DASHBOARD_RECENT_ACTIVITY` - View recent products/activity feed
- `PERMISSIONS.DASHBOARD_ALL` - All dashboard permissions (wildcard)

### 2. **Role Permission Mappings Updated**

#### SUPER_ADMIN
- Gets `DASHBOARD_ALL` (full access to all dashboard elements)

#### ADMIN
- Gets all individual dashboard permissions:
  - MESSAGE_CENTER
  - ENGAGEMENT_OVERVIEW
  - PRODUCT_INSIGHTS
  - SEARCH_ANALYTICS
  - STATISTICS
  - RECENT_ACTIVITY

#### STAFF
- Gets limited dashboard access:
  - MESSAGE_CENTER
  - STATISTICS
  - RECENT_ACTIVITY

#### CONTENT_EDITOR
- Gets basic dashboard access:
  - MESSAGE_CENTER
  - RECENT_ACTIVITY

#### VIEWER
- Gets minimal dashboard access:
  - STATISTICS
  - (No analytics or sensitive data)

### 3. **Dashboard Page Updates** (`src/app/admin/page.tsx`)

Added permission checks for each dashboard element:
- Statistics Cards → `DASHBOARD_STATISTICS`
- Message Dashboard → `DASHBOARD_MESSAGE_CENTER`
- Engagement Chart → `DASHBOARD_ENGAGEMENT_OVERVIEW`
- Product Insights (Top Viewed/Needs Attention) → `DASHBOARD_PRODUCT_INSIGHTS`
- Search Analytics → `DASHBOARD_SEARCH_ANALYTICS`
- Recent Products → `DASHBOARD_RECENT_ACTIVITY`

Components are conditionally rendered based on user permissions.

### 4. **Middleware Updates** (`src/middleware.ts`)

- Removed `/admin/analytics` route mapping (no longer needed)
- Dashboard access is now controlled via component-level permission checks

### 5. **Migration Script** (`scripts/migrate-analytics-to-dashboard.ts`)

Created migration script that:
- Finds users with old analytics permissions
- Maps old permissions to new ones:
  - `analytics.view` → `dashboard.statistics`
  - `analytics.export` → `dashboard.search_analytics`
  - `analytics.*` → All 6 new dashboard element permissions
- Updates user permissions in database
- Provides detailed migration logs

## Permission Mapping Table

| Old Permission | New Permission(s) |
|---|---|
| `analytics.view` | `dashboard.statistics` |
| `analytics.export` | `dashboard.search_analytics` |
| `analytics.*` | All dashboard element permissions |

## Benefits

1. **Granular Control**: Admins can now grant access to specific dashboard features rather than all-or-nothing
2. **Better Security**: Users only see dashboard elements they have permission for
3. **Flexible Role Management**: Easier to create custom roles with specific dashboard access
4. **Clear Naming**: Permission names like "message_center" and "engagement_overview" are self-explanatory
5. **Scalable**: Easy to add new dashboard elements with their own permissions

## Migration Steps

### For Existing Users:

1. **Run Migration Script**:
   ```bash
   npx tsx scripts/migrate-analytics-to-dashboard.ts
   ```

2. **Verify Permissions**:
   - Check user management page
   - Verify dashboard elements appear correctly based on roles
   - Test with different role levels

### For New Users:

New users automatically get role-based permissions as defined in `ROLE_PERMISSIONS`.

## Testing Checklist

- [ ] SUPER_ADMIN sees all dashboard elements
- [ ] ADMIN sees all dashboard elements except role management
- [ ] STAFF sees message center, statistics, and recent activity
- [ ] CONTENT_EDITOR sees message center and recent activity
- [ ] VIEWER sees only statistics cards
- [ ] Migration script successfully converts old permissions
- [ ] No errors in browser console
- [ ] Dashboard loads correctly for all roles

## Notes

- API routes (`/api/admin/analytics/*` and `/api/search/analytics`) still use `checkAdmin()` for authentication
- Frontend permission checks control what's displayed
- The permission system is backward compatible - existing RBAC structure remains intact
- Empty dashboard sections are automatically hidden (no permission check UI clutter)

## Example Use Cases

### Use Case 1: Content Manager Role
A content manager needs to see messages and recent activity but shouldn't see analytics:
```typescript
permissions: [
  'dashboard.view',
  'dashboard.message_center',
  'dashboard.recent_activity',
  'products.view',
  'products.edit',
]
```

### Use Case 2: Analytics Viewer Role
A viewer who only needs to see analytics data:
```typescript
permissions: [
  'dashboard.view',
  'dashboard.statistics',
  'dashboard.engagement_overview',
  'dashboard.search_analytics',
]
```

### Use Case 3: Support Staff Role
Support staff needs message center and product insights:
```typescript
permissions: [
  'dashboard.view',
  'dashboard.message_center',
  'dashboard.product_insights',
  'messages.view',
  'messages.delete',
]
```

## Files Modified

1. `src/lib/rbac/permissions.ts` - Core permission definitions
2. `src/app/admin/page.tsx` - Dashboard with permission checks
3. `src/middleware.ts` - Route permission mappings
4. `scripts/migrate-analytics-to-dashboard.ts` - Migration script (new)

## Rollback Plan

If issues arise:
1. Run SQL to restore old analytics permissions:
   ```sql
   UPDATE "User" 
   SET permissions = array_append(permissions, 'analytics.view')
   WHERE role IN ('ADMIN', 'STAFF', 'VIEWER');
   ```
2. Revert code changes using git
3. Restart application

## Future Enhancements

Potential additions:
- `dashboard.export_data` - Permission to export dashboard data
- `dashboard.custom_widgets` - Permission to add custom widgets
- `dashboard.real_time` - Permission to see real-time updates
- Per-widget configuration (show/hide individual stats)
