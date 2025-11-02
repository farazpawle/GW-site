# Phase 5: Complete Navigation & Product System (Shopify-Style)

**Status:** 📋 Planned  
**Priority:** HIGH (Core Navigation & Product Management)  
**Started:** Not yet  
**Estimated Time:** 6-7 hours  
**Completion:** 0%

---

## 🎯 Goal

Build a complete Shopify-style product and navigation system with:
1. **Multi-level menu system** with submenus
2. **Page management** with product group assignments (categories, tags, collections)
3. **Simplified product fields** matching Shopify's clean approach

**What Success Looks Like:**
- ✅ Admin can create multi-level menus (menu items with submenus)
- ✅ Admin can create blank pages and assign product groups (category, tags, collections)
- ✅ Products automatically display on pages based on assigned groups
- ✅ Admin can link menu items to pages or external URLs
- ✅ Menu items are reorderable and toggleable (show/hide)
- ✅ Product fields simplified to Shopify standards (remove unnecessary fields)
- ✅ Product variants system for options (color, size, year, etc.)
- ✅ Clean, intuitive admin interface for all features

---

## 🏗️ System Architecture

### Database Schema Extension

```prisma
// New models to add to schema.prisma

// 1. PAGE SYSTEM - Create custom pages with product groups
model Page {
  id          String   @id @default(cuid())
  title       String   // "European Engine Parts"
  slug        String   @unique // "european-parts"
  description String?  @db.Text
  
  // Product Group Assignment (what to show on this page)
  groupType   String   // "category" | "tag" | "collection" | "all"
  groupValues Json     // { categoryIds: [...], tags: [...], collectionId: "..." }
  
  // Display Options
  layout      String   @default("grid") // "grid" | "list"
  sortBy      String   @default("name") // "name" | "price" | "newest"
  itemsPerPage Int     @default(12)
  
  // SEO
  metaTitle   String?
  metaDesc    String?
  
  // Publishing
  published   Boolean  @default(false)
  publishedAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  menuItems   MenuItem[]
  
  @@map("pages")
}

// 2. MULTI-LEVEL MENU SYSTEM - Support submenus
model MenuItem {
  id           String      @id @default(cuid())
  label        String      // Display text in menu
  position     Int         // Order in navigation (0, 1, 2, ...)
  visible      Boolean     @default(true)
  openNewTab   Boolean     @default(false)
  
  // Multi-level Support
  parentId     String?     // NULL = top-level, ID = submenu item
  parent       MenuItem?   @relation("MenuHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children     MenuItem[]  @relation("MenuHierarchy")
  
  // Link Type: Either page, collection, or external URL
  pageId       String?
  page         Page?       @relation(fields: [pageId], references: [id], onDelete: Cascade)
  externalUrl  String?     // For external links (e.g., "/about", "https://...")
  
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  @@map("menu_items")
  @@index([parentId])
  @@index([position])
}

// 3. COLLECTION SYSTEM - Group products by rules
model Collection {
  id          String   @id @default(cuid())
  name        String   // "Premium Parts"
  slug        String   @unique // "premium-parts"
  description String?  @db.Text
  
  // Auto-Filter Rules (products matching these rules auto-join collection)
  filterRules Json     // { categoryIds: [...], brands: [...], tags: [...], minPrice: 100 }
  
  // Manual Product Selection (optional - overrides filters)
  manualProductIds String[] // Manually selected product IDs
  useManual   Boolean  @default(false) // Use manual selection instead of filters
  
  // Display Options
  layout      String   @default("grid")
  sortBy      String   @default("name")
  
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("collections")
}
```

### JSON Structure Examples

#### 1. Page Group Values (what products to show on page)
```typescript
interface PageGroupValues {
  // Show by categories
  categoryIds?: string[];      // ["cat_123", "cat_456"]
  
  // Show by tags
  tags?: string[];             // ["Premium", "European", "OEM"]
  
  // Show by collection
  collectionId?: string;       // "collection_abc"
  
  // Show all products
  showAll?: boolean;           // true = show all products
  
  // Additional filters
  brands?: string[];           // Filter by specific brands
  origins?: string[];          // ["European", "American"]
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

// Example 1: Show products from multiple categories
{
  "categoryIds": ["engine_parts_id", "transmission_id"],
  "origins": ["European"],
  "inStock": true
}

// Example 2: Show products with specific tags
{
  "tags": ["Premium", "Performance"],
  "minPrice": 100
}

// Example 3: Show a collection
{
  "collectionId": "collection_premium_parts"
}

// Example 4: Show all products
{
  "showAll": true
}
```

#### 2. Collection Filter Rules (automatic product matching)
```typescript
interface CollectionFilterRules {
  "categoryIds": ["clx123", "clx456"],
  "brands": ["Bosch", "ZF"],
  "origins": ["European"],
  "difficulties": ["Expert", "Intermediate"],
  "inStock": true
}
```

---

## 🔄 Product Schema Simplification

### Current Problem
The Part model has too many complex fields that are not needed for most auto parts businesses:
- `fittingDifficulty` (Beginner/Intermediate/Expert)
- `installationVideo`
- `installationGuide` (PDF)
- `warranty`
- `certifications` (array)
- `relatedProducts` (JSON array)
- Multiple complex fields

### Shopify-Style Simplified Schema

**Goal:** Make product management as simple as Shopify - focus on essentials.

```prisma
model Part {
  id              String   @id @default(cuid())
  
  // Basic Info (Keep)
  name            String
  partNumber      String   @unique
  slug            String   @unique
  description     String?  @db.Text
  
  // Category & Organization (Keep)
  categoryId      String
  category        Category @relation(fields: [categoryId], references: [id])
  
  // Pricing (Keep but simplify)
  price           Decimal  @db.Decimal(10, 2)
  compareAtPrice  Decimal? @db.Decimal(10, 2) // For showing discounts
  costPrice       Decimal? @db.Decimal(10, 2) // For profit tracking
  
  // Inventory (Keep)
  sku             String?  @unique
  barcode         String?
  stockQuantity   Int      @default(0)
  lowStockThreshold Int?   @default(10)
  trackInventory  Boolean  @default(true)
  
  // Images (Keep)
  images          String[] // Array of image URLs
  
  // Simple Metadata (Simplified)
  brand           String?  // Just a string, not a relation
  origin          String?  // "European", "American", "Asian", "Universal"
  weight          Decimal? @db.Decimal(8, 2) // For shipping calculation
  tags            String[] // Simple array: ["Premium", "OEM", "Performance"]
  
  // Product Options (NEW - Shopify style)
  hasVariants     Boolean  @default(false)
  
  // Status & Visibility (Keep)
  published       Boolean  @default(true)
  featured        Boolean  @default(false)
  publishedAt     DateTime?
  
  // SEO (Keep)
  metaTitle       String?
  metaDescription String?
  
  // Timestamps (Keep)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  orderItems      OrderItem[]
  variants        ProductVariant[] // NEW: For product variants
  
  @@map("parts")
  @@index([categoryId])
  @@index([published])
  @@index([featured])
  @@index([brand])
  @@index([origin])
}

// NEW: Product Variants (Shopify-style)
model ProductVariant {
  id              String   @id @default(cuid())
  partId          String
  part            Part     @relation(fields: [partId], references: [id], onDelete: Cascade)
  
  // Variant Info
  title           String   // e.g., "Red / Large", "2020-2023 Model"
  sku             String?  @unique
  barcode         String?
  
  // Pricing (can override parent product)
  price           Decimal? @db.Decimal(10, 2)
  compareAtPrice  Decimal? @db.Decimal(10, 2)
  
  // Inventory
  stockQuantity   Int      @default(0)
  
  // Options (stored as JSON)
  options         Json     // { "Color": "Red", "Size": "Large", "Year": "2020-2023" }
  
  // Status
  available       Boolean  @default(true)
  
  // Image
  image           String?  // Variant-specific image
  
  position        Int      @default(0) // Display order
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("product_variants")
  @@index([partId])
}
```

### Fields to Remove
- ❌ `fittingDifficulty` - Not needed for most parts
- ❌ `installationVideo` - Can be added to description if needed
- ❌ `installationGuide` - Can be added to description
- ❌ `warranty` - Add to description
- ❌ `certifications` - Add to tags if needed
- ❌ `relatedProducts` - Use collections instead
- ❌ `compatibilityTags` - Use regular tags
- ❌ `specifications` (complex JSON) - Add to description or use variants

### Migration Plan
1. Create new migration to add ProductVariant model
2. Keep existing Part fields for backward compatibility
3. Gradually migrate to simplified schema in Phase 5.1 (separate task)
4. Update ProductForm to use simplified fields
5. Update product display to show variants

---

## 📋 Tasks

### **PART 1: DATABASE & PRODUCT SIMPLIFICATION** (90 minutes)

---

### Task 1.1: Extend Database Schema with New Models
**Time:** 30 minutes

**Actions:**
- Add Page model (custom pages with product groups)
- Add MenuItem model (multi-level menu with parent-child)
- Add Collection model (product grouping by rules)
- Add ProductVariant model (Shopify-style options)
- Add relationships between models

**Files to Modify:**
- `prisma/schema.prisma` - Add 4 new models (Page, MenuItem, Collection, ProductVariant)
- `prisma/seed.ts` - Seed default page ("All Products") and sample menu

**Migration Command:**
```bash
npx prisma migrate dev --name add_page_menu_collection_system
npx prisma generate
npx prisma db seed
```

---

### Task 1.2: Simplify Product Schema (Remove Unnecessary Fields)
**Time:** 40 minutes

**Actions:**
- Create migration to remove unused fields from Part model
- Fields to remove:
  - ❌ `fittingDifficulty` (not needed)
  - ❌ `installationVideo` (add to description if needed)
  - ❌ `installationGuide` (add to description)
  - ❌ `warranty` (add to description)
  - ❌ `certifications` (use tags instead)
  - ❌ `compatibilityTags` (use regular tags)
  - ❌ `relatedProducts` (use collections instead)
  - ❌ `specifications` (complex JSON - use description or variants)
- Keep: name, partNumber, slug, description, price, stock, images, brand, origin, tags
- Add: hasVariants, compareAtPrice, costPrice fields

**Files to Modify:**
- `prisma/schema.prisma` - Update Part model
- `prisma/migrations/` - Create new migration
- `src/lib/validations/product.ts` - Update Zod schemas

**Migration Strategy:**
```sql
-- Remove unused columns (data will be lost - backup first!)
ALTER TABLE "parts" DROP COLUMN IF EXISTS "fittingDifficulty";
ALTER TABLE "parts" DROP COLUMN IF EXISTS "installationVideo";
ALTER TABLE "parts" DROP COLUMN IF EXISTS "installationGuide";
ALTER TABLE "parts" DROP COLUMN IF EXISTS "warranty";
ALTER TABLE "parts" DROP COLUMN IF EXISTS "certifications";
ALTER TABLE "parts" DROP COLUMN IF EXISTS "compatibilityTags";
ALTER TABLE "parts" DROP COLUMN IF EXISTS "relatedProducts";
ALTER TABLE "parts" DROP COLUMN IF EXISTS "specifications";

-- Add new Shopify-style fields
ALTER TABLE "parts" ADD COLUMN IF NOT EXISTS "hasVariants" BOOLEAN DEFAULT false;
ALTER TABLE "parts" ADD COLUMN IF NOT EXISTS "compareAtPrice" DECIMAL(10,2);
ALTER TABLE "parts" ADD COLUMN IF NOT EXISTS "costPrice" DECIMAL(10,2);
```

---

### Task 1.3: Update Product Validation Schemas
**Time:** 20 minutes

**Actions:**
- Remove validation for deleted fields
- Add validation for new fields (hasVariants, compareAtPrice, costPrice)
- Update ProductFormData interface
- Ensure backward compatibility

**Files to Modify:**
- `src/lib/validations/product.ts` - Update schemas
- `src/types/product.ts` - Update interfaces (if exists)

---

---

### **PART 2: API DEVELOPMENT** (120 minutes)

---

### Task 2.1: Create Page Management API
**Time:** 50 minutes

**Features:**
- GET `/api/admin/pages` - List all pages
- POST `/api/admin/pages` - Create new page with group assignment
- GET `/api/admin/pages/[id]` - Get page details
- PUT `/api/admin/pages/[id]` - Update page and groups
- DELETE `/api/admin/pages/[id]` - Delete page
- GET `/api/admin/pages/[id]/preview` - Preview products for this page

**Files to Create:**
- `src/app/api/admin/pages/route.ts` - List/create pages
- `src/app/api/admin/pages/[id]/route.ts` - CRUD single page
- `src/app/api/admin/pages/[id]/preview/route.ts` - Preview products
- `src/lib/validations/page.ts` - Zod schemas for Page

**Validation Schema:**
```typescript
export const pageSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  groupType: z.enum(["category", "tag", "collection", "all"]),
  groupValues: z.object({
    categoryIds: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    collectionId: z.string().optional(),
    showAll: z.boolean().optional(),
    brands: z.array(z.string()).optional(),
    origins: z.array(z.string()).optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    inStock: z.boolean().optional()
  }),
  layout: z.enum(["grid", "list"]).default("grid"),
  sortBy: z.enum(["name", "price", "newest"]).default("name"),
  itemsPerPage: z.number().min(4).max(100).default(12),
  published: z.boolean().default(false)
});
```

---

### Task 2.2: Create Multi-Level Menu API
**Time:** 40 minutes

**Features:**
- GET `/api/admin/menu-items` - List all menu items (tree structure)
- POST `/api/admin/menu-items` - Create new menu item (with parentId support)
- PUT `/api/admin/menu-items/[id]` - Update menu item
- DELETE `/api/admin/menu-items/[id]` - Delete menu item (cascades to children)
- PATCH `/api/admin/menu-items/reorder` - Reorder menu items

**Files to Create:**
- `src/app/api/admin/menu-items/route.ts` - List/create
- `src/app/api/admin/menu-items/[id]/route.ts` - Update/delete
- `src/app/api/admin/menu-items/reorder/route.ts` - Reorder endpoint
- `src/lib/validations/menu.ts` - Zod schemas

**Validation Schema:**
```typescript
export const menuItemSchema = z.object({
  label: z.string().min(1).max(50),
  position: z.number().min(0),
  visible: z.boolean().default(true),
  openNewTab: z.boolean().default(false),
  parentId: z.string().optional(), // NULL = top-level
  pageId: z.string().optional(),
  externalUrl: z.string().url().optional()
}).refine(
  data => (data.pageId && !data.externalUrl) || (!data.pageId && data.externalUrl) || (!data.pageId && !data.externalUrl),
  { message: "Can link to page OR external URL, not both" }
);
```

---

### Task 2.3: Create Collection Management API
**Time:** 30 minutes

**Features:**
- GET `/api/admin/collections` - List all collections
- POST `/api/admin/collections` - Create new collection
- GET `/api/admin/collections/[id]` - Get collection details
- PUT `/api/admin/collections/[id]` - Update collection
- DELETE `/api/admin/collections/[id]` - Delete collection
- GET `/api/admin/collections/[id]/products` - Get products in collection

**Files to Create:**
- `src/app/api/admin/collections/route.ts` - List/create
- `src/app/api/admin/collections/[id]/route.ts` - CRUD single collection
- `src/app/api/admin/collections/[id]/products/route.ts` - Get collection products
- `src/lib/validations/collection.ts` - Zod schemas

**Validation Schema:**
```typescript
export const collectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  filters: z.object({
    categoryIds: z.array(z.string()).optional(),
    brands: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    origins: z.array(z.string()).optional(),
    difficulties: z.array(z.string()).optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    inStock: z.boolean().optional(),
    featured: z.boolean().optional()
  }),
  layout: z.enum(["grid", "list"]).default("grid"),
  sortBy: z.enum(["name", "price", "newest", "popular"]).default("name"),
  itemsPerPage: z.number().min(4).max(100).default(12),
  metaTitle: z.string().max(60).optional(),
  metaDesc: z.string().max(160).optional(),
  published: z.boolean().default(false)
});
```

---

---

### **PART 3: ADMIN UI - PAGE & MENU MANAGEMENT** (140 minutes)

---

### Task 3.1: Create Page Management UI
**Time:** 60 minutes

**Features:**
- Pages list page with grid layout
- Show: Page title, slug, group type, product count, published status
- Create new page button
- Edit/Delete actions
- Preview products button

**Files to Create:**
- `src/app/admin/pages/page.tsx` - Pages list page
- `src/app/admin/pages/new/page.tsx` - Create page
- `src/app/admin/pages/[id]/edit/page.tsx` - Edit page
- `src/components/admin/pages/PageForm.tsx` - Main form component
- `src/components/admin/pages/GroupSelector.tsx` - Visual group assignment UI
- `src/components/admin/pages/PageCard.tsx` - Page card component

**PageForm Features:**
- Title & slug fields (auto-generate slug)
- Description textarea
- **Group Type Selector** (radio buttons):
  - ( ) Show by Category
  - ( ) Show by Tags
  - ( ) Show by Collection
  - ( ) Show All Products
- **Group Assignment UI** (changes based on type):
  - If Category: Multi-select categories
  - If Tags: Tag input with autocomplete
  - If Collection: Dropdown of collections
  - If All: No additional fields
- Additional filters (brands, origins, price range, stock)
- Display options (layout, sort, items per page)
- SEO fields
- **Preview button** - Shows product count and sample products
- Publish toggle

---

### Task 3.2: Create Multi-Level Menu Management UI
**Time:** 60 minutes

**Features:**
- Menu items list with tree/hierarchical view
- Show parent-child relationships visually
- Drag-drop reordering (within same level)
- Create menu item / submenu item
- Edit/Delete actions
- Visual preview of menu structure

**Files to Create:**
- `src/app/admin/menu/page.tsx` - Menu management page
- `src/components/admin/menu/MenuTree.tsx` - Hierarchical tree view
- `src/components/admin/menu/MenuItemForm.tsx` - Create/edit form
- `src/components/admin/menu/MenuPreview.tsx` - Visual preview

**MenuItemForm Features:**
- Label input
- Parent menu selector (dropdown of top-level items, or "None" for top-level)
- Type selector (Page / External URL)
- If Page: Dropdown of published pages
- If External: URL input field
- Open in new tab checkbox
- Visible checkbox
- Auto-position assignment

**MenuTree Features:**
```
└─ Home (visible)
└─ Products (visible)
   ├─ European Parts (visible)
   ├─ American Parts (visible)
   └─ Asian Parts (hidden)
└─ About (visible)
└─ Contact (visible)
```

**Drag-Drop Library:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

---

### Task 3.3: Create Collection Management UI
**Time:** 20 minutes

**Features:**
- Collections list page (simple grid)
- Create/Edit/Delete collections
- Visual filter builder for automatic product matching
- Preview matching products

**Files to Create:**
- `src/app/admin/collections/page.tsx` - Collections list
- `src/app/admin/collections/new/page.tsx` - Create collection
- `src/app/admin/collections/[id]/edit/page.tsx` - Edit collection
- `src/components/admin/collections/CollectionForm.tsx` - Form
- `src/components/admin/collections/FilterBuilder.tsx` - Visual filter builder

---

---

### **PART 4: UPDATE PRODUCT FORM** (40 minutes)

---

### Task 4.1: Simplify Product Form UI
**Time:** 40 minutes

**Actions:**
- Remove form sections for deleted fields
- Add new fields (hasVariants, compareAtPrice, costPrice)
- Simplify UI - remove complexity
- Add "Variants" tab/section (placeholder for now)
- Update form validation

**Files to Modify:**
- `src/components/admin/parts/ProductForm.tsx` - Remove ~200 lines of complex fields
- `src/app/admin/parts/new/page.tsx` - Update if needed
- `src/app/admin/parts/[id]/edit/page.tsx` - Update if needed

**Sections to Remove:**
- ❌ Fitting Difficulty section
- ❌ Installation Video section
- ❌ Installation Guide upload section
- ❌ Warranty section
- ❌ Certifications section
- ❌ Related Products section
- ❌ Compatibility Tags section
- ❌ Specifications (complex JSON)

**Sections to Keep/Add:**
- ✅ Basic Info (name, partNumber, description)
- ✅ Category selector
- ✅ Pricing (price, compareAtPrice, costPrice)
- ✅ Inventory (sku, stock, tracking)
- ✅ Images (multi-upload)
- ✅ Simple metadata (brand, origin, weight, tags)
- ✅ SEO (metaTitle, metaDescription)
- ✅ Status (published, featured)
- ➕ NEW: Variants checkbox (hasVariants) - opens variants tab

**New Simplified Form Layout:**
```
┌────────────────────────────────────────┐
│ Add Product                   [Save]  │
├────────────────────────────────────────┤
│ [Basic Info] [Pricing] [Inventory]    │
│ [Images] [Organization] [SEO]         │
├────────────────────────────────────────┤
│                                        │
│ Basic Info                             │
│ Name:        [________________]        │
│ Part Number: [________________]        │
│ Description: [________________]        │
│ Category:    [Select... ▼]            │
│                                        │
│ Pricing                                │
│ Price:       [________] AED            │
│ Compare At:  [________] (show discount)│
│ Cost:        [________] (profit calc)  │
│                                        │
│ Inventory                              │
│ SKU:         [________]                │
│ Stock:       [________]                │
│ □ Track inventory                      │
│                                        │
│ Images                                 │
│ [Drag & drop or click to upload]      │
│ [img] [img] [img]                      │
│                                        │
│ Organization                           │
│ Brand:       [________]                │
│ Origin:      [European ▼]              │
│ Weight:      [________] kg             │
│ Tags:        [× OEM] [× Premium] [+]  │
│                                        │
│ Product Variants (Optional)            │
│ □ This product has variants            │
│   (color, size, year model, etc.)     │
│                                        │
│ SEO                                    │
│ Meta Title:  [____________________]   │
│ Meta Desc:   [____________________]   │
│                                        │
│ Status                                 │
│ ☑ Published  ☐ Featured               │
│                                        │
│              [Cancel]  [Save Product]  │
└────────────────────────────────────────┘
```

---

---

### **PART 5: PUBLIC PAGES & NAVIGATION** (70 minutes)

---

### Task 5.1: Create Public Page Renderer
**Time:** 50 minutes

**Features:**
- Dynamic route: `/pages/[slug]`
- Fetch page details and group values
- Query products based on group type and filters
- Display products in grid (reuse existing ProductCard)
- Pagination
- Breadcrumbs
- SEO meta tags from page

**Files to Create:**
- `src/app/(public)/pages/[slug]/page.tsx` - Dynamic page renderer
- `src/app/api/public/pages/[slug]/route.ts` - Public page API
- `src/lib/page-products.ts` - Logic to fetch products based on group

**Product Fetching Logic:**
```typescript
export async function getPageProducts(
  pageId: string,
  page: number = 1,
  pageSize: number = 12
) {
  const pageData = await prisma.page.findUnique({
    where: { id: pageId, published: true }
  });
  
  if (!pageData) return null;
  
  const groupValues = pageData.groupValues as PageGroupValues;
  
  // Build Prisma where clause based on group type
  let where: any = { published: true };
  
  if (pageData.groupType === "category" && groupValues.categoryIds) {
    where.categoryId = { in: groupValues.categoryIds };
  }
  else if (pageData.groupType === "tag" && groupValues.tags) {
    where.tags = { hasSome: groupValues.tags };
  }
  else if (pageData.groupType === "collection" && groupValues.collectionId) {
    // Fetch collection and apply its filters
    const collection = await prisma.collection.findUnique({
      where: { id: groupValues.collectionId }
    });
    // Apply collection filters...
  }
  // "all" type shows all products
  
  // Apply additional filters
  if (groupValues.brands?.length) {
    where.brand = { in: groupValues.brands };
  }
  if (groupValues.origins?.length) {
    where.origin = { in: groupValues.origins };
  }
  if (groupValues.inStock) {
    where.stockQuantity = { gt: 0 };
  }
  if (groupValues.minPrice) {
    where.price = { ...where.price, gte: groupValues.minPrice };
  }
  if (groupValues.maxPrice) {
    where.price = { ...where.price, lte: groupValues.maxPrice };
  }
  
  const [products, total] = await Promise.all([
    prisma.part.findMany({
      where,
      include: { category: true },
      orderBy: getSortOrder(pageData.sortBy),
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.part.count({ where })
  ]);
  
  return { pageData, products, total };
}
```

---

### Task 5.2: Update Header Navigation (Multi-Level Menu)
**Time:** 20 minutes

**Features:**
- Fetch menu items from database (with parent-child structure)
- Display top-level items in header
- Show dropdowns for items with children (submenus)
- Active link highlighting
- Responsive mobile menu with submenu support
- Support external links and new tab

**Files to Modify:**
- `src/components/ui/Navigation.tsx` - Fetch from DB, render tree structure
- `src/components/Header.tsx` - Pass menu items to Navigation

**Dynamic Multi-Level Navigation:**
```typescript
// Fetch menu items server-side with hierarchy
const menuItems = await prisma.menuItem.findMany({
  where: { visible: true, parentId: null }, // Top-level only
  include: {
    children: {
      where: { visible: true },
      orderBy: { position: 'asc' },
      include: { page: { select: { slug: true } } }
    },
    page: { select: { slug: true } }
  },
  orderBy: { position: 'asc' }
});

// Render with dropdown support
{menuItems.map(item => (
  <div key={item.id}>
    {item.children.length > 0 ? (
      // Has submenu - show dropdown
      <DropdownMenu>
        <DropdownMenuTrigger>{item.label}</DropdownMenuTrigger>
        <DropdownMenuContent>
          {item.children.map(child => (
            <DropdownMenuItem key={child.id}>
              <Link href={getMenuItemUrl(child)}>
                {child.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      // No submenu - regular link
      <Link href={getMenuItemUrl(item)} target={item.openNewTab ? "_blank" : undefined}>
        {item.label}
      </Link>
    )}
  </div>
))}
```

---

---

### **PART 6: FINALIZATION** (60 minutes)

---

### Task 6.1: Add to Admin Sidebar
**Time:** 10 minutes

**Actions:**
- Add "Pages" link to admin sidebar
- Add "Menu" link to admin sidebar
- Add "Collections" link to admin sidebar (under Products section)
- Update active link highlighting

**Files to Modify:**
- `src/components/admin/Sidebar.tsx` - Add 3 new navigation items

**New Sidebar Structure:**
```
Dashboard
├─ Products
│  ├─ All Products
│  ├─ Categories
│  └─ Collections (NEW)
├─ Pages (NEW)
├─ Menu (NEW)
├─ Orders
├─ Users
└─ Settings
```

---

### Task 6.2: Update Product Table (Remove Old Columns)
**Time:** 15 minutes

**Actions:**
- Remove columns for deleted fields from product table
- Add new columns (hasVariants, compareAtPrice)
- Update bulk operations if needed

**Files to Modify:**
- `src/components/admin/parts/ProductTable.tsx` - Remove old columns

**Columns to Remove:**
- ❌ Fitting Difficulty
- ❌ Warranty
- ❌ Certifications

**Columns to Keep/Add:**
- ✅ Name, Part Number, Category, Price, Stock, Status
- ➕ Compare At Price (optional display)
- ➕ Variants indicator (icon if hasVariants = true)

---

### Task 6.3: Create Product Filtering Utility
**Time:** 15 minutes

**Actions:**
- Create reusable utility to filter products by various criteria
- Used by pages, collections, and search

**Files to Create:**
- `src/lib/product-filters.ts` - Centralized filtering logic

**Utility Functions:**
```typescript
export function buildProductWhereClause(filters: ProductFilters) {
  const where: any = { published: true };
  
  if (filters.categoryIds?.length) {
    where.categoryId = { in: filters.categoryIds };
  }
  if (filters.tags?.length) {
    where.tags = { hasSome: filters.tags };
  }
  if (filters.brands?.length) {
    where.brand = { in: filters.brands };
  }
  if (filters.origins?.length) {
    where.origin = { in: filters.origins };
  }
  if (filters.inStock) {
    where.stockQuantity = { gt: 0 };
  }
  if (filters.featured !== undefined) {
    where.featured = filters.featured;
  }
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }
  
  return where;
}

export function getSortOrder(sortBy: string) {
  switch (sortBy) {
    case "name": return { name: "asc" };
    case "price": return { price: "asc" };
    case "newest": return { createdAt: "desc" };
    default: return { name: "asc" };
  }
}
```

---

### Task 6.4: Polish & Test
**Time:** 20 minutes

**Actions:**
- Test page creation and product group assignment
- Test multi-level menu creation and reordering
- Test submenu dropdowns on public site
- Test collection creation
- Test product form simplification
- Loading states for all actions
- Error handling with toast notifications
- Empty states (no pages, no menu items)
- Responsive design verification
- Test all CRUD operations

**Product Filtering Logic:**
```typescript
export async function getCollectionProducts(
  collectionId: string,
  page: number = 1,
  pageSize: number = 12
) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId, published: true }
  });
  
  if (!collection) return null;
  
  const filters = collection.filters as CollectionFilters;
  
  // Build Prisma where clause from filters
  const where = {
    published: true,
    ...(filters.categoryIds?.length && {
      categoryId: { in: filters.categoryIds }
    }),
    ...(filters.brands?.length && {
      brand: { in: filters.brands }
    }),
    ...(filters.tags?.length && {
      tags: { hasSome: filters.tags }
    }),
    ...(filters.origins?.length && {
      origin: { in: filters.origins }
    }),
    ...(filters.inStock && {
      stockQuantity: { gt: 0 }
    }),
    ...(filters.featured !== undefined && {
      featured: filters.featured
    }),
    ...(filters.minPrice && {
      price: { gte: filters.minPrice }
    }),
    ...(filters.maxPrice && {
      price: { lte: filters.maxPrice }
    })
  };
  
  const [products, total] = await Promise.all([
    prisma.part.findMany({
      where,
      include: { category: true },
      orderBy: getSortOrder(collection.sortBy),
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.part.count({ where })
  ]);
  
  return { collection, products, total };
}
```

---

### Task 7: Update Header Navigation
**Time:** 40 minutes

**Features:**
- Fetch menu items from database
- Display in header navigation
- Active link highlighting
- Responsive mobile menu
- Support external links and new tab

**Files to Modify:**
- `src/components/ui/Navigation.tsx` - Fetch from DB instead of hardcoded
- `src/components/Header.tsx` - Pass menu items to Navigation

**Dynamic Navigation:**
```typescript
// Fetch menu items server-side
const menuItems = await prisma.menuItem.findMany({
  where: { visible: true },
  include: { collection: { select: { slug: true } } },
  orderBy: { position: 'asc' }
});

// Render
{menuItems.map(item => (
  <Link
    key={item.id}
    href={item.externalUrl || `/collections/${item.collection?.slug}`}
    target={item.openNewTab ? "_blank" : undefined}
    className={pathname === href ? 'active' : ''}
  >
    {item.label}
  </Link>
))}
```

---

### Task 8: Add to Admin Sidebar
**Time:** 15 minutes

**Actions:**
- Add "Collections" link to admin sidebar
- Add "Menu" link to admin sidebar
- Update active link highlighting

**Files to Modify:**
- `src/components/admin/Sidebar.tsx` - Add new navigation items

---

### Task 9: Polish & Test
**Time:** 45 minutes

**Features:**
- Test collection creation and filtering
- Test menu item CRUD and reordering
- Test public collection pages
- Test header navigation updates
- Loading states
- Error handling
- Empty states
- Responsive design
- SEO verification

---

## 📁 Files Structure

```
src/
├── app/
│   ├── (public)/
│   │   └── collections/
│   │       └── [slug]/
│   │           └── page.tsx          (NEW) Public collection page
│   │
│   ├── admin/
│   │   ├── collections/
│   │   │   ├── page.tsx              (NEW) Collections list
│   │   │   ├── new/
│   │   │   │   └── page.tsx          (NEW) Create collection
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx      (NEW) Edit collection
│   │   │
│   │   └── menu/
│   │       └── page.tsx              (NEW) Menu management
│   │
│   └── api/
│       ├── admin/
│       │   ├── collections/
│       │   │   ├── route.ts          (NEW) List/create
│       │   │   └── [id]/
│       │   │       ├── route.ts      (NEW) CRUD
│       │   │       └── preview/
│       │   │           └── route.ts  (NEW) Preview products
│       │   │
│       │   └── menu-items/
│       │       ├── route.ts          (NEW) List/create
│       │       ├── [id]/
│       │       │   └── route.ts      (NEW) Update/delete
│       │       └── reorder/
│       │           └── route.ts      (NEW) Reorder
│       │
│       └── public/
│           └── collections/
│               └── [slug]/
│                   └── route.ts      (NEW) Public collection API
│
├── components/
│   ├── admin/
│   │   ├── collections/              (NEW)
│   │   │   ├── CollectionForm.tsx
│   │   │   ├── FilterBuilder.tsx
│   │   │   └── CollectionCard.tsx
│   │   │
│   │   └── menu/                     (NEW)
│   │       ├── MenuItemList.tsx
│   │       ├── MenuItemForm.tsx
│   │       └── MenuPreview.tsx
│   │
│   └── ui/
│       └── Navigation.tsx            (MODIFY) Dynamic menu from DB
│
└── lib/
    ├── validations/
    │   ├── collection.ts             (NEW) Collection schemas
    │   └── menu.ts                   (NEW) Menu item schemas
    │
    └── collection-filters.ts         (NEW) Filter logic utility
```

---

## 🎨 Design Specifications

### Collections List Page
```
┌────────────────────────────────────────────────────────┐
│ Collections                       [+ New Collection]   │
├────────────────────────────────────────────────────────┤
│ 🔍 Search collections...                               │
├────────────────────────────────────────────────────────┤
│                                                         │
│ ┌───────────────────────────────────────────┐         │
│ │ European Engine Parts        [Edit] [Del] │         │
│ │ /collections/european-engines             │         │
│ │ 📦 24 products  •  🟢 Published  •  📋 In Menu│      │
│ │                                           │         │
│ │ Filters: Category: Engine Parts, Origin: │         │
│ │          European, Brand: Bosch, ZF      │         │
│ └───────────────────────────────────────────┘         │
│                                                         │
│ ┌───────────────────────────────────────────┐         │
│ │ Truck Brake Systems          [Edit] [Del] │         │
│ │ /collections/truck-brakes                 │         │
│ │ 📦 18 products  •  ⚪ Draft  •  ❌ Not in Menu│       │
│ └───────────────────────────────────────────┘         │
└────────────────────────────────────────────────────────┘
```

### Collection Form (Filter Builder)
```
┌────────────────────────────────────────────────────────┐
│ Create Collection                         [Preview]    │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Basic Information                                       │
│ Name:        [European Engine Parts_____________]      │
│ Slug:        [european-engines__________________]      │
│ Description: [Premium European engine parts......]     │
│                                                         │
│ ────────────────────────────────────────────────────── │
│                                                         │
│ Product Filters                                         │
│                                                         │
│ Categories:  [Select categories...]                    │
│              ☑ Engine Parts  ☐ Brakes  ☐ Transmission │
│                                                         │
│ Brands:      [+ Add brand]                             │
│              × Bosch    × ZF    × Continental          │
│                                                         │
│ Tags:        [Select tags...]                          │
│              ☑ Premium  ☐ OEM  ☑ Performance          │
│                                                         │
│ Origin:      ☑ European  ☐ American  ☐ Asian          │
│                                                         │
│ Difficulty:  ☑ Expert  ☑ Intermediate  ☐ Beginner     │
│                                                         │
│ Price Range: [0 ────────●────────────●──── 1000]      │
│              Min: $0           Max: $500               │
│                                                         │
│ Stock:       ☑ Only show in-stock items                │
│ Featured:    ☐ Only show featured products             │
│                                                         │
│ ────────────────────────────────────────────────────── │
│                                                         │
│ Display Settings                                        │
│ Layout:      (•) Grid    ( ) List                      │
│ Sort By:     [Name ▼]                                  │
│ Per Page:    [12 ▼]                                    │
│                                                         │
│ ────────────────────────────────────────────────────── │
│                                                         │
│ SEO                                                     │
│ Meta Title:  [____________________________]            │
│ Meta Desc:   [____________________________]            │
│                                                         │
│ Publishing                                              │
│ ☑ Publish immediately                                  │
│ ☑ Add to navigation menu                               │
│   Menu Label: [European Engines__________]             │
│   Position:   [3__] (after Products)                   │
│                                                         │
│              [Cancel]          [Create Collection]     │
└────────────────────────────────────────────────────────┘
```

### Menu Management Page
```
┌────────────────────────────────────────────────────────┐
│ Navigation Menu                   [+ Add Menu Item]    │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Drag to reorder menu items:                            │
│                                                         │
│ ┌─────────────────────────────────────────────┐       │
│ │ ⣿ Home              🏠 External  👁️  [↕] [✏️] [🗑️]│       │
│ │   /                                         │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
│ ┌─────────────────────────────────────────────┐       │
│ │ ⣿ Products          📦 Collection  👁️  [↕] [✏️] [🗑️]│       │
│ │   /collections/all-products                 │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
│ ┌─────────────────────────────────────────────┐       │
│ │ ⣿ European Engines  📦 Collection  👁️  [↕] [✏️] [🗑️]│       │
│ │   /collections/european-engines             │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
│ ┌─────────────────────────────────────────────┐       │
│ │ ⣿ About Us          🏠 External  👁️  [↕] [✏️] [🗑️]│       │
│ │   /about                                    │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
│ ┌─────────────────────────────────────────────┐       │
│ │ ⣿ Contact           🏠 External  🚫  [↕] [✏️] [🗑️]│       │
│ │   /contact          (Hidden)                │       │
│ └─────────────────────────────────────────────┘       │
│                                                         │
│ Preview:                                                │
│ ┌─────────────────────────────────────────────┐       │
│ │ [Home] [Products] [European Engines] [About]│       │
│ └─────────────────────────────────────────────┘       │
└────────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### 1. Multi-Level Menu System ✓
- [ ] Admin can create top-level menu items
- [ ] Admin can create submenu items (child of parent)
- [ ] Drag-drop reordering works (within same level)
- [ ] Submenus display as dropdowns in header navigation
- [ ] Can link menu items to pages or external URLs
- [ ] Show/hide toggle without deletion
- [ ] Open in new tab option works
- [ ] Menu hierarchy displays correctly (tree view in admin)
- [ ] Mobile menu supports submenus

### 2. Page Management with Product Groups ✓
- [ ] Admin can create blank pages
- [ ] Admin can assign product group type (category, tag, collection, all)
- [ ] Admin can select specific categories/tags/collections
- [ ] Products automatically display based on group assignment
- [ ] Can add additional filters (brands, origins, price, stock)
- [ ] Product count preview before publishing
- [ ] Each page has unique SEO-friendly URL (`/pages/[slug]`)
- [ ] Pages render correctly on public site
- [ ] Pagination works on pages

### 3. Product Field Simplification ✓
- [ ] Removed 8 unnecessary fields from Part model
- [ ] Migration runs without data loss (or acceptable loss documented)
- [ ] ProductForm simplified (removed ~200 lines)
- [ ] Added new Shopify-style fields (hasVariants, compareAtPrice, costPrice)
- [ ] Product table updated (removed old columns)
- [ ] All existing products continue to work
- [ ] Validation schemas updated
- [ ] Zero TypeScript compilation errors

### 4. Collections System ✓
- [ ] Can create collections with auto-filter rules
- [ ] Can manually select products for collections (override filters)
- [ ] Collections have unique URLs
- [ ] Product count updates based on filters

### 5. User Experience ✓
- [ ] Intuitive page creation interface
- [ ] Clear group type selector (radio buttons)
- [ ] Visual group assignment UI changes based on type
- [ ] Menu tree view easy to understand
- [ ] Preview buttons show accurate results
- [ ] Loading states during all operations
- [ ] Error messages for invalid inputs
- [ ] Mobile-responsive UI

### 6. Technical Quality ✓
- [ ] Multi-level menu queries optimized (avoid N+1 problem)
- [ ] Product filtering logic centralized and reusable
- [ ] Fast page loads (<2s)
- [ ] Proper database indexing (parentId, position, slug)
- [ ] TypeScript type safety throughout
- [ ] Clean code architecture
- [ ] Cascading deletes work correctly (delete parent → delete children)

---

## 💡 Future Enhancements

- [ ] Collection templates (popular filter combinations)
- [ ] Smart collections (auto-update as products change)
- [ ] Collection analytics (views, clicks)
- [ ] Mega menu support (dropdowns)
- [ ] Collection scheduling (show/hide by date)
- [ ] A/B testing different collections
- [ ] Collection-specific banners/promotions
- [ ] Multi-level menu support
- [ ] Collection sorting rules (manual product order)

---

## 📊 Progress Tracking

| Part | Task | Estimated | Actual | Status |
|------|------|-----------|--------|--------|
| **PART 1** | **Database & Product Simplification** | **90 min** | - | - |
| 1.1 | Extend Database Schema | 30 min | - | ⬜ Not started |
| 1.2 | Simplify Product Schema | 40 min | - | ⬜ Not started |
| 1.3 | Update Validation Schemas | 20 min | - | ⬜ Not started |
| **PART 2** | **API Development** | **120 min** | - | - |
| 2.1 | Page Management API | 50 min | - | ⬜ Not started |
| 2.2 | Multi-Level Menu API | 40 min | - | ⬜ Not started |
| 2.3 | Collection Management API | 30 min | - | ⬜ Not started |
| **PART 3** | **Admin UI** | **140 min** | - | - |
| 3.1 | Page Management UI | 60 min | - | ⬜ Not started |
| 3.2 | Multi-Level Menu UI | 60 min | - | ⬜ Not started |
| 3.3 | Collection Management UI | 20 min | - | ⬜ Not started |
| **PART 4** | **Update Product Form** | **40 min** | - | - |
| 4.1 | Simplify Product Form UI | 40 min | - | ⬜ Not started |
| **PART 5** | **Public Pages & Navigation** | **70 min** | - | - |
| 5.1 | Public Page Renderer | 50 min | - | ⬜ Not started |
| 5.2 | Update Header Navigation | 20 min | - | ⬜ Not started |
| **PART 6** | **Finalization** | **60 min** | - | - |
| 6.1 | Add to Admin Sidebar | 10 min | - | ⬜ Not started |
| 6.2 | Update Product Table | 15 min | - | ⬜ Not started |
| 6.3 | Product Filtering Utility | 15 min | - | ⬜ Not started |
| 6.4 | Polish & Test | 20 min | - | ⬜ Not started |
| | **TOTAL** | **~8.5 hours** | - | - |

**Note**: Increased from original 4-5 hours to accommodate all 3 requirements:
1. Multi-level menu system (+1.5 hours)
2. Page management with product groups (+2 hours)
3. Product field simplification (+1 hour)

---

## 🔗 Dependencies

**Required Before Starting:**
- Phase 3: Product Management (products to display in collections)
- Phase 4: Category Management (category filters)
- Phase 4.5: Product Showcase System (product display components)

**External Libraries:**
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0"
}
```

---

**Status:** High priority - enables dynamic navigation and product organization! 🎯
