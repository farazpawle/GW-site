# Phase 3: Product Management System

**Status:** ✅ COMPLETE  
**Priority:** HIGH (Core Business Feature)  
**Started:** October 6, 2025  
**Completed:** October 6, 2025  
**Estimated Time:** 4-5 hours  
**Actual Time:** 7.3 hours  
**Completion:** 100%

---

## 🎯 Goal

Build a comprehensive product (parts) management system where administrators can create, read, update, and delete products with images, pricing, inventory, and specifications.

**What Success Looks Like:**
- ✅ Admin can view all products in a searchable/filterable list
- ✅ Admin can add new products with multiple images
- ✅ Admin can edit existing products
- ✅ Admin can delete products
- ✅ Images upload to MinIO storage
- ✅ Form validation prevents invalid data
- ✅ Stock tracking and inventory management
- ✅ Product specifications (JSON) configurable
- ✅ Category assignment
- ✅ SEO-friendly slugs auto-generated

---

## 📋 Tasks

### Task 1: Create Product List Page
**Time:** 45 minutes

**Features:**
- Display all products in a table/grid view
- Show: Image, Name, Part Number, Category, Price, Stock Status
- Search by name or part number
- Filter by category, stock status
- Pagination (20 items per page)
- Sort by: Name, Price, Created Date
- Quick actions: Edit, Delete buttons

**Files to Create:**
- `src/app/admin/parts/page.tsx` - Main products list page
- `src/components/admin/ProductTable.tsx` - Products table component
- `src/components/admin/SearchFilter.tsx` - Search and filter UI

**Database Queries:**
```typescript
// With filters and pagination
prisma.part.findMany({
  where: {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { partNumber: { contains: searchTerm, mode: 'insensitive' } }
    ],
    categoryId: selectedCategory || undefined,
    inStock: stockFilter === 'inStock' ? true : undefined
  },
  include: { category: true },
  orderBy: { [sortField]: sortOrder },
  skip: (page - 1) * pageSize,
  take: pageSize
})
```

---

### Task 2: Create "Add Product" Form
**Time:** 60 minutes

**Features:**
- Form with all product fields:
  - Name, Part Number, Description, Short Description
  - Price, Compare Price (optional for discounts)
  - Category (dropdown)
  - Stock Quantity, In Stock toggle
  - Multiple image upload (drag & drop)
  - Specifications (key-value pairs)
  - Compatibility (vehicle models - tags)
  - Featured product toggle
- Real-time slug generation from product name
- Client-side validation with react-hook-form + zod
- Image preview before upload
- Submit to API route

**Files to Create:**
- `src/app/admin/parts/new/page.tsx` - Add product page
- `src/components/admin/ProductForm.tsx` - Reusable form component
- `src/components/admin/ImageUploader.tsx` - Multi-image upload UI
- `src/components/admin/SpecificationEditor.tsx` - JSON spec editor
- `src/lib/validations/product.ts` - Zod schema for validation

**Form Schema:**
```typescript
const productSchema = z.object({
  name: z.string().min(3).max(200),
  partNumber: z.string().min(1).max(50),
  description: z.string().optional(),
  shortDesc: z.string().max(200).optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  categoryId: z.string(),
  stockQuantity: z.number().int().min(0),
  inStock: z.boolean(),
  images: z.array(z.string()).min(1),
  specifications: z.record(z.any()).optional(),
  compatibility: z.array(z.string()),
  featured: z.boolean()
})
```

---

### Task 3: Build Image Upload API
**Time:** 40 minutes

**Features:**
- Accept multiple images (up to 10)
- Validate file type (only images: jpg, png, webp)
- Validate file size (max 5MB per image)
- Upload to MinIO S3-compatible storage
- Generate unique filenames
- Return public URLs
- Error handling for failed uploads

**Files to Create:**
- `src/app/api/admin/upload/route.ts` - Image upload endpoint
- `src/lib/upload.ts` - Upload utility functions

**MinIO Upload Logic:**
```typescript
// Generate unique filename
const filename = `products/${Date.now()}-${crypto.randomUUID()}.${ext}`

// Upload to MinIO
await s3Client.putObject({
  Bucket: 'garrit-wulf',
  Key: filename,
  Body: buffer,
  ContentType: file.type
})

// Return public URL
const url = `${MINIO_URL}/garrit-wulf/${filename}`
```

---

### Task 4: Create Product API Route (POST)
**Time:** 30 minutes

**Features:**
- Validate request body with Zod schema
- Check for duplicate part numbers
- Auto-generate slug from name
- Create product in database
- Handle errors gracefully
- Return created product

**Files to Create:**
- `src/app/api/admin/parts/route.ts` - POST handler

**Implementation:**
```typescript
export async function POST(request: Request) {
  // 1. Verify admin role
  const user = await requireAdmin()
  
  // 2. Parse and validate body
  const body = await request.json()
  const validatedData = productSchema.parse(body)
  
  // 3. Generate slug
  const slug = slugify(validatedData.name)
  
  // 4. Check for duplicates
  const existing = await prisma.part.findUnique({
    where: { partNumber: validatedData.partNumber }
  })
  if (existing) throw new Error('Part number already exists')
  
  // 5. Create product
  const product = await prisma.part.create({
    data: { ...validatedData, slug }
  })
  
  return Response.json(product, { status: 201 })
}
```

---

### Task 5: Create "Edit Product" Page
**Time:** 45 minutes

**Features:**
- Fetch existing product data
- Pre-fill form with current values
- Show existing images with delete option
- Upload new images
- Update product via API
- Redirect to product list on success

**Files to Create:**
- `src/app/admin/parts/[id]/edit/page.tsx` - Edit product page
- `src/app/api/admin/parts/[id]/route.ts` - PUT handler

**Edit Flow:**
1. Fetch product by ID with category
2. Render ProductForm with initialData prop
3. On submit, send PUT request with updated data
4. Update database
5. Redirect to `/admin/parts`

---

### Task 6: Create Delete Product Functionality
**Time:** 20 minutes

**Features:**
- Confirmation modal before delete
- Delete product from database
- Delete images from MinIO (cascade)
- Show success toast
- Refresh product list

**Files to Update:**
- `src/components/admin/ProductTable.tsx` - Add delete button
- `src/components/admin/DeleteConfirmModal.tsx` - Reusable modal
- `src/app/api/admin/parts/[id]/route.ts` - DELETE handler

**Delete Handler:**
```typescript
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await requireAdmin()
  
  // Fetch product to get image URLs
  const product = await prisma.part.findUnique({
    where: { id: params.id }
  })
  
  // Delete images from MinIO
  for (const imageUrl of product.images) {
    await deleteFromMinIO(imageUrl)
  }
  
  // Delete from database (cascade deletes orderItems)
  await prisma.part.delete({
    where: { id: params.id }
  })
  
  return Response.json({ success: true })
}
```

---

### Task 7: Add Bulk Actions
**Time:** 30 minutes

**Features:**
- Select multiple products (checkboxes)
- Bulk delete
- Bulk update stock status
- Bulk update featured status
- Bulk category change

**Files to Update:**
- `src/components/admin/ProductTable.tsx` - Add checkboxes
- `src/components/admin/BulkActions.tsx` - Bulk action toolbar
- `src/app/api/admin/parts/bulk/route.ts` - Bulk operations endpoint

---

### Task 8: Polish UI & Test
**Time:** 30 minutes

**Features:**
- Loading states for all actions
- Error handling with toast notifications
- Empty states (no products)
- Responsive design (mobile-friendly)
- Test all CRUD operations
- Fix any bugs

---

## 📁 Files Structure

```
src/
├── app/
│   └── admin/
│       └── parts/
│           ├── page.tsx              (NEW) Product list
│           ├── new/
│           │   └── page.tsx          (NEW) Add product
│           └── [id]/
│               └── edit/
│                   └── page.tsx      (NEW) Edit product
│
├── app/api/admin/
│   ├── upload/
│   │   └── route.ts                  (NEW) Image upload
│   └── parts/
│       ├── route.ts                  (NEW) GET all, POST new
│       ├── [id]/
│       │   └── route.ts              (NEW) GET, PUT, DELETE
│       └── bulk/
│           └── route.ts              (NEW) Bulk operations
│
├── components/admin/
│   ├── ProductTable.tsx              (NEW) Products list table
│   ├── ProductForm.tsx               (NEW) Reusable product form
│   ├── ImageUploader.tsx             (NEW) Multi-image upload
│   ├── SpecificationEditor.tsx       (NEW) JSON editor for specs
│   ├── SearchFilter.tsx              (NEW) Search and filters
│   ├── DeleteConfirmModal.tsx        (NEW) Delete confirmation
│   └── BulkActions.tsx               (NEW) Bulk operations UI
│
└── lib/
    ├── validations/
    │   └── product.ts                (NEW) Zod schemas
    └── upload.ts                     (NEW) Upload utilities
```

---

## 🎨 Design Specifications

### Product List View
```
┌────────────────────────────────────────────────────────┐
│  Products                            [+ Add Product]   │
├────────────────────────────────────────────────────────┤
│  🔍 Search...    Category: [All ▼]  Stock: [All ▼]    │
├────────────────────────────────────────────────────────┤
│  [ ] Image  Name          Part#    Category  Price  📝│
│  [ ] [img]  Brake Pad     BP-001   Brakes    $45   ✏️❌│
│  [ ] [img]  Oil Filter    OF-123   Engine    $12   ✏️❌│
│  [ ] [img]  Air Filter    AF-456   Engine    $18   ✏️❌│
├────────────────────────────────────────────────────────┤
│  Showing 1-20 of 156              [< 1 2 3 4 5 >]     │
└────────────────────────────────────────────────────────┘
```

### Add/Edit Product Form
```
┌────────────────────────────────────────────────────────┐
│  Add New Product                         [Cancel] [Save]│
├────────────────────────────────────────────────────────┤
│  Basic Information                                      │
│  Name: [___________________________]                    │
│  Part Number: [_________]  Slug: auto-generated        │
│  Category: [Select... ▼]                               │
│                                                         │
│  Description:                                           │
│  [_____________________________________________]        │
│                                                         │
│  Pricing & Inventory                                    │
│  Price: [$____]  Compare Price: [$____]                │
│  Stock Quantity: [___]  [✓] In Stock                   │
│                                                         │
│  Images (Drag & drop or click to upload)               │
│  ┌───┐ ┌───┐ ┌───┐                                     │
│  │img│ │img│ │ + │                                     │
│  └───┘ └───┘ └───┘                                     │
│                                                         │
│  Specifications                        [+ Add Field]    │
│  Weight: [____] kg                                      │
│  Material: [____]                                       │
│                                                         │
│  Compatible Vehicles                   [+ Add]          │
│  ✕ Toyota Camry 2015-2020                              │
│  ✕ Honda Accord 2016-2021                              │
└────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Requirements

### Validation Rules
- Name: 3-200 characters
- Part Number: 1-50 characters, unique
- Price: Positive number, max 2 decimals
- Images: 1-10 images, max 5MB each, jpg/png/webp only
- Stock Quantity: Non-negative integer
- Slug: Auto-generated, lowercase, hyphenated, unique

### MinIO Configuration
- Bucket: `garrit-wulf`
- Folder: `products/`
- Access: Public read, private write
- Max file size: 5MB per image
- Allowed types: image/jpeg, image/png, image/webp

### Performance Optimizations
- Image compression before upload
- Lazy loading for product images
- Pagination with cursor-based navigation
- Debounced search (300ms delay)
- Optimistic UI updates

---

## ✅ Acceptance Criteria

**Functional Requirements:**
- ✅ Can view all products in searchable list
- ✅ Can add new product with images
- ✅ Can edit existing product
- ✅ Can delete product (with confirmation)
- ✅ Images upload to MinIO successfully
- ✅ Form validation works (shows errors)
- ✅ Slug auto-generates from name
- ✅ Search and filters work correctly
- ✅ Pagination works
- ✅ Bulk actions work (delete, stock, featured)

**Non-Functional Requirements:**
- ✅ Responsive on mobile/tablet
- ✅ No console errors (0 TypeScript errors)
- ✅ Fast page loads
- ✅ Images load quickly
- ✅ Clean, professional UI (dark theme with maroon)
- ✅ User-friendly error messages

**Data Integrity:**
- ✅ No duplicate part numbers (validation)
- ✅ No orphaned images in MinIO (cleanup on delete)
- ✅ Cascade deletes work (orderItems)
- ✅ All required fields validated

---

## 🐛 Known Challenges

### Challenge 1: Multiple Image Upload
**Issue:** Handling multiple files simultaneously  
**Solution:** Use FormData with array of files, process sequentially

### Challenge 2: Image Cleanup
**Issue:** Orphaned images if product creation fails  
**Solution:** Implement transaction pattern or cleanup job

### Challenge 3: Large Product Lists
**Issue:** Performance with 1000+ products  
**Solution:** Implement virtual scrolling or cursor pagination

---

## 💡 Future Enhancements

- [ ] Image cropping/editing tool
- [ ] Import products from CSV
- [ ] Export products to CSV
- [ ] Product variants (size, color)
- [ ] Product reviews/ratings
- [ ] Related products
- [ ] Product history/audit log
- [ ] Duplicate product feature
- [ ] Product templates

---

## 🎉 Completion Summary

**Implementation Date:** October 6, 2025  
**Total Time:** 7.3 hours (vs 4.5 hours estimated)  
**Files Created:** 13 files  
**TypeScript Errors:** 0  
**Production Ready:** YES ✅

### Key Deliverables

**Backend (5 files):**
1. `src/lib/validations/product.ts` - Zod validation schemas
2. `src/app/api/admin/upload/route.ts` - Multi-image upload API
3. `src/app/api/admin/parts/route.ts` - Product list & create
4. `src/app/api/admin/parts/[id]/route.ts` - Single product CRUD
5. `src/app/api/admin/parts/bulk/route.ts` - Bulk operations

**Frontend Components (4 files):**
6. `src/components/admin/parts/ImageUploader.tsx` - Drag-drop upload
7. `src/components/admin/parts/ProductForm.tsx` - 600+ line form
8. `src/components/admin/parts/ProductTable.tsx` - Table with bulk actions
9. `src/components/admin/parts/DeleteConfirmModal.tsx` - Delete confirmation

**Pages (3 files):**
10. `src/app/admin/parts/page.tsx` - Product list
11. `src/app/admin/parts/new/page.tsx` - Add product
12. `src/app/admin/parts/[id]/edit/page.tsx` - Edit product

**Integration:**
13. Sidebar & Dashboard (existing files updated)

### Technical Achievements

- ✅ Complete CRUD operations
- ✅ Multi-image upload to MinIO (up to 10 images)
- ✅ Advanced search & filtering
- ✅ Pagination with smart page numbers
- ✅ Bulk operations (delete, stock, featured)
- ✅ Dynamic specifications (key-value pairs)
- ✅ Compatibility tags management
- ✅ Next.js 15 async params compliance
- ✅ Zero TypeScript compilation errors

### Libraries Added

```json
"react-hook-form": "7.63.0",
"@hookform/resolvers": "5.2.2",
"zod": "4.1.11",
"@aws-sdk/client-s3": "3.901.0"
```

### Access Points

- **Product List:** http://localhost:3000/admin/parts
- **Add Product:** http://localhost:3000/admin/parts/new
- **Edit Product:** http://localhost:3000/admin/parts/[id]/edit

### What's Working

✅ Complete product management system  
✅ Professional admin interface  
✅ Image upload to cloud storage  
✅ Advanced filtering and search  
✅ Bulk operations for efficiency  
✅ Production-ready code with zero errors

**Phase 3 is now COMPLETE and ready for production use!** 🚀

---

## 🔗 Related Documentation

- **Phase 2:** Admin UI Framework ✅ COMPLETE
- **Phase 4:** Category Management ⏳ NEXT
- **Database Schema:** `prisma/schema.prisma`
- **MinIO Setup:** `docs/05-Features/storage/`
- **Memory Bank:** `memory-bank/progress.md` (updated)
- **Active Context:** `memory-bank/activeContext.md` (updated)

---

## 📊 Progress Tracking

| Task | Estimated | Actual | Status |
|------|-----------|--------|--------|
| Product Validation Schemas | 30 min | 45 min | ✅ Complete |
| Image Upload API | 40 min | 40 min | ✅ Complete |
| Product CRUD APIs | 45 min | 60 min | ✅ Complete |
| ImageUploader Component | 45 min | 50 min | ✅ Complete |
| ProductForm Component | 60 min | 55 min | ✅ Complete |
| Product List Page | 45 min | 45 min | ✅ Complete |
| Add Product Page | 30 min | 35 min | ✅ Complete |
| Edit Product Page | 45 min | 40 min | ✅ Complete |
| Delete Modal & Bulk Ops | 30 min | 50 min | ✅ Complete |
| Sidebar & Polish | 15 min | 20 min | ✅ Complete |
| **TOTAL** | **~4.5 hours** | **~7.3 hours** | **✅ 100%** |

---

**Status:** ✅ COMPLETE! All features implemented and tested. 🎉
