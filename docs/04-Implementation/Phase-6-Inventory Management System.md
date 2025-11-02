# Phase 6: Inventory Management System (Showcase Mode)

**Status:** � Ready to Implement  
**Priority:** HIGH (Core Business Feature)  
**Started:** Not yet  
**Estimated Time:** 2-3 hours  
**Completion:** 0%

---

## 🎯 Goal

Implement basic inventory management for product availability tracking without e-commerce/selling functionality. This allows admins to manage stock quantities and availability status, with optional display control for the public website.

**What Success Looks Like:**
- ✅ Admin can manage stock quantity for each product
- ✅ Admin can set in-stock/out-of-stock status
- ✅ Database stores inventory information
- ✅ Admin panel shows inventory fields for all products
- ✅ Settings toggle controls public visibility of availability status
- ✅ Public website shows "In Stock" / "Out of Stock" badges (when enabled)
- ✅ No cart, checkout, or payment features (showcase website only)
- ✅ Pricing always visible (informational purpose)

---

## 📋 Tasks

### Task 1: Create Database Migration for Inventory Fields
**Time:** 15 minutes

**Features:**
- Add `stockQuantity` field (Int, default 0)
- Add `inStock` field (Boolean, default true)
- Update Part model in Prisma schema
- Generate and run migration

**Files to Modify:**
- `prisma/schema.prisma` - Add inventory fields to Part model

**Schema Changes:**
```prisma
model Part {
  // ... existing fields ...
  
  // Inventory Management
  stockQuantity  Int     @default(0)
  inStock        Boolean @default(true)
  
  // ... rest of fields ...
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_inventory_fields
```

---

### Task 2: Update Product Form with Inventory Fields
**Time:** 25 minutes

**Features:**
- Add "Inventory Management" section to product form
- Stock Quantity input field (number)
- In Stock checkbox
- Validation for stock quantity (must be >= 0)
- Clear labels and helpful tooltips
- Auto-update inStock flag based on quantity (optional)

**Files to Modify:**
- `src/components/admin/parts/ProductForm.tsx` - Add inventory section
- Update form schema to include inventory fields
- Update form default values

**Form Schema Update:**
```typescript
const productFormSchema = z.object({
  // ... existing fields ...
  
  // Inventory fields
  stockQuantity: z.number().int().min(0),
  inStock: z.boolean(),
  
  // ... rest of fields ...
});
```

**UI Section:**
```tsx
{/* Inventory Management Section */}
<div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
  <h2 className="text-xl font-bold text-white mb-6">Inventory Management</h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Stock Quantity */}
    <div>
      <label>Stock Quantity</label>
      <input type="number" {...register('stockQuantity')} />
    </div>
    
    {/* In Stock Checkbox */}
    <div>
      <label>
        <input type="checkbox" {...register('inStock')} />
        In Stock / Available
      </label>
    </div>
  </div>
</div>
```

---

### Task 3: Update API Routes to Handle Inventory Fields
**Time:** 20 minutes

**Features:**
- Update product creation API to accept inventory fields
- Update product update API to accept inventory fields
- Remove filters that were previously added (we now want these fields)
- Ensure proper validation
- Return inventory data in responses

**Files to Modify:**
- `src/app/api/admin/parts/route.ts` - POST endpoint
- `src/app/api/admin/parts/[id]/route.ts` - PUT & GET endpoints

**Changes to Make:**
```typescript
// REMOVE the field filtering we added earlier
// Instead of:
const { stockQuantity, inStock, ...dbData } = validatedData;

// Use:
const dbData = validatedData; // Keep all fields including inventory
```

**Validation Schema:**
- Ensure `stockQuantity` and `inStock` are in the validation schema
- Already exists in `shopifyInventoryFieldsSchema` but we only need these two fields

---

### Task 4: Create Invoice Generation
**Time:** 40 minutes

**Features:**
- Invoice template with company branding
- Customer and order information
- Itemized list of products
- Subtotal, shipping, taxes (if applicable), total
- Print-friendly CSS
- Download as PDF (optional - use library like `react-to-pdf`)
- Email invoice to customer (optional)

**Files to Create:**
- `src/components/admin/Invoice.tsx` - Invoice template component
- `src/app/admin/orders/[id]/invoice/page.tsx` - Invoice page
- `src/lib/invoice-generator.ts` - Invoice utilities

**Invoice Layout:**
```
┌────────────────────────────────────────────────────┐
│  GARRIT WULF AUTO PARTS                    INVOICE │
│  [Logo]                         #INV-2025-001      │
│                                                     │
│  Bill To:                       Invoice Date:      │
│  John Doe                       Oct 6, 2025        │
│  john@example.com               Due Date:          │
│  123 Main St                    Oct 13, 2025       │
│  City, State 12345                                 │
│                                                     │
│  ───────────────────────────────────────────────── │
│  Item              Qty    Price    Total           │
│  ───────────────────────────────────────────────── │
│  Brake Pad         2      $45      $90             │
│  Oil Filter        1      $12      $12             │
│                                                     │
│                             Subtotal:    $102      │
│                             Shipping:    $10       │
│                             Total:       $112      │
│  ───────────────────────────────────────────────── │
│                                                     │
│  Notes: Standard shipping. Track at: [link]       │
└────────────────────────────────────────────────────┘
```

---

### Task 5: Update Public API Routes for Inventory Display
**Time:** 25 minutes

**Features:**
- Update public product API to conditionally include inventory
- Check `ecommerce_enabled` setting (repurposed as "show availability")
- When ON: Include `stockQuantity` and `inStock` in response
- When OFF: Exclude inventory fields from response
- Update product listing and detail endpoints

**Files to Modify:**
- `src/app/api/public/showcase/products/route.ts` - Product listing
- `src/app/api/public/showcase/products/[slug]/route.ts` - Product details

---

### Task 6: Update Products List with Inventory Indicators
**Time:** 20 minutes

**Features:**
- Add inventory status badges to product cards (when toggle is ON)
- Show "In Stock" / "Out of Stock" status
- Display quantity remaining (if > 0 and < 10, show as "Low Stock")
- Add filter/sort by stock status in admin
- Public site conditionally shows availability based on toggle

**Files to Modify:**
- `src/components/showcase/ProductCard.tsx` - Add availability badges
- `src/components/admin/parts/ProductsList.tsx` - Admin inventory indicators

**Example Badge Logic:**
```typescript
{isEcommerceEnabled() && (
  <Badge variant={product.inStock ? 'success' : 'destructive'}>
    {product.inStock 
      ? product.stockQuantity > 0 && product.stockQuantity < 10 
        ? `Low Stock (${product.stockQuantity})`
        : 'In Stock'
      : 'Out of Stock'
    }
  </Badge>
)}
```

---

### Task 7: Testing & Validation
**Time:** 30 minutes

**Tasks:**
- Test inventory field updates in admin
- Verify settings toggle switches between show/hide availability
- Test public API conditionally returns inventory data
- Verify product cards show/hide badges based on toggle
- Test admin filtering and sorting by stock status
- Validate low stock indicators
- Check database migration applied correctly
- Test form validation with new fields

**Test Cases:**
1. Admin can update stock quantity and in-stock status
2. Toggle ON: Public site shows availability badges
3. Toggle OFF: Public site hides inventory info
4. Low stock warning (< 10 items) displays correctly
5. Out of stock products marked clearly
6. API responses respect toggle setting

---

## 📁 Files to Modify

```
src/
├── app/
│   ├── admin/
│   │   └── parts/
│   │       ├── [id]/edit/page.tsx    (MODIFY) Already has sku field
│   │       └── new/page.tsx          (MODIFY) Already has sku field
│   │
│   ├── api/
│   │   ├── admin/parts/
│   │   │   ├── route.ts              (MODIFY) Remove field filtering
│   │   │   └── [id]/route.ts         (MODIFY) Remove field filtering
│   │   │
│   │   └── public/showcase/products/
│   │       ├── route.ts              (MODIFY) Conditional inventory
│   │       └── [slug]/route.ts       (MODIFY) Conditional inventory
│   │
│   └── admin/settings/page.tsx       (MODIFY) Update toggle labels
│
├── components/
│   ├── admin/parts/
│   │   ├── ProductForm.tsx           (MODIFY) Add inventory section
│   │   └── ProductsList.tsx          (MODIFY) Add stock indicators
│   │
│   ├── showcase/
│   │   └── ProductCard.tsx           (MODIFY) Add availability badges
│   │
│   └── ui/
│       └── badge.tsx                 (EXISTS) Use existing Badge component
│
├── prisma/
│   └── schema.prisma                 (MODIFY) Add inventory fields
│
└── lib/
    └── settings.ts                   (EXISTS) Already has isEcommerceEnabled()
```

---

## 🎨 Design Specifications

### Admin Product Form - Inventory Section
```
┌────────────────────────────────────────────────────────┐
│  📦 INVENTORY MANAGEMENT                                │
├────────────────────────────────────────────────────────┤
│  Stock Quantity:  [______100_____]                     │
│                   Track physical quantity              │
│                                                         │
│  In Stock:        ☑ Available for purchase/display    │
│                   ☐ Mark as out of stock              │
├────────────────────────────────────────────────────────┤
│  💡 Tip: When "Show Availability" is enabled in        │
│      settings, these values will be visible on the     │
│      public product pages.                             │
└────────────────────────────────────────────────────────┘
```

### Public Product Card (Toggle ON)
```
┌────────────────────────────────┐
│  [Product Image]               │
│                                │
│  Brake Pad Set                 │
│  $89.99                        │
│  � In Stock (12 remaining)    │
│                                │
│  [View Details]                │
└────────────────────────────────┘

┌────────────────────────────────┐
│  [Product Image]               │
│                                │
│  Oil Filter                    │
│  $12.99                        │
│  🟡 Low Stock (3 remaining)    │
│                                │
│  [View Details]                │
└────────────────────────────────┘

┌────────────────────────────────┐
│  [Product Image]               │
│                                │
│  Air Filter                    │
│  $24.99                        │
│  🔴 Out of Stock               │
│                                │
│  [View Details]                │
└────────────────────────────────┘
```

### Settings Page - Toggle Update
```
┌────────────────────────────────────────────────────────┐
│  ⚙️ SITE SETTINGS                                       │
├────────────────────────────────────────────────────────┤
│  � Show Availability Status                           │
│  Display product stock status on public pages          │
│                                                         │
│  [Toggle: ON]  ✓ Show "In Stock" / "Out of Stock"     │
│                                                         │
│  When enabled, visitors can see:                       │
│  • Stock availability status                           │
│  • Low stock warnings                                  │
│  • Quantity remaining indicators                       │
│                                                         │
│  💡 Note: This is informational only - no cart or      │
│      checkout functionality will be added.             │
└────────────────────────────────────────────────────────┘
---

## 🔧 Technical Requirements

### Database Schema Addition
```prisma
model Part {
  // ... existing fields ...
  
  // New Inventory Fields
  stockQuantity  Int      @default(0)
  inStock        Boolean  @default(true)
}
```

### Badge Color Coding
```typescript
const stockBadgeVariant = (product: Part) => {
  if (!product.inStock) return 'destructive'; // Red
  if (product.stockQuantity < 10) return 'warning'; // Yellow
  return 'success'; // Green
};
```

### API Response Logic
```typescript
// Conditional inventory in public API
const includeInventory = await isEcommerceEnabled();

const productData = {
  ...product,
  ...(includeInventory && {
    stockQuantity: product.stockQuantity,
    inStock: product.inStock
  })
};
```

### Settings Toggle Repurposing
**Old Behavior:**
- Key: `ecommerce_enabled`
- Label: "E-commerce Mode"
- Description: "Enable shopping cart and checkout"

**New Behavior:**
- Key: `ecommerce_enabled` (reused for backward compatibility)
- Label: "Show Availability Status"
- Description: "Display product stock status on public pages"
### Form Validation
```typescript
const inventorySchema = z.object({
  stockQuantity: z.number().int().min(0, 'Cannot be negative'),
  inStock: z.boolean()
});
```

### Migration Command
```bash
# Generate migration
npx prisma migrate dev --name add_inventory_fields

# Apply in production
npx prisma migrate deploy
```

---

## ✅ Acceptance Criteria

**Functional Requirements:**
- [ ] Admin can update stock quantity and in-stock status
- [ ] Settings toggle switches between show/hide availability
- [ ] Public API conditionally includes inventory data
- [ ] Product cards display availability badges when toggle is ON
- [ ] Low stock warnings display for quantities < 10
- [ ] Out of stock products clearly marked
- [ ] Admin can filter products by stock status

**Non-Functional Requirements:**
- [ ] No console errors
- [ ] Responsive design on mobile
- [ ] Fast API responses
- [ ] Clean, professional UI
- [ ] Proper error handling

**Data Integrity:**
- [ ] Stock quantity cannot be negative
- [ ] Toggle setting persists correctly
- [ ] Migration applies without errors
- [ ] Existing products retain their data

---

## 🐛 Known Challenges

### Challenge 1: Toggle Semantic Meaning
**Issue:** `ecommerce_enabled` key still used but means "show availability"  
**Solution:** For backward compatibility, reuse existing key. Add comment in code explaining the repurposed meaning.

### Challenge 2: Existing Products Without Inventory
**Issue:** Migration adds default values (0 quantity, true inStock)  
**Solution:** After migration, manually review and update stock quantities for existing products in admin panel.

---

## 💡 Future Enhancements

- [ ] Automatic low stock alerts/notifications
- [ ] Inventory history tracking (stock changes over time)
- [ ] Bulk stock update import (CSV)
- [ ] Product variants with separate stock quantities
- [ ] Reserved stock for pending orders
- [ ] Warehouse/location-based inventory
- [ ] Stock forecasting and reorder recommendations
- [ ] Barcode scanning for inventory updates
- [ ] Inventory audit logs
- [ ] Integration with supplier APIs

---

## 📊 Progress Tracking

| Task | Estimated | Actual | Status |
|------|-----------|--------|--------|
| Database Migration | 15 min | - | ⬜ Not started |
| Update Product Form | 30 min | - | ⬜ Not started |
| Update API Routes | 20 min | - | ⬜ Not started |
| Repurpose Settings Toggle | 25 min | - | ⬜ Not started |
| Update Public API | 25 min | - | ⬜ Not started |
| Product List Indicators | 20 min | - | ⬜ Not started |
| Testing & Validation | 30 min | - | ⬜ Not started |
| **TOTAL** | **~2.5 hours** | - | - |

---

## 🔗 Dependencies

**Required Before Starting:**
- Phase 3: Product Management (products must exist)
- Settings system (toggle functionality)
- Public API routes (for conditional inventory display)

---

**Status:** Ready to implement! 📦
