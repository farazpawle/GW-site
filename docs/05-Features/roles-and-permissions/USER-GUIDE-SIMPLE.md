# 🎯 RBAC System - Simple User Guide

## What You Have Now

A **Role-Based Access Control (RBAC)** system that lets you control what different users can do in your admin panel.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Your Server
```bash
npm run dev
```
Visit: `http://localhost:3000/admin`

### Step 2: Check Your Own Permissions
1. Login to admin panel
2. Look at **top-right corner** → You'll see badges showing:
   - **"Level 100"** (your access level)
   - **"10 perms"** with a ⭐ (your permissions)

### Step 3: Manage Other Users
1. Click **"Users"** in the sidebar
2. You'll see a table with columns:
   - User → Email → Role → **Level** → **Permissions** → Joined
3. Click on **any user** to manage them

---

## 📝 What You Can Do (As Super Admin)

### ✅ Change Someone's Role
1. Go to `/admin/users`
2. Click on a user
3. Click the **"Change Role"** button
4. Pick a new role:
   - **SUPER_ADMIN** - Full access (like you)
   - **MANAGER** - Can manage content and most users
   - **STAFF** - Can edit content
   - **CONTENT_EDITOR** - Can create/edit products and pages
   - **VIEWER** - Read-only access
5. Click **"Confirm Change"**
6. ✅ Done! They now have that role

### ✅ Edit Someone's Permissions
1. Go to `/admin/users`
2. Click on a user
3. Click the **"Edit Permissions"** button
4. You'll see a big modal with permission categories:
   - Products
   - Categories
   - Pages
   - Menu
   - Media
   - Users
   - Settings
   - Analytics
   - Messages
   - Collections

#### Two Ways to Add Permissions:

**Option A: Use Wildcards (⭐) - Quick & Easy**
- Click the **"All products"** button (with star ⭐)
- This gives them ALL product permissions at once
- Use this for broad access

**Option B: Pick Individual Permissions**
- Check/uncheck specific permissions like:
  - ✓ Products - View
  - ✓ Products - Create
  - ✓ Products - Edit
  - ✗ Products - Delete (unchecked)
- Use this for fine-grained control

5. Click **"Save Changes"**
6. ✅ Done! They now have those permissions

---

## 🎯 Real Examples

### Example 1: Give Someone Product Access
**Goal**: Let John manage products

1. Go to Users → Click on John
2. Click "Edit Permissions"
3. Click the **"All products" ⭐** button
4. Save
5. ✅ John can now view, create, edit, delete products

### Example 2: Make Someone a Manager
**Goal**: Promote Sarah to Manager

1. Go to Users → Click on Sarah
2. Click "Change Role"
3. Select **"Manager"**
4. Confirm
5. ✅ Sarah is now a Manager with default manager permissions

### Example 3: Give Read-Only Access to Analytics
**Goal**: Let Tom view analytics but not export

1. Go to Users → Click on Tom
2. Click "Edit Permissions"
3. Scroll to **Analytics** section
4. Check ✓ **"View"**
5. Leave **"Export"** unchecked
6. Save
7. ✅ Tom can view analytics dashboard but cannot export data

---

## 🔍 Understanding the System

### What Are "Levels"?
- **100** = Maximum power (Super Admin) - that's you!
- **50** = Manager level
- **20** = Staff level
- **15** = Content Editor level
- **10** = Viewer level (lowest)

**Rule**: You can only manage users with LOWER levels than yours.

### What Are "Permissions"?
Permissions control specific actions:
- **view** - Can see/read
- **create** - Can make new items
- **edit** - Can change existing items
- **delete** - Can remove items
- **⭐ Wildcard** - All permissions in that category

### What Are "Roles"?
Roles are pre-set bundles of permissions:
- **SUPER_ADMIN** → 10 wildcards (everything)
- **MANAGER** → Most things except role changes
- **STAFF** → Can edit, limited creation
- **CONTENT_EDITOR** → Can create content
- **VIEWER** → Read-only

---

## 🧪 Test It Out

### Quick Test:
1. Create a test user (or use an existing one)
2. Give them **VIEWER** role
3. Login as that user (different browser/incognito)
4. Try to create a product → **Blocked!**
5. Switch back to your admin account
6. Give them **products.create** permission
7. Try again as that user → **Now it works!**

---

## 📊 Where to See Changes

### 1. Top Bar (Your Info)
- Shows YOUR current level and permissions
- Updates when your permissions change

### 2. Users Table
- Shows all users you can manage
- Displays their levels and permission counts

### 3. User Detail Page
- Full list of someone's permissions
- Shows wildcards with ⭐ highlighting

### 4. Database (For Audit)
Check what changed:
```sql
SELECT * FROM rbac_logs ORDER BY "createdAt" DESC LIMIT 10;
```

---

## ❓ Common Questions

### Q: Why can't I see some users?
**A**: You can only see users with LOWER levels than yours. Other Super Admins are hidden from each other for security.

### Q: Can I change my own role?
**A**: No, for security reasons. Another Super Admin must do it.

### Q: What's the difference between role and permissions?
**A**: 
- **Role** = Job title with default permissions
- **Permissions** = Specific things they can do
- You can customize permissions after assigning a role

### Q: What does the ⭐ mean?
**A**: Wildcard = "All permissions in this category". 
- `products.*` = products.view + products.create + products.edit + products.delete + products.publish

### Q: How do I remove permissions?
**A**: 
1. Edit Permissions
2. Uncheck the permissions or click "Deselect All"
3. Save

---

## 🎬 Video Tutorial (Text Steps)

### Tutorial: "Give Bob Product Management Access"

**Starting Point**: Bob is a VIEWER (read-only)

1. **Open Admin Panel** → `http://localhost:3000/admin`
2. **Click "Users"** in sidebar
3. **Find Bob** in the table
4. **Click on Bob's row** → Opens his profile
5. **Click "Edit Permissions"** button
6. **Scroll to Products section**
7. **Click "All products" ⭐** button → Turns yellow
8. **Click "Save Changes"** button
9. **Wait for success message**
10. ✅ **Done!** Bob can now manage products

**Time**: 30 seconds

---

## 🔥 What's Actually Implemented

Everything! Here's what's working RIGHT NOW:

✅ Role assignment (5 roles)
✅ Permission editor (43+ permissions)
✅ Visual indicators (badges, colors, stars)
✅ Hierarchy enforcement (lower can't manage higher)
✅ API protection (routes check permissions)
✅ Audit logging (tracks all changes)
✅ Search permissions (find what you need)
✅ Wildcard toggles (bulk permission grants)

**Nothing is pending - it all works!**

---

## 📞 Need Help?

### If something doesn't work:
1. Make sure server is running (`npm run dev`)
2. Refresh your browser (Ctrl + R)
3. Check you're logged in as Super Admin
4. Check browser console for errors (F12)

### Common Fix:
```bash
# Restart everything:
1. Stop server (Ctrl + C)
2. npm run dev
3. Refresh browser
```

---

## 🎉 That's It!

You now know how to:
- ✅ Change roles
- ✅ Edit permissions
- ✅ Use wildcards
- ✅ Understand the system

**Start managing your team's access now!**

Go to: `http://localhost:3000/admin/users`
