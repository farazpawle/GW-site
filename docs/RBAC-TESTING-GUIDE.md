# RBAC Permission Testing Guide

## Quick Test: Homepage Edit Permission

### Test User
- **Email**: farazkhld@gmail.com  
- **Role**: CONTENT_EDITOR
- **Current Status**: `homepage.edit` permission **REMOVED** ✅

---

## Step-by-Step Testing

### 1. Verify Database State

Run this command to see current permissions:
```bash
npx tsx scripts/check-user-permissions.ts farazkhld@gmail.com
```

**Expected Output**:
```
🔑 Permissions Array:
  ✅ 13 custom permissions:
     - products.view
     - products.create
     - products.edit
     - categories.view
     - pages.view
     - pages.create
     - pages.edit
     - menu.view
     - media.view
     - media.upload
     - messages.view
     - dashboard.view
     - homepage.view

🏠 Homepage Permissions:
  View: ✅ Yes
  Edit: ❌ No
```

### 2. Test RBAC Logic

Run this to verify permission checking works:
```bash
npx tsx scripts/test-rbac-system.ts
```

**Expected Output**:
```
✅ RBAC IS WORKING CORRECTLY
   User does NOT have homepage.edit permission
   Edit buttons should be disabled (showing lock icons)
```

### 3. Test in Browser

**IMPORTANT**: The UI fetches permissions once on page load. After changing permissions, you must:

#### Option A: Hard Refresh (Recommended)
1. Open Homepage CMS: http://localhost:3000/admin/homepage-cms
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. This bypasses cache and fetches fresh permissions

#### Option B: Log Out and Log In
1. Click your profile → Sign Out
2. Sign back in as farazkhld@gmail.com
3. Navigate to Homepage CMS

#### Option C: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"

### 4. Expected UI Behavior

When viewing `/admin/homepage-cms` as farazkhld@gmail.com:

**✅ You SHOULD see:**
- Homepage sections list
- Yellow banner: "Read-only access - Missing permission: homepage.edit"
- All edit buttons showing **lock icons** 🔒
- All buttons **disabled** (grayed out, not clickable)
- Drag handle showing lock icon (cannot reorder)
- NO "Publish Changes" button

**❌ You SHOULD NOT see:**
- Blue edit icons
- Green visibility toggle icons
- Red delete icons
- Drag handles that work
- Any clickable action buttons

### 5. Test API Protection

Try to edit via API (should fail):

```bash
# This should return 403 Forbidden
curl -X PUT http://localhost:3000/api/admin/page-sections/SECTION_ID \
  -H "Content-Type: application/json" \
  -d '{"visible": false}'
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Forbidden: You do not have permission to edit homepage sections"
}
```

---

## Troubleshooting

### Problem: Edit buttons still work after removing permission

**Cause**: Browser cached the old permissions

**Solution**:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for log: `[HomepageCMS] User permissions loaded`
4. Check `hasEditPermission` value
5. If it's `true`, do a hard refresh (Ctrl + Shift + R)

### Problem: Permission changes don't save

**Cause**: Permission Editor not saving to database

**Solution**:
1. Check browser console for errors
2. Verify API call succeeds: Network tab → Look for PATCH to `/api/admin/users/[id]/permissions`
3. Run: `npx tsx scripts/check-user-permissions.ts email@example.com`
4. Verify permissions array matches what you selected

### Problem: User sees 403 on ALL pages

**Cause**: User role might be VIEWER (blocked from admin)

**Solution**:
```bash
# Check user role
npx tsx scripts/check-user-roles.ts

# If VIEWER, promote them
npx tsx scripts/promote-to-admin.ts user@example.com CONTENT_EDITOR
```

---

## Adding/Removing Permissions

### To Remove a Permission:

1. Log in as SUPER_ADMIN (farazpawle@gmail.com)
2. Navigate to: `/admin/users`
3. Click on the user you want to edit
4. Click "Edit Permissions" button
5. Find the permission group (e.g., "Homepage CMS")
6. **Uncheck** the permission (e.g., "Edit homepage content and layout")
7. Click "Save Permissions"
8. Log out and log in as that user (or hard refresh)

### To Add a Permission:

1. Follow same steps as above
2. **Check** the permission you want to grant
3. Save and refresh

### To Reset to Default Permissions:

```bash
# Remove all custom permissions (will use role defaults)
npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.update({
  where: { email: 'user@example.com' },
  data: { permissions: [] }
}).then(() => {
  console.log('✅ Reset to default role permissions');
  p.\$disconnect();
});
"
```

---

## Permission Matrix Reference

| Role            | Default homepage.edit | Can Override |
|-----------------|----------------------|--------------|
| SUPER_ADMIN     | ✅ Yes (always)      | ❌ No (bypass all checks) |
| ADMIN           | ✅ Yes               | ✅ Yes       |
| STAFF           | ✅ Yes               | ✅ Yes       |
| CONTENT_EDITOR  | ✅ Yes               | ✅ Yes       |
| VIEWER          | ❌ No                | ✅ Yes (can be granted) |

---

## Current Test Status

### farazkhld@gmail.com
- **Role**: CONTENT_EDITOR
- **Custom Permissions**: Yes (13 permissions)
- **homepage.view**: ✅ HAS
- **homepage.edit**: ❌ REMOVED
- **Expected**: Read-only access to Homepage CMS

### farazpawle@gmail.com
- **Role**: SUPER_ADMIN
- **Custom Permissions**: N/A (bypasses all)
- **homepage.edit**: ✅ Always has
- **Expected**: Full access to everything

---

## Next Steps

Once you verify this is working:

1. ✅ Test Homepage CMS permissions (current)
2. 🔄 Apply same pattern to Products/Parts
3. 🔄 Apply to Categories
4. 🔄 Apply to Pages
5. 🔄 Apply to Media
6. 🔄 Apply to Users
7. 🔄 Apply to Messages
8. 🔄 Apply to Settings

---

## Important Notes

1. **Browser Cache**: Always do hard refresh after permission changes
2. **Database vs UI**: Permissions are stored correctly in DB, UI just needs to fetch them
3. **SUPER_ADMIN**: Cannot be restricted - always has full access
4. **Empty Permissions**: If user has no custom permissions, system uses role defaults
5. **API Protection**: Even if UI shows buttons, API will reject unauthorized requests
