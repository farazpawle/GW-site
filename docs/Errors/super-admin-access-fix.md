# Settings Access Error - SUPER_ADMIN Required

## Problem
When accessing `/admin/settings` or `/admin/settings-v2`, users see the error:
```
Unauthorized: SUPER_ADMIN role required
```

## Root Cause
The Settings API endpoints require **SUPER_ADMIN** role to access. Regular ADMIN or VIEWER users cannot view or modify site settings for security reasons.

## Solution: Promote User to SUPER_ADMIN

### Step 1: Check Current Users
```bash
npx tsx --env-file=.env.local scripts/list-users.ts
```

This will show all users and their current roles.

### Step 2: Promote User to SUPER_ADMIN

**Option A: By Email**
```bash
npx tsx --env-file=.env.local scripts/setup-super-admin.ts --email=user@example.com
```

**Option B: By User ID**
```bash
npx tsx --env-file=.env.local scripts/setup-super-admin.ts --id=user_abc123
```

### Step 3: Verify Settings Access
1. Log out and log back in (to refresh session)
2. Navigate to `/admin/settings-v2`
3. Settings should now load without errors

## What Was Done

### 1. Created Helper Script
**File:** `scripts/list-users.ts`
- Lists all users in database
- Shows their email, name, role, and ID
- Helps identify who needs promotion

### 2. User Promoted
**User:** farazpawle@gmail.com
- **Previous Role:** ADMIN
- **New Role:** SUPER_ADMIN
- **User ID:** user_33gKGbfRorZvlAuP2kCaMY7FCte

### 3. Scripts Verified
Both scripts tested and working:
- ✅ `setup-super-admin.ts` - Successfully promotes users
- ✅ `seed-settings.ts` - Successfully seeds 35 settings across 6 categories

## Role Hierarchy
```
SUPER_ADMIN (Level 3) - Highest privileges
    ↓
ADMIN (Level 2) - Manage content and products
    ↓
VIEWER (Level 1) - Read-only access
```

## Settings Access Matrix
| Feature | VIEWER | ADMIN | SUPER_ADMIN |
|---------|--------|-------|-------------|
| View Settings | ❌ | ❌ | ✅ |
| Edit Settings | ❌ | ❌ | ✅ |
| View Products | ✅ | ✅ | ✅ |
| Edit Products | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

## Security Note
⚠️ **SUPER_ADMIN is the highest privilege level**

Only promote trusted users to SUPER_ADMIN. They can:
- Access all site settings (including sensitive data)
- Modify payment gateway credentials
- Change SMTP settings
- Update SEO configuration
- Promote other users to any role
- Access all admin features

## Next Steps
1. ✅ User promoted to SUPER_ADMIN
2. ✅ Settings API working correctly
3. ✅ Authorization errors resolved
4. **Ready to continue with Phase 9 Task 12: Email & Payment Settings**

## Troubleshooting

**Error still persists after promotion?**
1. Log out completely from the application
2. Clear browser cookies
3. Log back in
4. Check that you're logged in with the promoted email

**Can't find user in database?**
- Ensure user has signed up via `/sign-up`
- Check that Clerk webhook is working
- Run `scripts/sync-existing-users.ts` to sync Clerk users to database
