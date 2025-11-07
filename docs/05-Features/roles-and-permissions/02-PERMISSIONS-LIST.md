# Complete Permissions List

## 📋 Overview

This document lists **every permission** in the RBAC system. Each permission controls access to a specific action or feature.

**Format:** `resource.action`
- **resource** = What you're accessing (products, users, settings, etc.)
- **action** = What you're doing (view, create, edit, delete, etc.)

**Wildcard:** `resource.*` = All actions for that resource

---

## 🎯 Permission Categories

Permissions are organized into **10 categories** based on admin features:

1. **Products** - Product catalog management
2. **Categories** - Product category management
3. **Pages** - CMS page management
4. **Menu** - Navigation menu management
5. **Media** - File and image management
6. **Users** - User account management
7. **Settings** - System configuration
8. **Analytics** - Performance data and reports
9. **Messages** - Customer inquiry management
10. **Collections** - Product grouping and organization

---

## 1️⃣ Products Permissions

Manage the product catalog, part numbers, specifications, and product data.

### `products.view`
**Description:** View products list and details  
**Access Level:** All roles (except Viewer in some cases)  
**Allows:**
- View products list in admin panel
- Search and filter products
- View product details (name, description, price, specs)
- See product images and PDFs
- View SKU, part numbers, compatibility

**Does NOT allow:**
- Editing products
- Creating new products
- Deleting products

**Example:** Sarah can browse the product catalog to check inventory status.

---

### `products.create`
**Description:** Create new products  
**Access Level:** Content Editor, Manager, Super Admin  
**Allows:**
- Add new products to catalog
- Upload product images
- Set initial product details
- Assign categories
- Set part numbers and SKU

**Does NOT allow:**
- Publishing products (requires `products.publish`)
- Deleting products

**Example:** Emma creates a new product entry for a newly acquired part.

---

### `products.edit`
**Description:** Edit existing products  
**Access Level:** Staff, Content Editor, Manager, Super Admin  
**Allows:**
- Modify product details (name, description, price)
- Update specifications
- Change product images
- Update compatibility information
- Edit SKU and part numbers
- Modify stock quantities

**Does NOT allow:**
- Deleting products
- Publishing unpublished products

**Example:** Mike updates a product description with new technical specifications.

---

### `products.delete`
**Description:** Delete products permanently  
**Access Level:** Manager, Super Admin  
**Allows:**
- Remove products from catalog
- Delete product permanently (irreversible)

**Warning:** This is a destructive action. Use with caution!

**Example:** Manager Sarah removes discontinued products from the catalog.

---

### `products.publish`
**Description:** Publish or unpublish products  
**Access Level:** Manager, Super Admin  
**Allows:**
- Make products visible on public website
- Hide products from public view (unpublish)
- Control product visibility status

**Use Case:** Products created by Content Editors must be reviewed and published by a Manager.

**Example:** Manager reviews new products and publishes approved ones.

---

### `products.*` (Wildcard)
**Description:** All product permissions  
**Includes:** view, create, edit, delete, publish  
**Access Level:** Manager, Super Admin

---

## 2️⃣ Categories Permissions

Manage product categories and organizational structure.

### `categories.view`
**Description:** View product categories  
**Access Level:** All roles  
**Allows:**
- View categories list
- See category details (name, slug, description)
- View category images
- See products in each category

**Does NOT allow:**
- Creating or editing categories

**Example:** Any user can view categories to understand product organization.

---

### `categories.create`
**Description:** Create new categories  
**Access Level:** Manager, Super Admin  
**Allows:**
- Add new product categories
- Set category name and slug
- Upload category images
- Set category descriptions

**Example:** Manager creates a new category for a new product line.

---

### `categories.edit`
**Description:** Edit existing categories  
**Access Level:** Manager, Super Admin  
**Allows:**
- Rename categories
- Update category descriptions
- Change category images
- Modify category slugs

**Warning:** Changing category slugs can break URLs!

**Example:** Manager updates category description with better keywords.

---

### `categories.delete`
**Description:** Delete categories  
**Access Level:** Manager, Super Admin  
**Allows:**
- Remove categories permanently

**Warning:** Cannot delete categories with products! Move products first.

**Example:** Manager deletes an empty category that's no longer needed.

---

### `categories.*` (Wildcard)
**Description:** All category permissions  
**Includes:** view, create, edit, delete  
**Access Level:** Manager, Super Admin

---

## 3️⃣ Pages Permissions

Manage CMS pages (About, Contact, Privacy Policy, etc.).

### `pages.view`
**Description:** View CMS pages  
**Access Level:** All roles  
**Allows:**
- View pages list
- See page content
- View page metadata (title, slug, SEO)
- Check page status (published/draft)

**Example:** Any user can view pages to check content accuracy.

---

### `pages.create`
**Description:** Create new pages  
**Access Level:** Content Editor, Manager, Super Admin  
**Allows:**
- Create new CMS pages
- Set page title and slug
- Add page content
- Set page metadata

**Example:** Content Editor creates a new "Careers" page.

---

### `pages.edit`
**Description:** Edit existing pages  
**Access Level:** Staff, Content Editor, Manager, Super Admin  
**Allows:**
- Update page content
- Modify page titles
- Change page metadata
- Update SEO settings

**Example:** Staff member fixes a typo on the About page.

---

### `pages.delete`
**Description:** Delete pages  
**Access Level:** Manager, Super Admin  
**Allows:**
- Remove pages permanently

**Warning:** Deleting pages with menu links will break navigation!

**Example:** Manager deletes an outdated promotional page.

---

### `pages.publish`
**Description:** Publish or unpublish pages  
**Access Level:** Manager, Super Admin  
**Allows:**
- Make pages visible on public website
- Hide pages from public view

**Example:** Manager publishes a new page after content review.

---

### `pages.*` (Wildcard)
**Description:** All page permissions  
**Includes:** view, create, edit, delete, publish  
**Access Level:** Manager, Super Admin

---

## 4️⃣ Menu Permissions

Manage navigation menu items and structure.

### `menu.view`
**Description:** View menu items  
**Access Level:** All roles  
**Allows:**
- View navigation menu structure
- See menu item links
- Check menu item settings

**Example:** Any user can view menu to understand site navigation.

---

### `menu.create`
**Description:** Create menu items  
**Access Level:** Manager, Super Admin  
**Allows:**
- Add new menu items
- Link menu items to pages
- Set external URLs
- Create dropdown menus

**Example:** Manager adds a new menu item for a new page.

---

### `menu.edit`
**Description:** Edit menu items  
**Access Level:** Manager, Super Admin  
**Allows:**
- Rename menu items
- Change menu links
- Reorder menu items
- Update menu structure

**Example:** Manager reorganizes menu for better user experience.

---

### `menu.delete`
**Description:** Delete menu items  
**Access Level:** Manager, Super Admin  
**Allows:**
- Remove menu items

**Example:** Manager removes a menu item after deleting its linked page.

---

### `menu.*` (Wildcard)
**Description:** All menu permissions  
**Includes:** view, create, edit, delete  
**Access Level:** Manager, Super Admin

---

## 5️⃣ Media Permissions

Manage media library (images, PDFs, documents).

### `media.view`
**Description:** View media library  
**Access Level:** All roles  
**Allows:**
- Browse media library
- View uploaded files
- See file details (name, size, type)
- Preview images and PDFs

**Example:** Any user can view media to find images for content.

---

### `media.upload`
**Description:** Upload new media files  
**Access Level:** Staff, Content Editor, Manager, Super Admin  
**Allows:**
- Upload images (JPG, PNG, WebP)
- Upload PDFs and documents
- Upload files for products/pages

**Limits:** File size limits apply (configurable in settings)

**Example:** Content Editor uploads product images.

---

### `media.delete`
**Description:** Delete media files  
**Access Level:** Manager, Super Admin  
**Allows:**
- Remove files from media library

**Warning:** Deleting used images breaks pages/products!

**Example:** Manager cleans up unused images.

---

### `media.*` (Wildcard)
**Description:** All media permissions  
**Includes:** view, upload, delete  
**Access Level:** Manager, Super Admin

---

## 6️⃣ Users Permissions

Manage user accounts and roles.

### `users.view`
**Description:** View user list  
**Access Level:** Staff, Manager, Super Admin  
**Allows:**
- View user list
- See user details (name, email, role)
- Check user activity
- View user creation dates

**Privacy Note:** Cannot see user passwords or sensitive data.

**Example:** Manager views team members to check who has access.

---

### `users.create`
**Description:** Create new users  
**Access Level:** Manager, Super Admin  
**Allows:**
- Add new user accounts
- Set initial user details
- Send invitation emails

**Note:** Cannot assign roles (requires `users.manage_roles`)

**Example:** Manager creates an account for a new employee.

---

### `users.edit`
**Description:** Edit user accounts  
**Access Level:** Staff, Manager, Super Admin  
**Restrictions:**
- **Staff:** Can only edit VIEWER users
- **Manager:** Can edit STAFF, CONTENT_EDITOR, VIEWER (not MANAGER or SUPER_ADMIN)
- **Super Admin:** Can edit anyone

**Allows:**
- Update user name
- Change user email
- Deactivate/activate accounts

**Does NOT allow:**
- Changing user roles (requires `users.manage_roles`)

**Example:** Staff member updates a Viewer's email address.

---

### `users.delete`
**Description:** Delete user accounts  
**Access Level:** Manager, Super Admin  
**Restrictions:**
- Can only delete users with lower role level
- Cannot delete yourself

**Warning:** Deleting users is permanent! Consider deactivating instead.

**Example:** Super Admin removes an inactive account.

---

### `users.manage_roles`
**Description:** Assign and change user roles  
**Access Level:** SUPER_ADMIN ONLY  
**Allows:**
- Promote users to higher roles
- Demote users to lower roles
- Assign any role to any user

**Critical Permission:** This is the most powerful permission!

**Security:** Only trusted Super Admins should have this.

**Example:** Super Admin promotes a Staff member to Manager role.

---

### `users.*` (Wildcard)
**Description:** All user permissions  
**Includes:** view, create, edit, delete, manage_roles  
**Access Level:** Super Admin only

---

## 7️⃣ Settings Permissions

Manage system-wide settings and configuration.

### `settings.view`
**Description:** View system settings  
**Access Level:** Super Admin only  
**Allows:**
- View site settings
- See configuration values
- Check system information

**Example:** Super Admin checks current settings.

---

### `settings.edit`
**Description:** Edit system settings  
**Access Level:** Super Admin only  
**Allows:**
- Modify site settings
- Update contact information
- Change SEO settings
- Configure integrations
- Update system preferences

**Warning:** Incorrect settings can break the website!

**Example:** Super Admin updates company contact information.

---

### `settings.*` (Wildcard)
**Description:** All settings permissions  
**Includes:** view, edit  
**Access Level:** Super Admin only

---

## 8️⃣ Analytics Permissions

Access performance data, reports, and statistics.

### `analytics.view`
**Description:** View analytics dashboard  
**Access Level:** Staff, Manager, Super Admin (limited for Viewer)  
**Allows:**
- View product views and engagement
- See search analytics
- Check popular products
- View traffic sources
- See customer inquiry trends

**Viewer Access:** Limited to basic stats only (no detailed reports)

**Example:** Manager checks which products are most popular.

---

### `analytics.export`
**Description:** Export analytics data  
**Access Level:** Manager, Super Admin  
**Allows:**
- Export analytics reports to CSV/Excel
- Download detailed data
- Generate custom reports

**Example:** Manager exports monthly report for presentation.

---

### `analytics.*` (Wildcard)
**Description:** All analytics permissions  
**Includes:** view, export  
**Access Level:** Manager, Super Admin

---

## 9️⃣ Messages Permissions

Manage customer inquiries and contact form messages.

### `messages.view`
**Description:** View customer messages  
**Access Level:** Staff, Manager, Super Admin (limited for Viewer)  
**Allows:**
- View inquiry list
- Read message content
- See customer contact info
- Check message status

**Example:** Staff views new customer inquiries.

---

### `messages.reply`
**Description:** Reply to messages  
**Access Level:** Staff, Manager, Super Admin  
**Allows:**
- Send replies to customers
- Mark messages as responded
- Update message status

**Example:** Staff member replies to a product inquiry.

---

### `messages.delete`
**Description:** Delete messages  
**Access Level:** Manager, Super Admin  
**Allows:**
- Remove spam messages
- Delete resolved inquiries

**Example:** Manager deletes old spam messages.

---

### `messages.*` (Wildcard)
**Description:** All message permissions  
**Includes:** view, reply, delete  
**Access Level:** Manager, Super Admin

---

## 🔟 Collections Permissions

Manage product collections and groupings (Featured Products, New Arrivals, etc.).

### `collections.view`
**Description:** View product collections  
**Access Level:** All roles  
**Allows:**
- View collections list
- See products in collections
- Check collection settings

**Example:** Any user can view collections.

---

### `collections.create`
**Description:** Create new collections  
**Access Level:** Manager, Super Admin  
**Allows:**
- Create new product collections
- Name and describe collections
- Set collection display order

**Example:** Manager creates a "Winter Sale" collection.

---

### `collections.edit`
**Description:** Edit collections  
**Access Level:** Manager, Super Admin  
**Allows:**
- Rename collections
- Add/remove products from collections
- Update collection order
- Modify collection settings

**Example:** Manager updates featured products in homepage collection.

---

### `collections.delete`
**Description:** Delete collections  
**Access Level:** Manager, Super Admin  
**Allows:**
- Remove collections permanently

**Note:** Deleting collections doesn't delete products.

**Example:** Manager deletes an expired seasonal collection.

---

### `collections.*` (Wildcard)
**Description:** All collection permissions  
**Includes:** view, create, edit, delete  
**Access Level:** Manager, Super Admin

---

## 📊 Permission Assignment Matrix

### Role → Permission Mapping

| Permission | Super Admin | Manager | Staff | Content Editor | Viewer |
|------------|-------------|---------|-------|----------------|--------|
| **Products** |
| products.view | ✅ | ✅ | ✅ | ✅ | ✅ |
| products.create | ✅ | ✅ | ⚠️ | ✅ | ❌ |
| products.edit | ✅ | ✅ | ✅ | ✅ | ❌ |
| products.delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| products.publish | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Categories** |
| categories.view | ✅ | ✅ | ✅ | ✅ | ✅ |
| categories.create | ✅ | ✅ | ❌ | ❌ | ❌ |
| categories.edit | ✅ | ✅ | ❌ | ❌ | ❌ |
| categories.delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Pages** |
| pages.view | ✅ | ✅ | ✅ | ✅ | ✅ |
| pages.create | ✅ | ✅ | ❌ | ✅ | ❌ |
| pages.edit | ✅ | ✅ | ✅ | ✅ | ❌ |
| pages.delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| pages.publish | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Menu** |
| menu.view | ✅ | ✅ | ✅ | ✅ | ✅ |
| menu.create | ✅ | ✅ | ❌ | ❌ | ❌ |
| menu.edit | ✅ | ✅ | ❌ | ❌ | ❌ |
| menu.delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Media** |
| media.view | ✅ | ✅ | ✅ | ✅ | ✅ |
| media.upload | ✅ | ✅ | ✅ | ✅ | ❌ |
| media.delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Users** |
| users.view | ✅ | ✅ | ✅ | ❌ | ❌ |
| users.create | ✅ | ✅ | ❌ | ❌ | ❌ |
| users.edit | ✅ | ✅ Lower | ✅ Viewer | ❌ | ❌ |
| users.delete | ✅ | ✅ Lower | ❌ | ❌ | ❌ |
| users.manage_roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Settings** |
| settings.view | ✅ | ❌ | ❌ | ❌ | ❌ |
| settings.edit | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Analytics** |
| analytics.view | ✅ | ✅ | ✅ | ❌ | ⚠️ Limited |
| analytics.export | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Messages** |
| messages.view | ✅ | ✅ | ✅ | ✅ | ⚠️ Limited |
| messages.reply | ✅ | ✅ | ✅ | ❌ | ❌ |
| messages.delete | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Collections** |
| collections.view | ✅ | ✅ | ✅ | ✅ | ✅ |
| collections.create | ✅ | ✅ | ❌ | ❌ | ❌ |
| collections.edit | ✅ | ✅ | ❌ | ❌ | ❌ |
| collections.delete | ✅ | ✅ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ = Full access
- ⚠️ = Partial/Limited access
- ❌ = No access

---

## 🎯 How Permissions Work

### 1. Permission Check Flow

```
User tries to access feature
   ↓
System checks user's role
   ↓
System loads role's permissions
   ↓
Check if permission exists
   ↓
YES → Allow access
NO → Deny access (show error or hide feature)
```

### 2. Multiple Permission Checks

Some actions require **multiple permissions**:

**Example: Publish a product**
```
✅ Requires: products.view + products.edit + products.publish
```

**Example: Delete a user**
```
✅ Requires: users.view + users.delete
✅ PLUS: Your role level > Target user's role level
```

### 3. Wildcard Permissions

If you have `products.*`, you automatically get:
- products.view
- products.create
- products.edit
- products.delete
- products.publish

---

## 🔐 Permission Customization

### Can I customize permissions?

**YES!** While each role has default permissions, you can:
- ✅ Add extra permissions to a role
- ✅ Remove permissions from a role
- ✅ Create custom permission combinations

**Example Customizations:**

1. **Limited Staff Member**
   - Remove `products.create` (can only edit, not create)
   - Keep `products.view` and `products.edit`

2. **Specialized Content Editor**
   - Add `analytics.view` (can see performance data)
   - Keep all default Content Editor permissions

3. **Read-Only Manager**
   - Remove all delete permissions
   - Keep view, create, and edit permissions

---

## 📝 Permission Naming Convention

All permissions follow this pattern:

```
{resource}.{action}
```

**Resources:** (plural form)
- products
- categories
- pages
- menu (singular because it's uncountable)
- media (singular because it's uncountable)
- users
- settings (singular because it's uncountable)
- analytics (singular because it's uncountable)
- messages
- collections

**Actions:** (verb form)
- view (read/list)
- create (add/insert)
- edit (update/modify)
- delete (remove/destroy)
- publish (make public)
- upload (add files)
- export (download data)
- manage_roles (special: assign roles)

---

## 🎓 Summary

**Total Permissions:** 43 individual permissions + 10 wildcards = 53 total

**Permission Categories:** 10 (Products, Categories, Pages, Menu, Media, Users, Settings, Analytics, Messages, Collections)

**Key Concept:** Permissions are **granular** - they control specific actions, not entire features.

**Remember:**
- Permissions are assigned to **roles**
- Roles are assigned to **users**
- You can customize permissions per role
- Use wildcards (`*`) for full access to a resource

---

**Next Document:** [03-IMPLEMENTATION-PLAN.md](./03-IMPLEMENTATION-PLAN.md) - Step-by-step implementation guide
