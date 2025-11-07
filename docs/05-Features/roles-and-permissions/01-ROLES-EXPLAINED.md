# Role Definitions - Detailed Explanation

## 📋 Overview

This document explains **each role** in the RBAC system. You'll learn:
- What each role is for
- Who should have this role
- What they can and cannot do
- Real-world examples

---

## 🎯 Role Hierarchy (Power Levels)

```
┌─────────────────────────────────────────┐
│         SUPER_ADMIN (Level 100)         │  ← Owner/Founder
│  • Can do EVERYTHING                    │
│  • Can manage ALL users                 │
│  • Only role that can change roles      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│          MANAGER (Level 50)             │  ← Department Head
│  • Can manage products, content, media  │
│  • Can manage STAFF, EDITOR, VIEWER     │
│  • Cannot change settings or roles      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│           STAFF (Level 20)              │  ← Regular Employee
│  • Can view and edit assigned areas     │
│  • Can manage VIEWER users only         │
│  • Limited create/delete permissions    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       CONTENT_EDITOR (Level 15)         │  ← Content Writer
│  • Can create/edit products & pages     │
│  • Cannot delete or manage users        │
│  • Focused on content creation          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│          VIEWER (Level 10)              │  ← Read-Only Access
│  • Can only VIEW data                   │
│  • Cannot edit, create, or delete       │
│  • Cannot manage any users              │
└─────────────────────────────────────────┘
```

---

## 1️⃣ SUPER_ADMIN (Level 100)

### 👤 Who Should Have This Role?
- **Business Owner**
- **Technical Lead / CTO**
- **Founder**
- Anyone who needs **complete control** over the system

### 🔑 Key Characteristics:
- ✅ **Full System Access** - Can do absolutely everything
- ✅ **Role Management** - Only role that can assign/change user roles
- ✅ **System Settings** - Can modify all settings, integrations, configurations
- ✅ **User Management** - Can create, edit, delete any user (including other Super Admins)
- ✅ **Dangerous Operations** - Can perform irreversible actions (bulk delete, system reset, etc.)

### 📌 Default Permissions (ALL):
```
✅ products.* (view, create, edit, delete, publish)
✅ categories.* (view, create, edit, delete)
✅ pages.* (view, create, edit, delete)
✅ menu.* (view, create, edit, delete)
✅ media.* (view, upload, delete)
✅ users.* (view, create, edit, delete, manage_roles)
✅ settings.* (view, edit)
✅ analytics.* (view, export)
✅ messages.* (view, reply, delete)
✅ collections.* (view, create, edit, delete)
```

### 💼 Real-World Example:
**John (Business Owner)**
- Logs in and sees ALL admin features
- Can assign "Manager" role to Sarah (department head)
- Can change website settings, domain, integrations
- Can delete any user or content
- Can access financial reports and analytics
- Responsible for final approvals on major changes

### ⚠️ Security Note:
- Limit Super Admin accounts to **1-3 trusted individuals**
- Use strong passwords and 2FA (Two-Factor Authentication)
- Log all Super Admin actions for audit trail

---

## 2️⃣ MANAGER (Level 50)

### 👤 Who Should Have This Role?
- **Department Managers**
- **Team Leads**
- **Senior Staff Members**
- Anyone who needs to manage a specific area + team members

### 🔑 Key Characteristics:
- ✅ **Broad Access** - Can manage most content and features
- ✅ **Team Management** - Can manage Staff, Content Editors, and Viewers
- ⛔ **No Role Changes** - Cannot assign or change user roles
- ⛔ **Limited Settings** - Cannot modify system-wide settings
- ✅ **Department Focus** - Full control over assigned departments

### 📌 Default Permissions:
```
✅ products.* (view, create, edit, delete, publish)
✅ categories.* (view, create, edit, delete)
✅ pages.* (view, create, edit, delete)
✅ menu.* (view, create, edit, delete)
✅ media.* (view, upload, delete)
✅ users.view (can see user list)
✅ users.edit (can edit Staff/Editor/Viewer only)
⛔ users.manage_roles (cannot change roles)
⛔ settings.* (cannot change settings)
✅ analytics.view
✅ messages.* (view, reply, delete)
✅ collections.* (view, create, edit, delete)
```

### 💼 Real-World Example:
**Sarah (Product Manager)**
- Manages the product catalog and team
- Can add, edit, delete products and categories
- Can upload product images and PDFs
- Can manage her team members (Staff and Content Editors)
- Cannot change anyone's role (must ask Super Admin)
- Cannot access system settings
- Can respond to customer inquiries
- Can create collections and organize products

### 🎯 Use Cases:
1. **Product Manager**: Manages entire product catalog + team
2. **Content Manager**: Manages website pages, blogs, and content team
3. **Marketing Manager**: Manages media library, collections, and marketing content

---

## 3️⃣ STAFF (Level 20)

### 👤 Who Should Have This Role?
- **Regular Employees**
- **Junior Staff**
- **Data Entry Personnel**
- Anyone who needs **limited editing** capabilities

### 🔑 Key Characteristics:
- ✅ **View & Edit** - Can view and edit existing content
- ⚠️ **Limited Create** - Can create some items (products, media) but not all
- ⛔ **No Delete** - Cannot delete most items (products, categories, pages)
- ✅ **Can Manage Viewers** - Can edit Viewer accounts only
- ⛔ **No Settings** - Cannot change any settings

### 📌 Default Permissions:
```
✅ products.view
✅ products.edit
⚠️ products.create (optional, can be removed)
⛔ products.delete
⛔ products.publish
✅ categories.view
⛔ categories.edit
✅ pages.view
✅ pages.edit
⛔ pages.delete
✅ menu.view
⛔ menu.edit
✅ media.view
✅ media.upload
⛔ media.delete
✅ users.view
✅ users.edit (Viewer only)
⛔ users.manage_roles
⛔ settings.*
✅ analytics.view
✅ messages.view
✅ messages.reply
⛔ collections.*
```

### 💼 Real-World Example:
**Mike (Product Data Entry)**
- Updates product descriptions and specifications
- Uploads product images
- Can edit existing pages (fix typos)
- Cannot delete products or categories
- Cannot create new product categories
- Can help Viewer users with access issues
- Can view analytics to check product performance
- Can reply to customer messages

### 🎯 Use Cases:
1. **Data Entry**: Updates product information daily
2. **Support Staff**: Replies to messages, updates content
3. **Junior Employee**: Learning the system, limited responsibilities

---

## 4️⃣ CONTENT_EDITOR (Level 15)

### 👤 Who Should Have This Role?
- **Blog Writers**
- **Content Creators**
- **Copywriters**
- Anyone focused on **creating and editing content** only

### 🔑 Key Characteristics:
- ✅ **Create & Edit Content** - Can create new products, pages, content
- ✅ **Media Upload** - Can upload images and files
- ⛔ **No Delete** - Cannot delete anything
- ⛔ **No User Management** - Cannot manage any users
- ⛔ **No System Access** - Cannot change settings or configurations

### 📌 Default Permissions:
```
✅ products.view
✅ products.create
✅ products.edit
⛔ products.delete
⛔ products.publish
✅ categories.view
⛔ categories.edit
✅ pages.view
✅ pages.create
✅ pages.edit
⛔ pages.delete
✅ menu.view
⛔ menu.edit
✅ media.view
✅ media.upload
⛔ media.delete
⛔ users.*
⛔ settings.*
⛔ analytics.*
✅ messages.view
⛔ collections.*
```

### 💼 Real-World Example:
**Emma (Content Writer)**
- Writes product descriptions
- Creates new product pages
- Uploads product images and brochures
- Edits existing content (fix grammar, update info)
- Cannot delete any content
- Cannot publish products (must request Manager approval)
- Cannot see user management or analytics
- Can view customer messages for content ideas

### 🎯 Use Cases:
1. **Freelance Writer**: Creates content, no access to system features
2. **Marketing Copywriter**: Writes product descriptions and pages
3. **Content Intern**: Learning to create quality content

---

## 5️⃣ VIEWER (Level 10)

### 👤 Who Should Have This Role?
- **Stakeholders / Investors**
- **External Consultants**
- **Auditors**
- **New Employees (Training)**
- Anyone who needs **read-only access** to check data

### 🔑 Key Characteristics:
- ✅ **View Only** - Can see data but cannot modify anything
- ⛔ **No Create** - Cannot create any content
- ⛔ **No Edit** - Cannot modify any content
- ⛔ **No Delete** - Cannot remove any content
- ⛔ **No User Management** - Cannot manage any users

### 📌 Default Permissions:
```
✅ products.view
⛔ products.create
⛔ products.edit
⛔ products.delete
⛔ products.publish
✅ categories.view
⛔ categories.edit
✅ pages.view
⛔ pages.edit
✅ menu.view
⛔ menu.edit
✅ media.view
⛔ media.upload
⛔ users.*
⛔ settings.*
✅ analytics.view (limited)
✅ messages.view
⛔ collections.*
```

### 💼 Real-World Example:
**Alex (External Consultant)**
- Reviews product catalog to provide recommendations
- Checks website pages for quality assessment
- Views analytics to understand performance
- Cannot edit, create, or delete anything
- Cannot see user information
- Cannot access system settings
- Can view customer messages to understand inquiries

### 🎯 Use Cases:
1. **Investor**: Reviews business data and performance
2. **External Auditor**: Checks data accuracy without making changes
3. **New Employee**: Learning the system before getting edit access
4. **Client**: Views their dedicated content area (future feature)

---

## 🔄 Role Assignment Flow

### How Users Get Roles:

```
Step 1: User Signs Up
   ↓
Automatically assigned: VIEWER (default)
   ↓
Step 2: Super Admin Reviews
   ↓
Super Admin assigns appropriate role
   ↓
Step 3: User Logs In
   ↓
System loads role + permissions
   ↓
User sees their allowed features
```

---

## 🎯 Role Selection Guide

**Use this guide to assign the right role:**

### Question 1: Should they manage users?
- **YES, manage anyone** → SUPER_ADMIN
- **YES, manage team** → MANAGER
- **YES, only viewers** → STAFF
- **NO** → CONTENT_EDITOR or VIEWER

### Question 2: Should they create content?
- **YES, full create + edit + delete** → MANAGER
- **YES, create + edit only** → CONTENT_EDITOR or STAFF
- **YES, edit only** → STAFF
- **NO, view only** → VIEWER

### Question 3: Should they change settings?
- **YES** → SUPER_ADMIN
- **NO** → Any other role

### Question 4: Can they delete content?
- **YES** → SUPER_ADMIN or MANAGER
- **NO** → STAFF, CONTENT_EDITOR, or VIEWER

---

## 📊 Quick Comparison Table

| Feature | Super Admin | Manager | Staff | Content Editor | Viewer |
|---------|-------------|---------|-------|----------------|--------|
| **View Content** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create Content** | ✅ | ✅ | ⚠️ Limited | ✅ | ❌ |
| **Edit Content** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Delete Content** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Publish Content** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Upload Media** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Delete Media** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Users** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Edit Users** | ✅ | ✅ Lower | ✅ Viewer only | ❌ | ❌ |
| **Manage Roles** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View Settings** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Edit Settings** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View Analytics** | ✅ | ✅ | ✅ | ❌ | ⚠️ Limited |
| **Manage Collections** | ✅ | ✅ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ = Full access
- ⚠️ = Partial/Limited access
- ❌ = No access

---

## 🔐 Security Best Practices

### 1. **Principle of Least Privilege**
Always assign the **lowest role** that allows the user to do their job.

**Example:**
- Need to write product descriptions? → CONTENT_EDITOR (not MANAGER)
- Need to just check inventory? → VIEWER (not STAFF)

### 2. **Regular Role Audits**
Every 3-6 months, review:
- Who has what roles?
- Are roles still appropriate?
- Any inactive accounts to remove?

### 3. **Role Promotion Path**
Users should earn promotions:
```
New Employee → VIEWER (training)
   ↓ (after 1 month)
Proven Skills → CONTENT_EDITOR or STAFF
   ↓ (after 6 months)
Team Lead → MANAGER
   ↓ (co-founder/partner)
Business Owner → SUPER_ADMIN
```

### 4. **Limit Super Admins**
- **Recommended:** 1-2 Super Admins maximum
- **Maximum:** 3 Super Admins (only if absolutely necessary)
- More Super Admins = more security risk

---

## 🎓 Summary

**Remember the hierarchy:**
```
SUPER_ADMIN → Can do everything (owner)
MANAGER → Can manage content + team (department head)
STAFF → Can edit content (regular employee)
CONTENT_EDITOR → Can create content (writer)
VIEWER → Can only view (read-only)
```

**Key Rule:**
You can only manage users whose role level is **lower** than yours!

---

**Next Document:** [02-PERMISSIONS-LIST.md](./02-PERMISSIONS-LIST.md) - Complete list of all permissions
