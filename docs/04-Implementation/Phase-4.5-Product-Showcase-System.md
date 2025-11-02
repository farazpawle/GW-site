# Phase 4.5: Product Showcase System (with Future E-commerce Capability)

**Status:** � In Progress (30% Complete)  
**Priority:** HIGH (Essential for Public Website)  
**Type:** Product Showcase/Portfolio with E-commerce Toggle  
**Estimated Time:** 12-16 hours  
**Completion:** 30% (6 of 20 tasks complete)  
**Last Updated:** January 6, 2025

---

## 🎯 Goal

Build a **dual-mode product system** that can function as either:
1. **Showcase Mode** (Default): Portfolio/catalog for demonstrating product range
2. **E-commerce Mode**: Full online store with pricing, cart, checkout

The system includes a **global site-wide toggle** to switch between modes instantly.

**Think of it as:**
- 🚗 A car dealership's "Our Inventory" showcase → with option to enable "Buy Online"
- 🏭 A manufacturer's product catalog → with option to enable "Request Quote"
- 📋 A distributor's capability demonstration → with option to enable "Order Now"
- 🎨 A portfolio that can transform into a store

**What Success Looks Like:**

### Showcase Mode (Current Default):
- ✅ Visitors see impressive product catalog with rich details
- ✅ Products organized by categories, tags, brands, origin
- ✅ Professional showcase pages with specs, videos, PDFs
- ✅ NO pricing visible, NO stock status, NO "Buy Now" buttons
- ✅ Generic CTA: "Contact Us for Details"

### E-commerce Mode (Toggle ON):
- ✅ All showcase features PLUS pricing display
- ✅ Stock availability indicators
- ✅ "Add to Cart" buttons
- ✅ Shopping cart functionality
- ✅ Checkout process
- ✅ Product-specific "Inquire Now" CTAs

### Admin Always Has:
- ✅ Full control over pricing and inventory
- ✅ All e-commerce fields always visible and editable
- ✅ Toggle switch to enable/disable e-commerce mode
- ✅ Preview both modes before switching

---

## 🏗️ Database Schema - Enhanced for Showcase

### Updated Part Model

```prisma
model Part {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  description   String?  @db.Text
  shortDesc     String?
  partNumber    String   @unique
  
  // ============================================
  // SHOWCASE-SPECIFIC FIELDS (NEW)
  // ============================================
  
  // Publishing
  published     Boolean   @default(false)
  publishedAt   DateTime?
  views         Int       @default(0)
  showcaseOrder Int       @default(999)  // Manual sorting priority (lower = higher priority)
  
  // Rich Metadata for Showcase
  tags          String[]  // ["Premium", "Heavy Duty", "Best Seller", "New Arrival"]
  brand         String?   // "Bosch", "OEM", "Aftermarket", "Garrit & Wulf"
  origin        String?   // "Germany", "Japan", "USA", "UAE", "China"
  certifications String[] // ["ISO 9001", "OEM Certified", "TÜV Approved"]
  warranty      String?   // "2 Years", "Lifetime", "6 Months"
  difficulty    String?   // "Easy", "Moderate", "Professional", "Advanced"
  application   String[]  // ["Commercial Vehicles", "Passenger Cars", "Trucks", "SUVs"]
  
  // Enhanced Media
  videoUrl      String?   // YouTube/Vimeo demo or installation video
  pdfUrl        String?   // Technical manual/datasheet PDF link
  
  // ============================================
  // E-COMMERCE FIELDS (ALWAYS FUNCTIONAL)
  // ============================================
  price         Decimal   @db.Decimal(10, 2)      // Always editable in admin
  comparePrice  Decimal?  @db.Decimal(10, 2)      // Always editable in admin
  inStock       Boolean   @default(true)           // Always editable in admin
  stockQuantity Int       @default(0)              // Always editable in admin
  
  // Note: These fields are ALWAYS managed in admin panel.
  // Display on public website is controlled by SiteSettings.ecommerceEnabled
  
  // ============================================
  // EXISTING FIELDS
  // ============================================
  images        String[]
  specifications Json?
  compatibility String[]  // Compatible vehicle models
  categoryId    String
  featured      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  category      Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  orderItems    OrderItem[] // Keep for future e-commerce
  
  @@index([published, showcaseOrder])        // For ordered showcase
  @@index([published, categoryId])           // For category filtering
  @@index([published, featured])             // For featured products
  @@index([slug])                            // For SEO URLs
  @@map("parts")
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_showcase_fields_to_parts
```

---

## 📋 Task Breakdown

### ✅ Task 0: Site Settings Table (30 minutes) - COMPLETE

**What to do:**
1. Create SiteSettings model for global configuration
2. Add default settings including ecommerce toggle
3. Create admin API to manage settings

**Database Schema:**
```prisma
model SiteSettings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt
  
  @@map("site_settings")
}

// Default settings to seed:
// {
//   "key": "ecommerce_enabled",
//   "value": { "enabled": false, "enabledAt": null }
// }
// {
//   "key": "currency",
//   "value": { "code": "AED", "symbol": "AED", "position": "before" }
// }
// {
//   "key": "contact_info",
//   "value": { "email": "info@garritwulf.com", "phone": "+971502345678", "whatsapp": "+971502345678" }
// }
```

**Admin API Endpoint:**
```typescript
// GET/PUT /api/admin/settings
{
  "ecommerce_enabled": false,
  "currency": "AED",
  "contact_email": "info@garritwulf.com"
}
```

**Files to Create:**
- `prisma/schema.prisma` - Add SiteSettings model
- `src/app/api/admin/settings/route.ts` - Settings CRUD API
- `src/lib/settings.ts` - Helper to read settings (cached)

**Acceptance Criteria:**
- ✅ SiteSettings table created (migration: 20251006163631_add_site_settings_table)
- ✅ Default settings seeded (ecommerce_enabled, currency, contact_info)
- 🔲 Admin can read/update settings (Task 3.1 - API not yet created)
- ✅ Settings cached for performance (src/lib/settings.ts with 60s TTL)

**Completion Summary:**
- Created SiteSettings model with id, key (unique), value (Json), updatedAt
- Seeded 3 default settings using upsert pattern in prisma/seed.ts
- Settings helper library created with Map-based caching (60 second TTL)
- Functions: getSiteSetting(), isEcommerceEnabled(), getCurrencySettings(), getContactInfo(), clearSettingsCache()

---

### ✅ Task 0.5: Default Settings Seed (15 minutes) - COMPLETE

**What was done:**
Extended `prisma/seed.ts` with SiteSettings data using upsert pattern for idempotency.

**Settings Seeded:**
```typescript
// 1. E-commerce toggle (default: disabled)
{ key: 'ecommerce_enabled', value: { enabled: false, enabledAt: null } }

// 2. Currency configuration
{ key: 'currency', value: { code: 'AED', symbol: 'AED', position: 'before' } }

// 3. Contact information
{ key: 'contact_info', value: { 
  email: 'info@garritwulf.com',
  phone: '+971502345678',
  whatsapp: '+971502345678'
}}
```

**Acceptance Criteria:**
- ✅ Seed script runs without errors
- ✅ Settings inserted with upsert (idempotent)
- ✅ Default e-commerce mode is disabled (showcase mode)
- ✅ NPM script `npm run db:seed` works

---

### ✅ Task 1: Database Schema Enhancement (1.5 hours) - COMPLETE

**What to do:**
1. Add showcase-specific fields to Part model
2. Keep e-commerce fields (price, stock) but mark as "future use"
3. Run migration
4. Update TypeScript types

**New Fields:**
- `published`, `publishedAt`, `views` - Publishing control
- `showcaseOrder` - Manual priority sorting
- `tags[]` - Multiple labels ("Premium", "Heavy Duty")
- `brand` - Manufacturer/brand name
- `origin` - Country of origin
- `certifications[]` - Quality certifications
- `warranty` - Warranty information
- `difficulty` - Installation difficulty level
- `application[]` - Use cases (Commercial, Passenger, etc.)
- `videoUrl` - Demo/installation video
- `pdfUrl` - Technical documentation

**Files to Modify:**
- `prisma/schema.prisma`
- `src/types/product.ts` (update TypeScript types)

**Acceptance Criteria:**
- ✅ Migration runs successfully (20251006164653_add_showcase_fields_to_parts)
- ✅ All existing products retain data (non-breaking changes)
- ✅ New fields are optional (all nullable or have defaults)
- ✅ TypeScript types reflect new schema (will update after Prisma Client regenerates)

**Completion Summary:**
- Added 13 new fields to Part model in prisma/schema.prisma
- Fields: published (Boolean), publishedAt (DateTime?), views (Int), showcaseOrder (Int), tags (String[]), brand (String?), origin (String?), certifications (String[]), warranty (String?), difficulty (String?), application (String[]), videoUrl (String?), pdfUrl (String?)
- Created 3 indexes: [published, showcaseOrder], [published, categoryId], [published, featured]
- Migration applied successfully without data loss
- All fields backward compatible (nullable or default values)

---

### ✅ Task 1.5: TypeScript Types (30 minutes) - COMPLETE

**What was done:**
Created `src/types/product.ts` with comprehensive type definitions for the dual-mode showcase system.

**9 Type Definitions Created:**
1. `ProductWithCategory` - Part with category relation
2. `ShowcaseFields` - 13 showcase-specific fields
3. `ProductFormData` - Complete form data (26 fields including showcase)
4. `SerializedProduct` - Decimal→number conversion for client components
5. `SerializedProductWithOptionalPricing` - Mode-aware type (pricing optional)
6. `ProductListItem` - Minimal fields for list views
7. `ProductFilters` - Query parameters for filtering
8. `ProductApiResponse` - API response with mode indicator
9. `ProductShowcaseCard` props types

**Acceptance Criteria:**
- ✅ All showcase fields typed correctly
- ✅ Mode-aware types created (pricing optional based on mode)
- ✅ Serialized types handle Prisma Decimal conversion
- ✅ Form data types include all 26 fields
- ✅ API response types include mode indicator

---

### ✅ Task 2.1: Validation Schemas (45 minutes) - COMPLETE

**What was done:**
Extended `src/lib/validations/product.ts` with Zod schemas for all showcase fields.

**Schemas Created/Extended:**
```typescript
// New showcase fields schema (13 fields)
showcaseFieldsSchema = z.object({
  published: z.boolean().default(false),
  publishedAt: z.date().optional().nullable(),
  showcaseOrder: z.number().int().min(1).default(999),
  tags: z.array(z.string()).default([]),
  brand: z.string().max(100).optional().nullable(),
  origin: z.string().max(100).optional().nullable(),
  certifications: z.array(z.string()).default([]),
  warranty: z.string().max(200).optional().nullable(),
  difficulty: z.enum(['Easy','Moderate','Professional','Advanced']).optional().nullable(),
  application: z.array(z.string()).default([]),
  videoUrl: z.string().url().optional().or(z.literal('')).nullable(),
  pdfUrl: z.string().url().optional().or(z.literal('')).nullable(),
  views: z.number().int().min(0).default(0)
})

// Merged schema for product with showcase fields
productSchemaWithShowcase = productSchema.merge(showcaseFieldsSchema)

// Exported type for form handling
ShowcaseFieldsInput = z.infer<typeof showcaseFieldsSchema>
```

**Acceptance Criteria:**
- ✅ All showcase fields have validation rules
- ✅ URL fields validate format (or empty string/null)
- ✅ Enums defined for difficulty levels
- ✅ Arrays default to empty []
- ✅ Schema merged with existing productSchema
- ✅ Type inference works correctly

---

### ✅ Task 2.2: Settings Helper Library (45 minutes) - COMPLETE

**What was done:**
Created `src/lib/settings.ts` with settings management and caching infrastructure.

**Features Implemented:**
- **In-Memory Caching**: Map-based cache with 60-second TTL
- **6 Helper Functions**:
  1. `getSiteSetting(key)` - Generic setting retrieval with caching
  2. `isEcommerceEnabled()` - Check if e-commerce mode is on
  3. `getCurrencySettings()` - Get currency config (code, symbol, position)
  4. `getContactInfo()` - Get contact details (email, phone, whatsapp)
  5. `clearSettingsCache()` - Force cache invalidation
  6. `prefetchSettings()` - Preload common settings

**Cache Strategy:**
- Settings cached for 60 seconds
- Automatic cache invalidation on timeout
- Manual cache clearing when settings updated
- Minimizes database queries for frequently accessed settings

**Acceptance Criteria:**
- ✅ Settings retrieved from database
- ✅ Cache reduces database load (60s TTL)
- ✅ Type-safe helper functions
- ✅ Cache clearing mechanism for updates
- ✅ JSDoc comments for all functions
- ✅ 145 lines of production-ready code

---

### 🔲 Task 2: Admin - Product Form Enhancement (2 hours) - PENDING

**What to do:**
1. Add new showcase fields to ProductForm
2. Multi-select for tags, certifications, application
3. URL inputs for video and PDF
4. Showcase order number input
5. **KEEP price/stock fields ALWAYS VISIBLE** (they're always functional)

**UI Enhancements:**

```tsx
// ===== BASIC INFORMATION =====
<Input label="Product Name" required />
<Input label="Part Number" required />
<Textarea label="Description" />
<Textarea label="Short Description" />

// ===== SHOWCASE METADATA =====
<div className="bg-blue-50 p-4 rounded-lg">
  <h3>Showcase Information</h3>
  
  // Tag Management
  <TagInput 
    label="Tags (Showcase Labels)"
    value={tags} 
    onChange={setTags}
    suggestions={["Premium", "Heavy Duty", "Best Seller", "New Arrival", "Popular"]}
  />
  
  // Brand & Origin
  <div className="grid grid-cols-2 gap-4">
    <Input label="Brand" value={brand} placeholder="Bosch, OEM, etc." />
    <Select label="Origin" options={["Germany", "Japan", "USA", "UAE", "China"]} />
  </div>
  
  // Application Type
  <MultiSelect 
    label="Application"
    options={["Commercial Vehicles", "Passenger Cars", "Trucks", "SUVs", "Buses"]}
  />
  
  // Certifications
  <TagInput 
    label="Certifications"
    suggestions={["ISO 9001", "OEM Certified", "TÜV Approved", "CE Certified"]}
  />
  
  // Warranty & Difficulty
  <div className="grid grid-cols-2 gap-4">
    <Input label="Warranty" placeholder="2 Years, Lifetime, etc." />
    <Select label="Installation Difficulty" options={["Easy", "Moderate", "Professional", "Advanced"]} />
  </div>
  
  // Media URLs
  <Input label="Video URL" placeholder="https://youtube.com/watch?v=..." />
  <Input label="PDF URL" placeholder="https://example.com/manual.pdf" />
  
  // Showcase Priority
  <Input 
    type="number" 
    label="Showcase Order" 
    help="Lower number = higher priority (1 = top, 999 = bottom)"
    defaultValue={999}
  />
</div>

// ===== PRICING & INVENTORY (ALWAYS VISIBLE) =====
<div className="bg-green-50 p-4 rounded-lg">
  <h3>💰 Pricing & Inventory</h3>
  <p className="text-sm text-gray-600 mb-4">
    Always manage pricing and inventory. Display on website is controlled by 
    <strong> Site Settings → E-commerce Mode</strong>.
  </p>
  
  <div className="grid grid-cols-2 gap-4">
    <Input label="Price" type="number" step="0.01" required />
    <Input label="Compare Price" type="number" step="0.01" />
  </div>
  
  <div className="grid grid-cols-2 gap-4">
    <Checkbox label="In Stock" />
    <Input label="Stock Quantity" type="number" min="0" />
  </div>
</div>

// ===== SPECIFICATIONS =====
<Textarea label="Specifications (JSON)" />

// ===== COMPATIBILITY =====
<TagInput label="Compatible Vehicles" />

// ===== IMAGES =====
<ImageUpload label="Product Images" multiple />
```

**Files to Modify:**
- `src/components/admin/parts/ProductForm.tsx`
- `src/lib/validations/product.ts` (update schemas)
- `src/components/ui/TagInput.tsx` (NEW - tag management component)
- `src/components/ui/MultiSelect.tsx` (NEW - if doesn't exist)

**Acceptance Criteria:**
- All new showcase fields appear in form
- Tag input allows multiple entries
- Video/PDF URLs are validated
- **Price/stock fields are ALWAYS VISIBLE and functional**
- Clear note explaining e-commerce mode toggle
- Form validation includes new fields
- Form saves all fields successfully

---

### Task 3: Admin - Product Table Enhancement (1 hour)

**What to do:**
1. Show tags as badges in product table
2. Show brand and origin
3. Add "Showcase Order" column
4. Add filter by tags, brand, origin
5. Keep publish toggle

**UI Design:**
```
┌──────────────────────────────────────────────────────────────────┐
│ [Image] Product Name                    | Brand    | Origin      │
│         Part #12345                      | Bosch    | Germany     │
│         [Premium] [Heavy Duty]           | Order: 5              │
│         Category: Brake Parts            | [Published ✓]         │
│                                          | [Edit] [Delete]       │
└──────────────────────────────────────────────────────────────────┘
```

**Files to Modify:**
- `src/components/admin/parts/ProductTable.tsx`
- `src/app/admin/parts/page.tsx` (add filters)

**Acceptance Criteria:**
- Tags displayed as colored badges
- Brand and origin visible
- Showcase order sortable
- Filters work correctly

---

### Task 4: Public API - Dual-Mode Endpoints (2.5 hours)

**What to do:**
1. Create public API routes that **check SiteSettings.ecommerceEnabled**
2. If showcase mode: exclude pricing/stock from response
3. If e-commerce mode: include pricing/stock in response
4. Support filtering by tags, brand, origin, difficulty, application
5. Support search
6. Support sorting by showcase order
7. Include rich metadata

**API Endpoints:**

#### GET /api/public/showcase/products
```typescript
Query Parameters:
- search?: string
- category?: string
- tags?: string (comma-separated: "Premium,Heavy Duty")
- brand?: string
- origin?: string
- difficulty?: string
- application?: string
- featured?: boolean
- sort?: "showcase" | "newest" | "popular" | "price-asc" | "price-desc" | "name-asc" | "name-desc"
- page?: number
- limit?: number

Response (Showcase Mode - ecommerceEnabled: false):
{
  "success": true,
  "mode": "showcase",  // Indicates current mode
  "data": [
    {
      "id": "...",
      "name": "Premium Brake Pads",
      "slug": "premium-brake-pads",
      "shortDesc": "High-performance ceramic brake pads",
      "images": ["url1", "url2"],
      "partNumber": "BP-001",
      "tags": ["Premium", "Heavy Duty"],
      "brand": "Bosch",
      "origin": "Germany",
      "certifications": ["ISO 9001", "OEM Certified"],
      "warranty": "2 Years",
      "difficulty": "Moderate",
      "application": ["Passenger Cars", "SUVs"],
      "featured": true,
      "category": {
        "id": "...",
        "name": "Brake Parts",
        "slug": "brake-parts"
      }
      // NO PRICE, NO STOCK IN SHOWCASE MODE
    }
  ],
  "pagination": { ... },
  "filters": { ... }
}

Response (E-commerce Mode - ecommerceEnabled: true):
{
  "success": true,
  "mode": "ecommerce",  // Indicates current mode
  "data": [
    {
      // ... all showcase fields above PLUS:
      "price": 99.99,
      "comparePrice": 129.99,
      "inStock": true,
      "stockQuantity": 25,
      "discount": 23  // Calculated from comparePrice
    }
  ],
  "pagination": { ... },
  "filters": { ... }
}
```

#### GET /api/public/showcase/products/[slug]
```typescript
Response:
{
  "success": true,
  "data": {
    // All product fields
    "id": "...",
    "name": "Premium Brake Pads",
    "slug": "premium-brake-pads",
    "description": "Full description...",
    "shortDesc": "Quick summary",
    "partNumber": "BP-001",
    "images": ["url1", "url2", "url3"],
    "tags": ["Premium", "Heavy Duty"],
    "brand": "Bosch",
    "origin": "Germany",
    "certifications": ["ISO 9001", "OEM Certified"],
    "warranty": "2 Years",
    "difficulty": "Moderate",
    "application": ["Passenger Cars", "SUVs"],
    "specifications": { ... },
    "compatibility": ["BMW 3 Series", "BMW 5 Series"],
    "videoUrl": "https://youtube.com/watch?v=...",
    "pdfUrl": "https://example.com/manual.pdf",
    "views": 342,
    "category": { ... },
    "relatedProducts": [...]
    // NO PRICE, NO STOCK
  }
}
```

**Helper Function:**
```typescript
// src/lib/settings.ts
import { prisma } from '@/lib/prisma';

let settingsCache: Map<string, any> = new Map();
let cacheTime: number = 0;
const CACHE_DURATION = 60000; // 1 minute

export async function getSiteSetting(key: string): Promise<any> {
  const now = Date.now();
  
  // Check cache
  if (settingsCache.has(key) && now - cacheTime < CACHE_DURATION) {
    return settingsCache.get(key);
  }
  
  // Fetch from database
  const setting = await prisma.siteSettings.findUnique({
    where: { key },
  });
  
  // Update cache
  if (setting) {
    settingsCache.set(key, setting.value);
    cacheTime = now;
    return setting.value;
  }
  
  return null;
}

export async function isEcommerceEnabled(): Promise<boolean> {
  const setting = await getSiteSetting('ecommerce_enabled');
  return setting?.enabled || false;
}

// Clear cache when settings are updated
export function clearSettingsCache() {
  settingsCache.clear();
  cacheTime = 0;
}
```

**Files to Create:**
- `src/lib/settings.ts` - Settings helper with caching
- `src/app/api/public/showcase/products/route.ts`
- `src/app/api/public/showcase/products/[slug]/route.ts`
- `src/app/api/public/showcase/products/[slug]/view/route.ts` (view counter)

**Acceptance Criteria:**
- Only published products returned
- **Price/stock included ONLY if e-commerce mode is enabled**
- **Mode indicator in API response**
- All new showcase fields included
- Filtering works for all new fields
- Search includes tags, brand, origin
- Settings cached for 1 minute (performance)

---

### Task 5: Public UI - Dual-Mode Product Page (3.5 hours)

**What to do:**
1. Create product catalog page at `/products`
2. Rich filtering sidebar (tags, brand, origin, difficulty, application)
3. Grid layout with dual-mode cards
4. **Read site settings to determine display mode**
5. **Showcase Mode**: No pricing, generic CTA
6. **E-commerce Mode**: Show pricing, "Add to Cart" button
7. Sort by "Showcase Order" as default

**UI Design:**

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Home > Products                                          │
│                                                               │
│  [Search products...] [Sort: Showcase Order ▾]              │
│                                                               │
│  ┌──────────┐  ┌────────────────────────────────────────┐  │
│  │ FILTERS  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │  │
│  │          │  │  │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │  │  │
│  │Category  │  │  │      │ │      │ │      │ │      │  │  │
│  │□ Brake   │  │  │Name  │ │Name  │ │Name  │ │Name  │  │  │
│  │□ Engine  │  │  │Part# │ │Part# │ │Part# │ │Part# │  │  │
│  │          │  │  │      │ │      │ │      │ │      │  │  │
│  │Tags      │  │  │[🏷️]  │ │[🏷️]  │ │[🏷️]  │ │[🏷️]  │  │
│  │□ Premium │  │  │Bosch │ │OEM   │ │Local │ │Japan │  │  │
│  │□ Heavy D.│  │  │      │ │      │ │      │ │      │  │  │
│  │          │  │  │[View]│ │[View]│ │[View]│ │[View]│  │  │
│  │Brand     │  │  └──────┘ └──────┘ └──────┘ └──────┘  │  │
│  │□ Bosch   │  │                                         │  │
│  │□ OEM     │  │  Showing 1-12 of 48 products            │  │
│  │          │  │  [1] 2 3 4 >                            │  │
│  │Origin    │  │                                         │  │
│  │□ Germany │  └────────────────────────────────────────┘  │
│  │□ Japan   │                                              │
│  └──────────┘                                              │
└─────────────────────────────────────────────────────────────┘
```

**Product Card Design (Dual-Mode):**

**Showcase Mode (ecommerceEnabled: false):**
```
┌────────────────────────┐
│                        │
│   [Product Image]      │
│   [🎥 Video] [📄 PDF] │
│                        │
├────────────────────────┤
│ Product Name           │
│ Part #BP-001           │
│                        │
│ [Premium] [Heavy Duty] │
│                        │
│ 🏭 Bosch | 🌍 Germany  │
│ ✓ ISO 9001 Certified   │
│                        │
│ [View Details →]       │
└────────────────────────┘
```

**E-commerce Mode (ecommerceEnabled: true):**
```
┌────────────────────────┐
│                        │
│   [Product Image]      │
│   [🎥 Video] [📄 PDF] │
│   [● In Stock]         │ ← Stock badge
│                        │
├────────────────────────┤
│ Product Name           │
│ Part #BP-001           │
│                        │
│ [Premium] [Heavy Duty] │
│                        │
│ [$129.99] AED 99.99    │ ← Price display
│ Save AED 30 (23%)!     │ ← Discount
│                        │
│ 🏭 Bosch | 🌍 Germany  │
│                        │
│ [Add to Cart 🛒]       │ ← E-commerce CTA
└────────────────────────┘
```

**Files to Create:**
- `src/app/(public)/products/page.tsx`
- `src/components/public/ProductShowcaseCard.tsx`
- `src/components/public/ShowcaseFilters.tsx`
- `src/components/public/ProductGrid.tsx`

**Implementation Logic:**
```typescript
// src/app/(public)/products/page.tsx
import { isEcommerceEnabled } from '@/lib/settings';

export default async function ProductsPage() {
  const ecommerceMode = await isEcommerceEnabled();
  
  // Fetch products (API already handles mode)
  const products = await fetchProducts();
  
  return (
    <div>
      <ProductGrid products={products} ecommerceMode={ecommerceMode} />
    </div>
  );
}

// src/components/public/ProductCard.tsx
export default function ProductCard({ product, ecommerceMode }: Props) {
  return (
    <div className="product-card">
      {/* Always show showcase info */}
      <Image src={product.images[0]} />
      <h3>{product.name}</h3>
      <p>{product.partNumber}</p>
      <Tags tags={product.tags} />
      <p>🏭 {product.brand} | 🌍 {product.origin}</p>
      
      {/* Conditionally show price/stock */}
      {ecommerceMode && (
        <>
          {product.comparePrice && (
            <p className="line-through">{formatPrice(product.comparePrice)}</p>
          )}
          <p className="price">{formatPrice(product.price)}</p>
          <p className={product.inStock ? 'in-stock' : 'out-of-stock'}>
            {product.inStock ? '● In Stock' : '○ Out of Stock'}
          </p>
          <button>Add to Cart 🛒</button>
        </>
      )}
      
      {/* Always show view details */}
      <Link href={`/products/${product.slug}`}>View Details →</Link>
    </div>
  );
}
```

**Acceptance Criteria:**
- **Showcase Mode**: NO pricing, generic "View Details" CTA
- **E-commerce Mode**: Pricing visible, stock badge, "Add to Cart" button
- Tags shown as badges in both modes
- Brand and origin visible in both modes
- Video/PDF icons if available
- Certifications displayed
- Filters work and update URL
- Responsive grid layout
- Mode transition works without page reload (use React state if needed)

---

### Task 6: Public UI - Dual-Mode Product Detail Page (3.5 hours)

**What to do:**
1. Rich product detail page at `/products/[slug]`
2. **Check site settings to determine display mode**
3. Emphasis on quality, features, specifications
4. Video embed if available
5. PDF download button
6. Certifications prominently displayed
7. Related products section
8. **Showcase Mode**: Generic "Contact Us" CTA
9. **E-commerce Mode**: Pricing, stock, "Add to Cart", "Buy Now"

**UI Design:**

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Home > Products > Brake Parts > Premium Brake Pads      │
│                                                               │
│  ┌──────────────────┐  ┌────────────────────────────────┐  │
│  │                  │  │  Premium Brake Pads            │  │
│  │  [Main Image]    │  │  Part #BP-001                  │  │
│  │                  │  │                                 │  │
│  │  [🎥 Video]      │  │  [Premium] [Heavy Duty]        │  │
│  └──────────────────┘  │                                 │  │
│  [○][○][○][○]         │  🏭 Brand: Bosch                │  │
│                        │  🌍 Origin: Germany             │  │
│                        │  ✓ Certifications:              │  │
│                        │    • ISO 9001                   │  │
│                        │    • OEM Certified              │  │
│                        │  🛡️ Warranty: 2 Years           │  │
│                        │  🔧 Difficulty: Moderate        │  │
│                        │                                 │  │
│                        │  📄 [Download Technical PDF]    │  │
│                        │  📞 [Contact Us for Details]    │  │
│                        └────────────────────────────────┘  │
│                                                             │
│  ┌─ Description ──────────────────────────────────────┐   │
│  │  Premium ceramic brake pads designed for...        │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Specifications ───────────────────────────────────┐   │
│  │  Material: Ceramic                                  │   │
│  │  Weight: 2.5kg                                      │   │
│  │  Dimensions: 150x80x20mm                            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Compatible Vehicles ──────────────────────────────┐   │
│  │  • BMW 3 Series (2010-2020)                         │   │
│  │  • BMW 5 Series (2015-2022)                         │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Application ───────────────────────────────────────┐  │
│  │  🚗 Passenger Cars   🚙 SUVs                         │  │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Video Demonstration ───────────────────────────────┐  │
│  │  [Embedded YouTube/Vimeo Video]                      │  │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Similar Products ──────────────────────────────────┐  │
│  │  [Product] [Product] [Product] [Product]             │  │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Key Features (Both Modes):**
- 🎥 Embedded video player (YouTube/Vimeo)
- 📄 PDF download button (opens in new tab)
- 🏷️ Tags as badges
- 🏭 Brand prominently displayed
- 🌍 Origin with flag icon
- ✓ Certifications with badges
- 🛡️ Warranty information
- 🔧 Installation difficulty level
- 🚗 Application types with icons

**Additional in Showcase Mode:**
- 📞 Generic "Contact Us" CTA (not product-specific)
- No pricing section
- No stock indicators
- No cart buttons

**Additional in E-commerce Mode:**
- 💰 Pricing section with compare price
- 📊 Stock availability indicator
- 🛒 "Add to Cart" button
- ⚡ "Buy Now" button (instant checkout)
- 💬 Product-specific "Inquire About This Product"
- 📦 Quantity selector

**Files to Create:**
- `src/app/(public)/products/[slug]/page.tsx`
- `src/components/public/ProductShowcaseDetail.tsx`
- `src/components/public/VideoEmbed.tsx`
- `src/components/public/CertificationBadges.tsx`
- `src/components/public/ApplicationIcons.tsx`

**Acceptance Criteria:**
- **Mode detection works correctly**
- **Showcase Mode**: NO pricing, generic CTA, no cart functionality
- **E-commerce Mode**: Pricing visible, stock status, cart buttons work
- Video embeds correctly (YouTube/Vimeo)
- PDF download works
- Certifications displayed as badges
- Application types with icons
- Related products shown
- Mobile-optimized
- Mode transition seamless (no page reload needed)

---

### Task 7: Featured Products Section (1.5 hours)

**What to do:**
1. Add "Featured Products" section to homepage
2. Show products with `featured: true` and `published: true`
3. Showcase-focused design (no pricing)
4. Link to full product catalog

**UI on Homepage:**

```
┌─────────────────────────────────────────────────────────┐
│  Featured Products                                       │
│  Discover our premium selection                          │
│                                                           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] │ │[IMG] ││
│  │      │ │      │ │      │ │      │ │      │ │      ││
│  │Name  │ │Name  │ │Name  │ │Name  │ │Name  │ │Name  ││
│  │[Tag] │ │[Tag] │ │[Tag] │ │[Tag] │ │[Tag] │ │[Tag] ││
│  │Bosch │ │OEM   │ │Local │ │Japan │ │Germ. │ │USA   ││
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│
│                                                           │
│  [View All Products →]                                   │
└─────────────────────────────────────────────────────────┘
```

**Files to Create:**
- `src/components/sections/FeaturedProductsSection.tsx`

**Files to Modify:**
- `src/app/(public)/page.tsx` (add FeaturedProductsSection)

**Acceptance Criteria:**
- Shows up to 6-8 featured products
- Horizontal scroll on mobile
- Grid on desktop
- Links to product detail pages
- "View All" button to catalog

---

### Task 8: Tag-Based & Brand-Based Showcase Pages (2 hours)

**What to do:**
1. Create dynamic pages for tags (e.g., `/products/tag/premium`)
2. Create dynamic pages for brands (e.g., `/products/brand/bosch`)
3. Create dynamic pages for origin (e.g., `/products/origin/germany`)
4. Show filtered products on each page

**URL Structure:**
- `/products/tag/[tag]` - Products with specific tag
- `/products/brand/[brand]` - Products from specific brand
- `/products/origin/[origin]` - Products from specific origin

**Files to Create:**
- `src/app/(public)/products/tag/[tag]/page.tsx`
- `src/app/(public)/products/brand/[brand]/page.tsx`
- `src/app/(public)/products/origin/[origin]/page.tsx`

**Acceptance Criteria:**
- Dynamic routes work correctly
- Proper page titles (e.g., "Premium Products")
- Breadcrumbs show path
- SEO metadata for each page

---

### Task 9: Admin - E-commerce Mode Toggle UI (2 hours)

**What to do:**
1. Create Site Settings page in admin panel
2. Add prominent toggle for E-commerce Mode
3. Show preview of what changes when enabled
4. Add confirmation dialog before switching modes
5. Clear settings cache when updated

**UI Design:**

```
┌──────────────────────────────────────────────────────┐
│  Admin > Settings > Site Configuration               │
│                                                        │
│  ┌────────────────────────────────────────────────┐ │
│  │  🌐 Website Mode                                │ │
│  │                                                  │ │
│  │  Current Mode: [Showcase Portfolio]            │ │
│  │                                                  │ │
│  │  Enable E-commerce Features                     │ │
│  │  [ Toggle Switch: OFF ]                         │ │
│  │                                                  │ │
│  │  When DISABLED (Showcase Mode):                 │ │
│  │  • Product catalog visible                      │ │
│  │  • Pricing hidden from public                   │ │
│  │  • Stock status hidden                          │ │
│  │  • Generic "Contact Us" CTAs                    │ │
│  │  • No shopping cart                             │ │
│  │                                                  │ │
│  │  When ENABLED (E-commerce Mode):                │ │
│  │  • Product catalog visible                      │ │
│  │  • Pricing displayed to public                  │ │
│  │  • Stock status visible                         │ │
│  │  • "Add to Cart" buttons                        │ │
│  │  • Shopping cart enabled                        │ │
│  │  • Checkout process active                      │ │
│  │                                                  │ │
│  │  [Preview Showcase Mode] [Preview E-comm Mode]  │ │
│  └────────────────────────────────────────────────┘ │
│                                                        │
│  ┌────────────────────────────────────────────────┐ │
│  │  💰 Currency Settings                           │ │
│  │                                                  │ │
│  │  Currency: [AED ▾]                              │ │
│  │  Symbol Position: [● Before] [ ] After          │ │
│  │                                                  │ │
│  └────────────────────────────────────────────────┘ │
│                                                        │
│  ┌────────────────────────────────────────────────┐ │
│  │  📞 Contact Information                         │ │
│  │                                                  │ │
│  │  Email: [info@garritwulf.com]                  │ │
│  │  Phone: [+971502345678]                         │ │
│  │  WhatsApp: [+971502345678]                      │ │
│  │                                                  │ │
│  └────────────────────────────────────────────────┘ │
│                                                        │
│  [Save Settings]                                      │
└──────────────────────────────────────────────────────┘
```

**Confirmation Dialog (when enabling e-commerce):**
```
┌─────────────────────────────────────────┐
│  ⚠️ Enable E-commerce Mode?             │
│                                          │
│  This will:                              │
│  • Display product pricing to public    │
│  • Show stock availability              │
│  • Enable "Add to Cart" functionality   │
│  • Activate shopping cart & checkout    │
│                                          │
│  Make sure all products have:            │
│  ✓ Correct pricing set                  │
│  ✓ Stock quantities updated             │
│  ✓ Payment gateway configured           │
│                                          │
│  [Cancel]  [Yes, Enable E-commerce]     │
└─────────────────────────────────────────┘
```

**Files to Create:**
- `src/app/admin/settings/page.tsx` - Settings management UI
- `src/components/admin/settings/EcommerceModeToggle.tsx` - Toggle component
- `src/components/admin/settings/CurrencySettings.tsx` - Currency config

**Files to Modify:**
- `src/app/api/admin/settings/route.ts` - Clear cache on update
- `src/components/admin/Sidebar.tsx` - Add "Settings" link

**Acceptance Criteria:**
- Settings page accessible from admin sidebar
- Toggle switch works smoothly
- Confirmation dialog appears when enabling e-commerce
- Preview links work (open in new tab)
- Currency settings functional
- Contact info updatable
- Cache cleared immediately on save
- Success message displayed after save

---

### Task 10: Navigation & Integration (1 hour)

**What to do:**
1. Update Header navigation to include "Products"
2. Update Footer with product categories and popular tags
3. Ensure old `/parts` page redirects to `/products`

**Files to Modify:**
- `src/components/Header.tsx` (or Navigation component)
- `src/components/Footer.tsx`
- `src/app/(public)/parts/page.tsx` (redirect to /products)

**Acceptance Criteria:**
- "Products" link in main navigation
- Footer has product links
- Old `/parts` redirects properly

---

### Task 11: SEO & Performance (1.5 hours)

**What to do:**
1. Add metadata to all product pages
2. Add JSON-LD structured data (showcase/catalog focus)
3. Generate sitemap with products
4. Implement ISR caching
5. Add robots.txt

**JSON-LD (Mode-Aware):**
```typescript
const ecommerceMode = await isEcommerceEnabled();

const baseSchema = {
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.images,
  "brand": {
    "@type": "Brand",
    "name": product.brand
  },
  "mpn": product.partNumber,
  "category": product.category.name,
  "countryOfOrigin": product.origin,
};

// Add offer section ONLY in e-commerce mode
const productSchema = ecommerceMode ? {
  ...baseSchema,
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "AED",
    "availability": product.inStock 
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock",
    "seller": {
      "@type": "Organization",
      "name": "Garrit & Wulf"
    }
  }
} : baseSchema;
```

**Files to Modify:**
- `src/app/(public)/products/[slug]/page.tsx` (add generateMetadata)
- `src/app/sitemap.ts`
- `src/app/robots.ts`

**Acceptance Criteria:**
- Unique page titles and descriptions
- **JSON-LD includes offers ONLY in e-commerce mode**
- **JSON-LD validates in both modes**
- Sitemap includes all published products
- ISR revalidation every 60 seconds
- Cache strategy optimized for mode switching

---

## � Mode Switching Behavior

### Showcase Mode → E-commerce Mode

**What Happens:**
1. Admin enables toggle in Settings
2. Settings cache cleared immediately
3. Next page load shows prices/stock to public
4. Product APIs include price/stock in responses
5. "Add to Cart" buttons appear
6. Shopping cart icon appears in header
7. JSON-LD includes offer schema

**What Doesn't Change:**
- Product URLs (same slugs)
- Showcase metadata (tags, brand, origin still visible)
- Admin panel functionality
- Database data

### E-commerce Mode → Showcase Mode

**What Happens:**
1. Admin disables toggle in Settings
2. Settings cache cleared immediately
3. Next page load hides prices/stock from public
4. Product APIs exclude price/stock from responses
5. "Add to Cart" buttons hidden
6. Shopping cart icon hidden from header
7. JSON-LD excludes offer schema
8. Existing carts are preserved (for when re-enabled)

**What Doesn't Change:**
- Product URLs (same slugs)
- Showcase metadata still visible
- Admin can still manage pricing
- Database data intact

### Cache Invalidation
```typescript
// When settings updated:
1. Clear settings cache
2. Revalidate product list page
3. Revalidate all product detail pages (ISR)
4. Show confirmation to admin

// src/app/api/admin/settings/route.ts
export async function PUT(request: NextRequest) {
  // Update settings
  await prisma.siteSettings.update({ ... });
  
  // Clear cache
  clearSettingsCache();
  
  // Revalidate pages
  revalidatePath('/products');
  revalidatePath('/products/[slug]', 'page');
  
  return NextResponse.json({ success: true });
}
```

---

## 🗂️ Complete File Structure

```
src/
├── app/
│   ├── (public)/
│   │   ├── products/
│   │   │   ├── page.tsx                    # Main showcase catalog
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx                # Product detail showcase
│   │   │   │   └── not-found.tsx           # 404 page
│   │   │   ├── tag/
│   │   │   │   └── [tag]/
│   │   │   │       └── page.tsx            # Tag-based showcase
│   │   │   ├── brand/
│   │   │   │   └── [brand]/
│   │   │   │       └── page.tsx            # Brand-based showcase
│   │   │   └── origin/
│   │   │       └── [origin]/
│   │   │           └── page.tsx            # Origin-based showcase
│   │   └── parts/
│   │       └── page.tsx                    # Redirect to /products
│   ├── api/
│   │   ├── admin/
│   │   │   └── parts/
│   │   │       ├── route.ts                # Update with new fields
│   │   │       ├── [id]/
│   │   │       │   ├── route.ts            # Update with new fields
│   │   │       │   └── publish/
│   │   │       │       └── route.ts        # Publish toggle
│   │   │       └── bulk/
│   │   │           └── route.ts            # Bulk operations
│   │   └── public/
│   │       └── showcase/
│   │           └── products/
│   │               ├── route.ts            # List products (no pricing)
│   │               └── [slug]/
│   │                   ├── route.ts        # Single product (no pricing)
│   │                   └── view/
│   │                       └── route.ts    # View counter
│   ├── sitemap.ts                          # Generate sitemap
│   └── robots.ts                           # Robots.txt
├── components/
│   ├── admin/
│   │   └── parts/
│   │       ├── ProductForm.tsx             # Add showcase fields
│   │       ├── ProductTable.tsx            # Add tags, brand, origin
│   │       └── PublishToggle.tsx
│   ├── public/
│   │   ├── ProductShowcaseCard.tsx         # NEW
│   │   ├── ShowcaseFilters.tsx             # NEW
│   │   ├── ProductGrid.tsx                 # NEW
│   │   ├── ProductShowcaseDetail.tsx       # NEW
│   │   ├── VideoEmbed.tsx                  # NEW
│   │   ├── CertificationBadges.tsx         # NEW
│   │   └── ApplicationIcons.tsx            # NEW
│   ├── sections/
│   │   └── FeaturedProductsSection.tsx     # NEW
│   └── ui/
│       ├── TagInput.tsx                    # NEW
│       ├── MultiSelect.tsx                 # NEW (if doesn't exist)
│       ├── Breadcrumbs.tsx
│       ├── EmptyState.tsx
│       └── ProductCardSkeleton.tsx
├── lib/
│   └── validations/
│       └── product.ts                      # Update schemas
├── types/
│   └── product.ts                          # Add showcase types
└── prisma/
    └── schema.prisma                       # Add showcase fields
```

---

## 🧪 Testing Checklist

### Admin Features
- [ ] All new showcase fields in product form
- [ ] Tags input with multi-select works
- [ ] Brand and origin dropdowns work
- [ ] Video/PDF URL validation works
- [ ] Showcase order sorting works
- [ ] E-commerce fields collapsed by default
- [ ] Publish toggle works
- [ ] Product table shows tags, brand, origin
- [ ] Filtering by new fields works

### Public Showcase
- [ ] Product catalog loads (NO prices)
- [ ] Filters work (tags, brand, origin, difficulty, application)
- [ ] Product cards show showcase info (NO prices)
- [ ] Tags displayed as badges
- [ ] Brand and origin visible
- [ ] Video/PDF icons when available
- [ ] Product detail page loads (NO prices)
- [ ] Video embeds correctly
- [ ] PDF download works
- [ ] Certifications displayed
- [ ] Generic "Contact Us" CTA visible
- [ ] Related products shown
- [ ] Tag-based pages work
- [ ] Brand-based pages work
- [ ] Origin-based pages work

### SEO
- [ ] Unique page titles
- [ ] Meta descriptions present
- [ ] JSON-LD validates (no offer section)
- [ ] Sitemap includes products
- [ ] Robots.txt configured

---

## 📊 Success Metrics

- **Showcase Quality:** Professional, detailed product presentations
- **Organization:** Easy filtering by tags, brand, origin, difficulty
- **Performance:** Page load < 2 seconds
- **SEO:** Product pages indexed within 24 hours
- **User Engagement:** Average 3+ product views per session
- **Flexibility:** E-commerce fields ready but hidden

---

## 🎯 Key Differences: Showcase vs E-commerce Mode

| Aspect | Showcase Mode (Default) | E-commerce Mode (Toggle ON) |
|--------|------------------------|---------------------------|
| **Primary Goal** | Demonstrate product range | Sell products online |
| **Price Display** | Hidden from public | Visible with discount calculation |
| **Stock Status** | Hidden from public | Visible with badges |
| **CTA Button** | "Contact Us" (generic) | "Add to Cart" + "Buy Now" |
| **Product Cards** | Showcase info only | Showcase info + pricing |
| **JSON-LD** | Product only | Product + Offer schema |
| **Shopping Cart** | Disabled | Enabled |
| **Checkout** | Disabled | Enabled |
| **Admin Panel** | Always has full pricing control | Always has full pricing control |
| **Database** | All data stored | All data stored |
| **URL Structure** | Same | Same |
| **Showcase Fields** | Visible | Visible |

---

## 📝 Notes

- This is a **dual-mode system**: Showcase (default) + E-commerce (toggle)
- **Admin always manages pricing/inventory** regardless of public display mode
- Pricing and stock fields **always stored in database**
- **Site Settings** control what public sees, not what admin manages
- **Mode switching is instant** with cache invalidation
- Rich metadata (tags, brand, origin, certifications) visible in **both modes**
- E-commerce mode adds pricing/cart, doesn't remove showcase features
- URL structure remains consistent across both modes (SEO-friendly)

## ⚠️ Important Implementation Notes

1. **Never Remove E-commerce Fields**: Price, stock, comparePrice always in database and admin forms
2. **Mode Detection**: Use `isEcommerceEnabled()` helper in all public-facing code
3. **Cache Strategy**: Settings cached for 1 minute, cleared on update
4. **API Responses**: Include `mode` field so frontend knows current state
5. **Revalidation**: Trigger ISR revalidation when toggling modes
6. **Testing**: Test both modes thoroughly before deployment
7. **Default State**: New installations default to Showcase Mode (safer)

---

**Next Phase:** Phase 5 - CMS/Theme Builder (custom page sections)  
**Dependencies:** Phase 3 (Products), Phase 4 (Categories)  
**Priority:** HIGH - Essential for public showcase functionality
