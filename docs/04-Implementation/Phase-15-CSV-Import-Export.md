# Phase 15: CSV Import/Export System

**Status:** 📋 PLANNED (Not Yet Implemented)  
**Date:** October 17, 2025  
**Type:** Bulk Data Management Feature

---

## Overview

Implement CSV import/export functionality for products, allowing admins to bulk manage product data through spreadsheet files. Single CSV file contains all product fields flattened, with system handling data transformation internally.

---

## Goals

1. 🎯 Export products to CSV (all or filtered)
2. 🎯 Import products from CSV (create new or update existing)
3. 🎯 Download CSV template with headers
4. 🎯 Validation preview before import
5. 🎯 Error reporting with line numbers
6. 🎯 Handle all product fields (arrays, JSON, relations)
7. 🎯 Upsert logic (create + update in one operation)

---

## Why This Feature?

### Current Problem ❌
- Adding products one-by-one is time-consuming
- No backup/restore capability
- Can't bulk update prices or data
- Difficult to migrate between environments
- No offline editing support

### After Phase 15 ✅
- Bulk add 100+ products at once
- Export for backup and safekeeping  
- Edit in Excel/Google Sheets (familiar tools)
- Bulk update prices, specs, categories
- Easy migration between dev/staging/prod
- Send CSV to clients for review

---

## Technical Analysis

### Database Schema

**Part Model (Products):**
- 36 direct fields
- 7 relations (category, variants, cross-references, OEM numbers, vehicle compatibility, collections)

**Critical Fields:**
- **Unique constraints:** `slug`, `partNumber`, `sku`
- **Decimal types:** `price`, `comparePrice`, `compareAtPrice`
- **Array fields:** `images[]`, `tags[]`, `compatibility[]`, `certifications[]`, `application[]`
- **JSON field:** `specifications`
- **Foreign key:** `categoryId` → Category

### CSV Format

**Single CSV with 32 columns** (excluding relations):

```csv
name,sku,partNumber,price,comparePrice,description,shortDesc,category,brand,origin,warranty,difficulty,tags,compatibility,application,certifications,images,specifications,videoUrl,pdfUrl,featured,published,showcaseOrder,views
```

**Example Row:**
```csv
"Brake Pad Set","BRK-001","BP-12345",45.99,59.99,"High quality brake pads","Premium pads","Brake Systems","Brembo","Germany","2 years","easy","brake|safety|hydraulic","Toyota Camry|Honda Accord","sedan|coupe","ISO 9001|DOT","products/brake-123.jpg|products/brake-456.jpg","{""material"":""ceramic"",""thickness"":""12mm""}","https://youtube.com/watch?v=abc","https://example.com/manual.pdf",true,true,10,0
```

**Data Formatting:**
- **Arrays:** Pipe-delimited (`tag1|tag2|tag3`)
- **JSON:** Escaped JSON string
- **Booleans:** `true` / `false`
- **Numbers:** Plain number strings
- **Nulls:** Empty string
- **Decimals:** Convert to number for CSV

---

## Features

### 1. Export Products

**Button:** "Export CSV" in products list page

**Options:**
- Export all products
- Export filtered products (current search/filter)
- Export selected products (checkboxes)

**Process:**
1. Admin clicks "Export CSV"
2. API fetches products from database with relations
3. System flattens data:
   - Convert Decimal → Number
   - Join arrays with `|`
   - Stringify JSON
   - Extract category name
4. Generate CSV file
5. Browser downloads `products-2025-10-17.csv`

**API Endpoint:**
```
GET /api/admin/products/export
Query params:
  - filter: 'all' | 'published' | 'draft' | 'featured'
  - categoryId: string (optional)
  - search: string (optional)

Response:
  Content-Type: text/csv
  Content-Disposition: attachment; filename="products-{date}.csv"
  Body: CSV file stream
```

### 2. Download Template

**Button:** "Download Template"

**Process:**
1. Admin clicks "Download Template"
2. API generates empty CSV with headers + 1 example row
3. User fills in Excel/Google Sheets
4. Upload back for import

**Benefit:** Users know exact format required

### 3. Import Products

**Two-Step Process:**

**Step 1: Upload & Validate**
1. Admin clicks "Import CSV"
2. Upload modal opens
3. Drag & drop or select CSV file
4. API validates each row:
   - Required fields present?
   - Valid formats (price, SKU pattern)?
   - Category exists?
   - Duplicate SKU/partNumber?
   - Valid JSON in specifications?
5. Show preview (first 10 rows)
6. Display validation results:
   - ✅ 45 valid rows
   - ❌ 3 errors (with line numbers)
   - ⚠️ 8 warnings

**Step 2: Confirm & Execute**
1. Admin reviews validation
2. Chooses mode:
   - **Create Only:** Skip existing SKUs
   - **Update Only:** Only update matching SKUs
   - **Upsert:** Create new + Update existing (recommended)
3. Clicks "Import"
4. API processes in transaction:
   - Parse CSV rows
   - Resolve category names → IDs
   - Split pipe-delimited arrays
   - Parse JSON specifications
   - Auto-generate slugs
   - Insert/update products
5. Show results summary:
   - ✅ Created: 45 products
   - ✅ Updated: 12 products
   - ❌ Failed: 3 products (download error report)

**API Endpoints:**
```
POST /api/admin/products/import/validate
Body: multipart/form-data
  - file: CSV file

Response:
  {
    success: true,
    preview: [...first 10 rows],
    validation: {
      valid: 45,
      errors: [{row: 5, field: 'sku', message: 'Duplicate SKU'}],
      warnings: [{row: 12, field: 'price', message: 'Price format corrected'}]
    }
  }
```

```
POST /api/admin/products/import/execute
Body: multipart/form-data
  - file: CSV file
  - mode: 'create' | 'update' | 'upsert'

Response:
  {
    success: true,
    results: {
      created: 45,
      updated: 12,
      failed: 3,
      errors: [{row: 5, message: 'SKU already exists'}]
    }
  }
```

---

## Data Transformation

### Export Transformation

```typescript
// Prisma → CSV
{
  price: Decimal(45.99) → "45.99"
  tags: ['brake', 'safety'] → "brake|safety"
  specifications: {material: 'ceramic'} → "{\"material\":\"ceramic\"}"
  categoryId: 'clx123' → "Brake Systems" (category.name)
  images: ['path1.jpg', 'path2.jpg'] → "path1.jpg|path2.jpg"
}
```

### Import Transformation

```typescript
// CSV → Prisma
{
  price: "45.99" → Decimal(45.99)
  tags: "brake|safety" → ['brake', 'safety']
  specifications: "{\"material\":\"ceramic\"}" → {material: 'ceramic'}
  category: "Brake Systems" → categoryId: 'clx123' (lookup)
  images: "path1.jpg|path2.jpg" → ['path1.jpg', 'path2.jpg']
  slug: auto-generated from name
}
```

---

## Validation Rules

### Required Fields ✅
- `name` (min 2 chars)
- `sku` (unique, pattern: `^[A-Z0-9-]+$`)
- `partNumber` (unique)
- `price` (positive number)
- `category` (must exist in database)

### Format Validation ✅
- Price: Valid decimal number
- SKU: Uppercase letters, numbers, hyphens only
- Arrays: Pipe-delimited strings
- JSON: Valid JSON syntax
- Booleans: 'true' or 'false'

### Unique Constraints ✅
- SKU must be unique
- Part Number must be unique
- Slug auto-generated (unique)

**Duplicate Handling:**
- Match by SKU (primary)
- If SKU exists → UPDATE mode
- If SKU new → CREATE mode
- Conflict detection: New SKU but existing partNumber

---

## Error Handling

### Validation Errors (User-fixable)
```
Row 5: ❌ Missing required field "sku"
Row 12: ❌ Category "Unknown Category" not found
Row 18: ❌ SKU "BRK-001" already exists (use update mode)
Row 25: ❌ Invalid price format "abc" (must be number)
```

### Warnings (Auto-corrected)
```
Row 8: ⚠️ Price "45.99 USD" → corrected to "45.99"
Row 14: ⚠️ Empty tags field → set to []
Row 20: ⚠️ Invalid JSON in specifications → using {}
```

### System Errors (Not user-fixable)
- Database connection failure
- Prisma transaction error
- File parsing error
→ Return 500 error, log to server, rollback transaction

### Error Report Download
- CSV file with error rows
- Error column added with messages
- User fixes and re-uploads

---

## UI Design

### Products List Page

**New Buttons:**
```
┌────────────────────────────────────────────────┐
│  [+ Add Product]  [↓ Import]  [↑ Export]      │
└────────────────────────────────────────────────┘
```

### Export Modal

```
┌─────────────────────────────────────┐
│  Export Products                    │
├─────────────────────────────────────┤
│  □ All Products (247)               │
│  □ Filtered Products (12)           │
│  □ Selected Products (5)            │
│                                     │
│  [Cancel]  [Download CSV]          │
└─────────────────────────────────────┘
```

### Import Modal (Step 1: Upload)

```
┌──────────────────────────────────────┐
│  Import Products                     │
│  Step 1: Upload CSV                  │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐ │
│  │     📁 Drag & Drop CSV         │ │
│  │     or Click to Select         │ │
│  └────────────────────────────────┘ │
│                                      │
│  [Download Template]                 │
│                                      │
│  [Cancel]  [Next: Validate]         │
└──────────────────────────────────────┘
```

### Import Modal (Step 2: Preview)

```
┌──────────────────────────────────────┐
│  Import Products                     │
│  Step 2: Validate & Preview          │
├──────────────────────────────────────┤
│  Validation Results:                 │
│  ✅ Valid: 45 rows                   │
│  ❌ Errors: 3 rows                   │
│  ⚠️ Warnings: 8 rows                 │
│                                      │
│  Preview (first 10 rows):            │
│  [Table showing preview data]        │
│                                      │
│  Errors:                             │
│  Row 5: Missing SKU                  │
│  Row 12: Category not found          │
│  Row 18: Duplicate SKU               │
│                                      │
│  [Back]  [Fix Errors]  [Continue]   │
└──────────────────────────────────────┘
```

### Import Modal (Step 3: Confirm)

```
┌──────────────────────────────────────┐
│  Import Products                     │
│  Step 3: Confirm Import              │
├──────────────────────────────────────┤
│  Import Mode:                        │
│  ○ Create Only (skip existing)      │
│  ○ Update Only (skip new)           │
│  ● Upsert (create + update)         │
│                                      │
│  Ready to import 45 valid rows       │
│                                      │
│  [Back]  [Cancel]  [Import Now]     │
└──────────────────────────────────────┘
```

### Import Modal (Step 4: Results)

```
┌──────────────────────────────────────┐
│  Import Complete                     │
├──────────────────────────────────────┤
│  ✅ Created: 32 products             │
│  ✅ Updated: 13 products             │
│  ❌ Failed: 3 products               │
│                                      │
│  [Download Error Report]             │
│  [Close]                             │
└──────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install csv-parse csv-stringify
```

### Step 2: Create Export API Route
**File:** `src/app/api/admin/products/export/route.ts`
- Fetch products with category relation
- Transform data (Decimal→Number, arrays→pipe, JSON→string)
- Generate CSV using csv-stringify
- Return file download

### Step 3: Create Import Validation API
**File:** `src/app/api/admin/products/import/validate/route.ts`
- Parse CSV using csv-parse
- Validate each row (required fields, formats, duplicates)
- Resolve category names
- Return validation results + preview

### Step 4: Create Import Execute API
**File:** `src/app/api/admin/products/import/execute/route.ts`
- Parse CSV
- Transform data (string→types, pipe→arrays, string→JSON)
- Use Prisma transaction for safety
- Upsert products based on SKU
- Return results summary

### Step 5: Create Template API
**File:** `src/app/api/admin/products/template/route.ts`
- Generate empty CSV with headers
- Add 1 example row
- Return file download

### Step 6: Create UI Components
- Export button with modal
- Import wizard (3-step modal)
- Template download button
- Progress indicator
- Results summary

### Step 7: Testing
- Unit tests for transformation logic
- Integration tests for API routes
- Edge case testing (large files, errors)

### Step 8: Documentation
- CSV format guide
- Field descriptions
- Example CSV files
- Troubleshooting guide

---

## Technical Challenges & Solutions

### Challenge 1: Decimal Type Handling
**Issue:** Prisma Decimal doesn't serialize to JSON  
**Solution:** Convert to Number on export, parse Float on import

### Challenge 2: Category Resolution
**Issue:** CSV has category name, DB needs categoryId  
**Solution:** Case-insensitive lookup, error if not found

### Challenge 3: Array Fields
**Issue:** CSV can't store arrays natively  
**Solution:** Use pipe-delimiter (`tag1|tag2|tag3`)

### Challenge 4: JSON Field
**Issue:** Specifications is complex nested object  
**Solution:** Stringify on export, parse with try-catch on import

### Challenge 5: Unique Constraints
**Issue:** Multiple unique fields (SKU, partNumber, slug)  
**Solution:** Detect duplicates in validation, use upsert with SKU as key

### Challenge 6: Slug Generation
**Issue:** Slug must be unique but auto-generated  
**Solution:** Generate from name, add number suffix if duplicate

### Challenge 7: Large Files
**Issue:** CSV with 1000+ products  
**Solution:** Stream parsing, batch processing (100 at a time), show progress

---

## Phase 15 Scope

### ✅ Included
- Export all Part model fields (32 columns)
- Import with create/update/upsert
- CSV template download
- Validation preview
- Error reporting
- Array field handling (pipe-delimited)
- JSON field handling (specifications)
- Category name resolution
- Slug auto-generation
- Decimal type conversion
- Unique constraint validation

### ❌ Not Included (Future Phases)
- **Relations:** Cross-references, OEM numbers, vehicle compatibility
  - *Reason:* Complex one-to-many, needs separate CSV or advanced format
  - *Future:* Phase 16
  
- **Image Upload:** Only supports existing MinIO paths
  - *Reason:* Images are binary, can't include in CSV
  - *Workaround:* Upload images via Media Library first, then import products
  - *Future:* Phase 16 (image URL download)
  
- **Variants:** ProductVariant table
  - *Reason:* Complex one-to-many relationship
  - *Future:* Phase 16
  
- **Progress Tracking:** Real-time import progress
  - *Reason:* Requires WebSocket or SSE
  - *Future:* Phase 17

- **Undo Feature:** Rollback after import
  - *Reason:* Complex state management
  - *Future:* Phase 17

---

## Dependencies

### New Packages
```json
{
  "csv-parse": "^5.5.6",      // Import CSV parsing
  "csv-stringify": "^6.5.1"   // Export CSV generation
}
```

**Size:** ~50KB combined  
**License:** MIT  
**Downloads:** 21M/week (csv-parse), 19M/week (csv-stringify)

### Existing Packages (No changes needed)
- `@prisma/client` - Database operations
- `zod` - Validation
- `next` - API routes

---

## Security Considerations

### Authentication ✅
- Admin-only access (requireAdmin middleware)
- Rate limiting on import endpoint
- File size limit (10MB)

### Validation ✅
- Server-side validation (never trust CSV data)
- Sanitize filenames
- Validate MIME type (text/csv)
- Prevent CSV injection (escape formulas starting with =, +, -, @)

### Data Integrity ✅
- Prisma transactions (atomic operations)
- Rollback on error
- Validate foreign keys (categoryId exists)
- Check unique constraints before insert

### File Handling ✅
- Validate file extension
- Check file size before processing
- Stream large files (don't load into memory)
- Clean up temp files after processing

---

## Performance Considerations

### Export
- **Small datasets (< 100 products):** Direct fetch and transform
- **Large datasets (> 1000 products):** Streaming with csv-stringify
- **Very large (> 10,000):** Background job + email download link

### Import
- **Small files (< 100 rows):** Process all at once
- **Large files (> 1000 rows):** Batch processing (100 rows at a time)
- **Very large (> 10,000):** Background job + progress tracking

### Database
- Use Prisma transactions for atomicity
- Batch upsert operations
- Index on SKU for fast duplicate detection
- Connection pooling for concurrent requests

---

## Testing Checklist

### Export Testing
- [ ] Export all products (empty, 1, 10, 100, 1000)
- [ ] Export filtered products (by category, search, status)
- [ ] Export selected products (checkboxes)
- [ ] Verify CSV format (headers, data types, delimiters)
- [ ] Check Decimal conversion
- [ ] Check array field formatting (pipe-delimited)
- [ ] Check JSON field escaping
- [ ] Check category name extraction
- [ ] Download works in all browsers

### Import Testing
- [ ] Import valid CSV (create new products)
- [ ] Import with existing SKUs (update products)
- [ ] Import with upsert mode (create + update)
- [ ] Import empty CSV (error)
- [ ] Import CSV with 1 row
- [ ] Import CSV with 100 rows
- [ ] Import CSV with errors (validation catches)
- [ ] Import CSV with warnings (auto-correct)
- [ ] Import with missing required fields
- [ ] Import with invalid formats
- [ ] Import with duplicate SKUs
- [ ] Import with non-existent category
- [ ] Import with special characters
- [ ] Import with Unicode characters
- [ ] Check slug auto-generation
- [ ] Check transaction rollback on error

### Template Testing
- [ ] Download template
- [ ] Template has correct headers
- [ ] Template has example row
- [ ] Can fill and import template successfully

### UI Testing
- [ ] Export button visible and clickable
- [ ] Export modal opens and closes
- [ ] Import wizard flows through 3 steps
- [ ] Upload drag & drop works
- [ ] Upload file select works
- [ ] Validation results display correctly
- [ ] Preview table displays first 10 rows
- [ ] Error list displays with line numbers
- [ ] Mode selection (create/update/upsert) works
- [ ] Results summary displays correctly
- [ ] Progress indicator shows during import
- [ ] Error report download works

---

## Estimated Timeline

- **Export API:** 4 hours
- **Import Validation API:** 6 hours
- **Import Execute API:** 8 hours
- **Template API:** 1 hour
- **Frontend UI (modals, wizards):** 6 hours
- **Testing:** 4 hours
- **Documentation:** 2 hours

**Total:** 31 hours (~4 days of focused work)

---

## Success Criteria

Phase 15 is complete when:

✅ **Export:**
- Can export all/filtered/selected products to CSV
- CSV includes all 32 columns
- Decimal types converted correctly
- Arrays formatted as pipe-delimited
- JSON stringified correctly
- Category names extracted
- File downloads successfully

✅ **Import:**
- Can upload CSV file
- Validation detects all errors
- Preview shows first 10 rows
- Can choose create/update/upsert mode
- Import creates new products
- Import updates existing products (by SKU)
- Slug auto-generated
- Category resolved by name
- Arrays parsed from pipe-delimited
- JSON parsed correctly
- Results summary shows created/updated/failed

✅ **Template:**
- Can download template
- Template has correct format
- Template fillable and importable

✅ **Quality:**
- All TypeScript types correct
- No ESLint errors
- API routes use transactions
- Error handling comprehensive
- UI is user-friendly
- Documentation complete

---

## Related Documentation

- [Phase 14: Media Library](./Phase-14-Media-Library.md)
- [Phase 14.5: Single Bucket Migration](./Phase-14.5-Single-Bucket-Migration.md)
- [Phase 14.6: Upload Feature](./Phase-14.6-Upload-Feature.md)
- [Product Schema](../../prisma/schema.prisma)
- [Product API Routes](../../src/app/api/parts/)

---

## Future Enhancements (Phase 16+)

### Phase 16: Advanced CSV Features
- Export/import relations (cross-references, OEM numbers, vehicle compatibility)
- Multiple CSV files (1 for products, 1 for relations)
- Image URL download during import
- Variants import/export
- Progress tracking for large imports
- Background job processing

### Phase 17: Enterprise Features
- Scheduled exports (daily/weekly backups)
- Import from external URLs
- Mapping wizard (column name flexibility)
- Data transformation rules
- Audit log for imports
- Rollback/undo feature
- Concurrent import queue

---

## Conclusion

Phase 15 provides essential bulk data management capabilities for the showcase website. Admins can efficiently manage hundreds of products through CSV files, enabling:

- **Quick Setup:** Bulk import product catalogs
- **Easy Maintenance:** Update prices, specs, categories in bulk
- **Data Portability:** Export for backup or migration
- **Offline Editing:** Work in familiar tools (Excel/Google Sheets)
- **Collaboration:** Share CSV with team or clients for review

The implementation avoids over-complexity by focusing on core product fields in Phase 15, with relations and advanced features planned for Phase 16+.

---

**Ready to implement? Review this document and confirm scope before starting development.**
