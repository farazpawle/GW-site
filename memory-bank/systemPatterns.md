# System Patterns: Garrit & Wulf Website

## 🚨 Known Problems & Workarounds (October 20, 2025)

### Menu System Issues

**Problem 1: Menu Item Page Assignment Not Saving**
- **Symptom**: Assigning pages to menu items shows success message, but pageId doesn't persist in database
- **Affected Files**: 
  - `src/app/api/admin/menu-items/[id]/route.ts` (lines 175-176)
  - `src/components/admin/menu-items/MenuItemModal.tsx`
- **Suspected Cause**: Conditional spread operator in update logic may not be updating the field
  ```typescript
  // Line 175-176 in [id]/route.ts
  ...(validatedData.pageId !== undefined && { pageId: validatedData.pageId || null })
  ```
- **Investigation Needed**:
  1. Restart dev server and check terminal logs (not browser console)
  2. Query database directly: `SELECT id, label, pageId, externalUrl FROM menu_items`
  3. Compare what form sends vs. what database receives
  4. Try explicit field update: `pageId: validatedData.pageId ?? existingMenuItem.pageId`
- **User Impact**: HIGH - Cannot configure site navigation

**Problem 2: Page Routing Shows Wrong Content**
- **Symptom**: All navigation links open Products page regardless of slug
- **Affected Files**:
  - `src/components/ui/Navigation.tsx` (fetches menu items)
  - `src/app/(public)/pages/[slug]/page.tsx` (renders page)
  - `src/app/api/public/pages/[slug]/route.ts` (fetches page data)
- **Suspected Causes**:
  1. Menu items don't have correct pageId values (see Problem 1)
  2. Navigation component not reading pageId correctly
  3. Page routing logic broken
  4. API returning wrong page data
- **Investigation Needed**:
  1. Verify menu items have pageId values: `SELECT * FROM menu_items`
  2. Verify pages exist with correct slugs: `SELECT * FROM pages`
  3. Test API directly: `curl http://localhost:3000/api/public/pages/about`
  4. Trace navigation click → page render flow
- **User Impact**: CRITICAL - Site navigation completely broken

**Previous Issues (FIXED)**:
- ✅ Validation errors with null values - Fixed by adding `.nullable()` to schema
- ✅ Pages missing groupType/groupValues - Fixed by fix-pages.ts script

---

## Architecture Overview

### Next.js App Router Structure
```
src/
├── app/                    # App Router pages and routing
│   ├── layout.tsx         # Root layout with Header/Footer
│   ├── page.tsx           # Homepage
│   ├── about/             # About page route
│   ├── contact/           # Contact page route
│   ├── products/          # Product catalog page (showcase/ecommerce) ✅
│   ├── admin/             # Admin panel ✅
│   │   ├── layout.tsx     # Admin layout with sidebar
│   │   ├── page.tsx       # Dashboard with statistics
│   │   ├── parts/         # Product management CRUD ✅
│   │   └── categories/    # Category management CRUD ✅
│   └── api/               # API routes
│       ├── webhooks/      # Webhook handlers
│       └── admin/         # Protected admin APIs
├── components/            # Reusable UI components
│   ├── Layout.tsx        # Layout wrapper (used in route layouts)
│   ├── Header.tsx        # Site header with navigation
│   ├── Footer.tsx        # Site footer with links
│   ├── admin/            # Admin-specific components ✅
│   │   ├── Sidebar.tsx           # Admin navigation
│   │   ├── AdminHeader.tsx       # Page headers
│   │   ├── StatCard.tsx          # Statistics cards
│   │   ├── parts/                # Product components
│   │   └── categories/           # Category components
│   ├── sections/         # Page section components
│   └── ui/               # UI primitives
├── lib/                  # Shared utilities and logic ✅
│   ├── auth.ts          # getCurrentUser, requireAdmin
│   ├── prisma.ts        # Prisma client singleton
│   ├── minio.ts         # MinIO client configuration
│   └── validations/     # Zod schemas
│       ├── product.ts   # Product validation
│       └── category.ts  # Category validation
└── public/              # Static assets (images, icons)
```

## Key Technical Decisions

### 0. Business Model Architecture (CRITICAL - Nov 2, 2025)
- **Showcase/Portfolio Model**: NOT e-commerce
  - Product catalog displays information only
  - Pricing shown for reference, NOT for transactions
  - NO shopping cart, checkout, or payment processing
  - Focus: Lead generation through inquiries and quote requests
  - Success metrics: Engagement (views, inquiries), NOT sales/revenue

- **Implementation Impact**:
  - Database: No Order, Cart, or Payment tables needed
  - Features: Skip reviews, comparisons, inventory alerts, Algolia search
  - Admin: Track inquiries and engagement, NOT sales and fulfillment
  - Analytics: Page views and product views, NOT conversion funnels
  - Time saved: 82% reduction in Phase 17 work (17 weeks → 3 weeks)

- **What This Means for Development**:
  - Always verify new features align with inquiry-generation model
  - Avoid e-commerce patterns (add-to-cart buttons, checkout flows)
  - Focus on content quality and lead capture
  - Measure success by engagement and catalog completeness

### 1. Authentication Architecture (Oct 4, 2025)
- **Clerk for Authentication**: Chosen over NextAuth for simplicity and speed
  - External cloud service with 99.99% uptime SLA
  - Free tier: 10,000 Monthly Active Users
  - Beautiful pre-built UI components
  - Automatic security updates
  - Built-in MFA and OAuth providers
- **Middleware Protection**: `clerkMiddleware()` in `src/middleware.ts`
  - Protects all routes except static files
  - Always runs for API routes
- **Session Management**: Clerk-managed JWT sessions
  - 7-day session duration (configurable)
  - Automatic token refresh
  - Multi-device support
- **Role-Based Access**: User roles stored in local database
  - Clerk manages authentication
  - Local database manages authorization (ADMIN/VIEWER roles)
  - Webhook syncs users from Clerk to local database

### 2. Component Architecture
- **Server Components by Default**: Leverage Next.js 15 server components for better performance
- **Client Components When Needed**: Use 'use client' for interactive forms, animations, and Clerk UI
- **Section-Based Organization**: Large pages split into logical section components
- **Reusable UI Components**: Button, Navigation, Logo, Clerk auth components extracted for consistency

### 3. Styling Approach
- **Tailwind CSS**: Utility-first for rapid development and consistency
- **Inline Styles for Brand Colors**: `style={{ backgroundColor: '#6e0000' }}` for precise brand colors
- **CSS Classes for Layout**: Tailwind for responsive grids and flexbox
- **No CSS Modules**: All styling via Tailwind utilities and inline styles
- **Clerk UI Customization**: Use `appearance` prop for consistent theming

### 4. Image Optimization
- **Next/Image Component**: All images use Next.js Image component
- **AVIF Format**: Modern format for better compression (e.g., egh_member_200x.avif)
- **JPG for Photos**: Product images in JPG format
- **Proper Sizing**: Width/height specified for layout stability
- **Fill for Backgrounds**: Use `fill` prop with `object-cover` for hero backgrounds

### 5. Layout Pattern
```tsx
// Root Layout (app/layout.tsx) with Clerk
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>
          <Header />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}

// Individual pages DON'T include Header/Footer
// They only include page-specific content
```

### 6. Authentication Pattern (NEW)
```tsx
// Middleware (src/middleware.ts)
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

// Header with Clerk UI (src/components/Header.tsx)
'use client';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <header>
      <SignedOut>
        <SignInButton mode="modal">
          <button>Sign In</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button>Sign Up</button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}

// Protected API Route Example
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... authenticated logic
}
```

## Design Patterns

### 1. Card Component Pattern
```tsx
// Standard card design used throughout site
<div className="relative group rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-105"
  style={{ 
    backgroundColor: '#1a1a1a',
    borderColor: '#2a2a2a'
  }}
>
  <div className="p-6">
    {/* Card content */}
  </div>
</div>
```

### 2. Icon with Background Pattern
```tsx
// Circular or rounded icon backgrounds with maroon color
<div 
  className="w-12 h-12 rounded-full flex items-center justify-center"
  style={{ backgroundColor: '#6e0000' }}
>
  <Icon className="w-6 h-6 text-white" />
</div>
```

### 3. Button Pattern
```tsx
// Primary CTA button
<button className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
  style={{ backgroundColor: '#6e0000' }}
>
  Button Text
</button>

// Secondary button
<button className="px-8 py-4 rounded-xl border border-white/20 bg-black/30 backdrop-blur-sm hover:bg-white/10 transition-all">
  Button Text
</button>
```

### 4. Hero Section Pattern
```tsx
// Full-width hero with decorative elements
<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute ... opacity-20 blur-3xl"></div>
  
  {/* Content */}
  <div className="container mx-auto px-4 relative z-10">
    <h1>Hero Title</h1>
    <p>Hero Description</p>
    <div className="flex gap-4">
      <PrimaryCTA />
      <SecondaryCTA />
    </div>
  </div>
  
  {/* Bottom wave decoration */}
  <div className="absolute bottom-0 ..."></div>
</section>
```

### 5. Grid Layout Pattern
```tsx
// Responsive grid for cards
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

## Component Relationships

### Page Component Hierarchy
```
Homepage (page.tsx)
├── HeroSection
│   └── Statistics
├── BrandStorySection
├── CategoriesSection
└── PrecisionManufacturingSection

About Page (about/page.tsx)
├── Hero Section
├── Why Choose Us Section (6 cards)
├── Mission & Vision Section
└── Values Section

Contact Page (contact/page.tsx)
├── Hero Section
├── Quick Contact Cards (Phone/Email/Location)
├── Contact Form
└── Map Embed

Admin Dashboard (admin/page.tsx) ✅
├── AdminHeader
└── Stats Grid (4 StatCards)

Admin Product Management (admin/parts/page.tsx) ✅
├── AdminHeader (with Add Product button)
├── Search & Filter Bar
├── ProductTable (with bulk selection)
└── DeleteConfirmModal

Admin Product Form (admin/parts/new|[id]/edit) ✅
├── AdminHeader
└── ProductForm (14 fields)
    ├── ImageUploader (multi-image drag-drop)
    ├── Basic Info Section
    ├── Pricing Section
    ├── Stock Section
    ├── Specifications (dynamic key-value)
    └── Compatibility Tags

Admin Category Management (admin/categories/page.tsx) ✅
├── AdminHeader (with Add Category button)
├── Search Bar
├── Category Grid (1-4 columns responsive)
└── DeleteConfirmModal

Admin Category Form (admin/categories/new|[id]/edit) ✅
├── AdminHeader
└── CategoryForm (4 fields)
    ├── Name (auto-generates slug)
    ├── Slug (editable)
    ├── Description (textarea)
    └── Single Image Upload

Admin Media Library (admin/media/page.tsx) ✅
├── AdminHeader
└── MediaLibraryClient
    ├── StorageStats (file count, size, buckets)
    ├── BucketTabs (product-images, category-images, user-uploads)
    ├── SearchBar (filter files)
    ├── FileGrid (responsive grid with thumbnails)
    │   └── FileCard (preview, copy URL, delete)
    └── DeleteConfirmModal

Layout (layout.tsx)
├── Header
│   ├── Logo
│   ├── Navigation
│   └── Contact Button
└── Footer
    ├── Logo Card
    ├── Contact Info
    ├── Quick Links
    ├── Products
    ├── Social Media
    └── Copyright

Admin Layout (admin/layout.tsx) ✅
├── Sidebar (navigation)
└── Main Content Area
    └── {children}
```

## State Management
- **No Global State**: Currently no need for Redux/Zustand
- **Auth State**: Managed by Clerk (useUser, useAuth hooks)
- **Form State**: Local React state in contact form
- **Server State**: Fetched via API routes when needed
- **URL State**: Use Next.js routing and search params for filters

## API Structure
```
/api/contact/route.ts                      # Handle contact form submissions
/api/webhooks/clerk/route.ts               # Clerk user sync webhook ✅
/api/admin/upload/route.ts                 # Multi-image upload to MinIO ✅
/api/admin/parts/route.ts                  # List/create products ✅
/api/admin/parts/[id]/route.ts             # Single product CRUD ✅
/api/admin/parts/bulk/route.ts             # Bulk product operations ✅
/api/admin/categories/route.ts             # List categories with product count ✅
/api/admin/categories/[id]/route.ts        # Single category CRUD ✅
/api/admin/media/buckets/route.ts          # List buckets with stats ✅
/api/admin/media/files/route.ts            # List/search files in bucket ✅
/api/admin/media/files/[key]/route.ts      # Delete file from bucket ✅
```

## Common Patterns & Solutions

### Field Filtering Pattern (Temporary - Oct 18, 2025)
**Problem**: Form validation schema includes fields not in database schema, causing Prisma errors.

**Solution**: Filter out non-existent fields before Prisma operations:
```typescript
// In API routes (src/app/api/admin/parts/[id]/route.ts)
const {
  stockQuantity,    // Not in DB yet
  inStock,          // Not in DB yet
  barcode,          // Not needed
  lowStockThreshold,// Not needed
  trackInventory,   // Not needed
  costPrice,        // Not needed
  ...validFields    // Only fields that exist in DB
} = validatedData;

// Use only validFields with Prisma
await prisma.part.update({
  where: { id: partId },
  data: validFields
});
```

**Note**: This is a temporary workaround. Phase 6 (Inventory Management) will add `stockQuantity` and `inStock` to database schema, eliminating the need for filtering.

**Files Using This Pattern**:
- `src/app/api/admin/parts/route.ts` (POST)
- `src/app/api/admin/parts/[id]/route.ts` (PUT)

### SKU Duplicate Check Pattern
**Implementation**: Check for duplicate SKUs before update (excluding current product):
```typescript
// Check for duplicate SKU (excluding current product)
if (sku) {
  const existingProduct = await prisma.part.findFirst({
    where: {
      sku: sku,
      id: { not: partId }
    }
  });

  if (existingProduct) {
    return Response.json(
      { success: false, error: 'SKU already exists for another product' },
      { status: 400 }
    );
  }
}
```

## Authentication Flow
```
1. User clicks "Sign In" or "Sign Up" → Clerk modal opens
2. User enters credentials → Clerk validates
3. Clerk creates session with JWT → Stores securely
4. Clerk webhook fires → Syncs user to local database
5. Middleware checks session on each request
6. API routes verify userId via auth()
7. Local database checked for user role (ADMIN/VIEWER)
8. Access granted based on role
```

## Error Handling
- **error.tsx**: Page-level error boundaries
- **global-error.tsx**: Root-level error handler
- **loading.tsx**: Loading states for async routes
- **Form Validation**: Client-side validation before API submission

## Performance Optimizations
1. **Image Optimization**: Next/Image with automatic format selection
2. **Code Splitting**: Automatic with App Router
3. **Server Components**: Reduce client-side JavaScript
4. **Static Generation**: Use SSG where possible
5. **Font Optimization**: next/font for Google Fonts (Oswald)
6. **Clerk Edge Middleware**: Fast auth checks at edge (<50ms)
7. **JWT Sessions**: Lightweight session management

## Security Measures
1. **Authentication**: Clerk with industry-standard security
2. **Session Management**: Secure JWT tokens, httpOnly cookies
3. **CSRF Protection**: Built into Next.js and Clerk
4. **Rate Limiting**: Clerk handles auth rate limiting
5. **Input Validation**: Zod schemas for all forms
6. **SQL Injection Prevention**: Prisma ORM parameterized queries
7. **XSS Prevention**: React automatic escaping
8. **Environment Variables**: Secrets in .env.local (gitignored)
