# CSV Import/Export System - Test Plan & Results

## Test Execution Summary

**Phase:** 15 - CSV Import/Export System  
**Test Date:** [To be executed by user]  
**Status:** ✅ Ready for Testing

---

## Test Categories

### 1. Template Download Tests
### 2. Export Functionality Tests
### 3. Import Validation Tests
### 4. Import Execution Tests
### 5. Edge Case Tests
### 6. Data Integrity Tests

---

## 1. Template Download Tests

### Test 1.1: Download Template
**Objective:** Verify template file downloads correctly  
**Steps:**
1. Navigate to `/admin/parts`
2. Click "Import CSV" button
3. Click "Download Template" button in Step 1

**Expected Results:**
- ✅ File downloads with name `products-template.csv`
- ✅ File contains 27 column headers
- ✅ File contains 1 example row
- ✅ All headers match documentation

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 1.2: Template Format
**Objective:** Verify template is properly formatted  
**Steps:**
1. Open downloaded template in text editor
2. Verify comma delimiters
3. Check quoted fields

**Expected Results:**
- ✅ Headers: `name,sku,partNumber,price,comparePrice,compareAtPrice,description,shortDesc,category,brand,origin,warranty,difficulty,tags,compatibility,application,certifications,images,specifications,videoUrl,pdfUrl,featured,published,publishedAt,showcaseOrder,views,hasVariants`
- ✅ Example row has valid data
- ✅ Array fields use pipe delimiters
- ✅ JSON fields are properly escaped

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

## 2. Export Functionality Tests

### Test 2.1: Export All Products
**Objective:** Export complete product catalog  
**Steps:**
1. Navigate to `/admin/parts`
2. Click "Export CSV" button
3. Select "All Products"
4. Click "Export CSV"

**Expected Results:**
- ✅ File downloads successfully
- ✅ Filename format: `products-all-YYYY-MM-DD.csv`
- ✅ Contains all products from database
- ✅ All 27 columns present
- ✅ Data correctly formatted

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.2: Export Filtered Products
**Objective:** Export with active filters  
**Steps:**
1. Navigate to `/admin/parts`
2. Apply search filter (e.g., "brake")
3. Click "Export CSV"
4. Select "Filtered Products"
5. Click "Export CSV"

**Expected Results:**
- ✅ Only filtered products in export
- ✅ Filename: `products-filtered-YYYY-MM-DD.csv`
- ✅ Product count matches filtered view

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.3: Export Published Products
**Objective:** Export only published products  
**Steps:**
1. Click "Export CSV"
2. Select "Published Products"
3. Click "Export CSV"

**Expected Results:**
- ✅ Only products with `published=true`
- ✅ Filename: `products-published-YYYY-MM-DD.csv`

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.4: Export Draft Products
**Objective:** Export unpublished drafts  
**Steps:**
1. Click "Export CSV"
2. Select "Draft Products"
3. Click "Export CSV"

**Expected Results:**
- ✅ Only products with `published=false`
- ✅ Filename: `products-draft-YYYY-MM-DD.csv`

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.5: Export Featured Products
**Objective:** Export featured products only  
**Steps:**
1. Click "Export CSV"
2. Select "Featured Products"
3. Click "Export CSV"

**Expected Results:**
- ✅ Only products with `featured=true`
- ✅ Filename: `products-featured-YYYY-MM-DD.csv`

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 2.6: Export Data Integrity
**Objective:** Verify exported data can be re-imported  
**Steps:**
1. Export all products
2. Open CSV file
3. Verify data formats

**Expected Results:**
- ✅ Decimal prices formatted correctly (no scientific notation)
- ✅ Arrays use pipe delimiters
- ✅ JSON is properly escaped
- ✅ Booleans are `true`/`false` strings
- ✅ Dates in ISO 8601 format
- ✅ No data corruption

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

## 3. Import Validation Tests

### Test 3.1: Validate Valid File
**Objective:** Validation passes for correct CSV  
**Steps:**
1. Use template CSV with 5 valid products
2. Click "Import CSV"
3. Upload file
4. Click "Continue"

**Expected Results:**
- ✅ Validation completes successfully
- ✅ Summary shows: 5 total, 5 valid, 0 invalid
- ✅ Preview shows first 10 rows
- ✅ No errors displayed
- ✅ Can proceed to Step 3

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.2: Detect Missing Required Fields
**Objective:** Validation catches missing required fields  
**Steps:**
1. Create CSV with missing `sku` field
2. Import and validate

**Expected Results:**
- ✅ Validation shows errors
- ✅ Error message: "SKU is required"
- ✅ Correct row number displayed
- ✅ Invalid count incremented

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.3: Detect Duplicate SKUs
**Objective:** Validation catches duplicate SKUs  
**Steps:**
1. Create CSV with duplicate SKU in row 3 and 5
2. Import and validate

**Expected Results:**
- ✅ Validation shows error for row 3 or 5
- ✅ Error message mentions duplicate SKU
- ✅ Both row numbers identified

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.4: Detect Invalid Price
**Objective:** Validation catches invalid prices  
**Steps:**
1. Create CSV with negative price
2. Create CSV with price containing `$` symbol
3. Validate each

**Expected Results:**
- ✅ Error: "Price must be a positive number"
- ✅ Error: Invalid price format
- ✅ Correct row numbers

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.5: Detect Invalid Category
**Objective:** Validation catches non-existent categories  
**Steps:**
1. Create CSV with category "NonExistentCategory"
2. Validate

**Expected Results:**
- ✅ Error: 'Category "NonExistentCategory" not found'
- ✅ Correct row number
- ✅ Product marked as invalid

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.6: Detect Invalid Part Number
**Objective:** Validation catches invalid part number format  
**Steps:**
1. Create CSV with lowercase part number
2. Create CSV with part number containing spaces
3. Validate each

**Expected Results:**
- ✅ Error: "Part number must contain only uppercase letters, numbers, and hyphens"
- ✅ Correct row numbers

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.7: Validation Preview
**Objective:** Preview shows correct first 10 rows  
**Steps:**
1. Upload CSV with 20 products
2. Validate

**Expected Results:**
- ✅ Preview table shows exactly 10 rows
- ✅ Shows: Row number, Name, SKU, Price, Category
- ✅ Data matches CSV content

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 3.8: Download Error Report
**Objective:** Error report downloads correctly  
**Steps:**
1. Validate CSV with errors
2. Click "Download Report" button

**Expected Results:**
- ✅ CSV file downloads
- ✅ Contains: Row, Field, Error columns
- ✅ All errors listed
- ✅ Filename: `import-errors-YYYY-MM-DD.csv`

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

## 4. Import Execution Tests

### Test 4.1: Create Mode - New Products
**Objective:** Create mode imports new products  
**Steps:**
1. Prepare CSV with 3 new products (unique SKUs)
2. Complete validation
3. Select "Create Only" mode
4. Click "Import Products"
5. Verify results

**Expected Results:**
- ✅ Import completes successfully
- ✅ Results: 3 created, 0 updated, 0 failed
- ✅ Products appear in product list
- ✅ All data correctly saved

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4.2: Create Mode - Existing SKU
**Objective:** Create mode fails on existing SKU  
**Steps:**
1. Export 1 existing product
2. Try to import with "Create Only" mode

**Expected Results:**
- ✅ Import completes with failures
- ✅ Error: "Product with SKU 'XXX' already exists"
- ✅ Failed count: 1
- ✅ No products created

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4.3: Update Mode - Existing Products
**Objective:** Update mode updates existing products  
**Steps:**
1. Export 2 existing products
2. Modify prices in CSV
3. Import with "Update Only" mode

**Expected Results:**
- ✅ Import completes successfully
- ✅ Results: 0 created, 2 updated, 0 failed
- ✅ Prices updated in database
- ✅ Other fields preserved

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4.4: Update Mode - New SKU
**Objective:** Update mode fails on new SKU  
**Steps:**
1. Create CSV with new SKU
2. Import with "Update Only" mode

**Expected Results:**
- ✅ Import completes with failures
- ✅ Error: "Product with SKU 'XXX' not found"
- ✅ Failed count: 1
- ✅ No products created

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4.5: Upsert Mode - Mixed
**Objective:** Upsert handles both new and existing  
**Steps:**
1. Create CSV with:
   - 2 new products
   - 2 existing products (modified data)
2. Import with "Upsert" mode

**Expected Results:**
- ✅ Import completes successfully
- ✅ Results: 2 created, 2 updated, 0 failed
- ✅ New products created
- ✅ Existing products updated

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4.6: Transaction Rollback
**Objective:** Verify transaction rolls back on error  
**Steps:**
1. Create CSV with 5 products
2. Make product #3 invalid (bad category)
3. Import with any mode

**Expected Results:**
- ✅ Import completes with partial success
- ✅ Products 1-2 imported
- ✅ Product 3 failed with error
- ✅ Products 4-5 imported
- ✅ Database consistent (no partial data)

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4.7: Import Results Display
**Objective:** Results screen shows accurate information  
**Steps:**
1. Complete any import with mixed results
2. View Step 4

**Expected Results:**
- ✅ Shows total/created/updated/failed counts
- ✅ Success or warning message displayed
- ✅ Failed products listed with errors
- ✅ Download error report available
- ✅ "Done" button closes wizard

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 4.8: Import Refresh
**Objective:** Product list refreshes after import  
**Steps:**
1. Note current product count
2. Import 3 new products
3. Close wizard

**Expected Results:**
- ✅ Page refreshes automatically
- ✅ New products visible in list
- ✅ Product count updated
- ✅ No need to manually refresh

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

## 5. Edge Case Tests

### Test 5.1: Empty CSV
**Objective:** Handle empty CSV file  
**Steps:**
1. Create CSV with only headers, no data rows
2. Import and validate

**Expected Results:**
- ✅ Validation error: "CSV file is empty"
- ✅ Cannot proceed to import

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.2: Large File (100+ Products)
**Objective:** Handle large imports  
**Steps:**
1. Create CSV with 150 products
2. Import with upsert mode

**Expected Results:**
- ✅ Validation completes (may take 5-10 seconds)
- ✅ Import completes successfully
- ✅ All 150 products imported
- ✅ No timeout errors
- ✅ Memory usage acceptable

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.3: File Size Limit (10MB)
**Objective:** Reject files over 10MB  
**Steps:**
1. Create CSV > 10MB
2. Try to upload

**Expected Results:**
- ✅ Error: "File size must not exceed 10MB"
- ✅ Upload rejected

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.4: Special Characters in Data
**Objective:** Handle special characters correctly  
**Steps:**
1. Create product with name: `Brake Pad - "Premium" 50% Off!`
2. Create product with description containing newlines
3. Import

**Expected Results:**
- ✅ Import successful
- ✅ Special characters preserved
- ✅ Quotes properly escaped
- ✅ Newlines preserved in description

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.5: Unicode Characters
**Objective:** Handle international characters  
**Steps:**
1. Create products with names in various languages:
   - Chinese: 刹车片
   - Arabic: فرامل
   - Emoji: 🚗 Brake Pad
2. Import

**Expected Results:**
- ✅ Import successful
- ✅ All Unicode characters preserved
- ✅ Display correctly in UI

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.6: Malformed JSON
**Objective:** Handle invalid JSON in specifications  
**Steps:**
1. Create product with invalid JSON: `{invalid json}`
2. Validate and import

**Expected Results:**
- ✅ Validation warning: "Invalid JSON in specifications"
- ✅ Import succeeds
- ✅ Specifications set to null

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.7: Empty Array Fields
**Objective:** Handle empty arrays correctly  
**Steps:**
1. Create product with empty tags field
2. Create product with tags: ``
3. Import

**Expected Results:**
- ✅ Import successful
- ✅ Empty arrays stored as `[]`
- ✅ No null/undefined errors

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.8: Array with Pipe in Value
**Objective:** Handle pipes within array values  
**Steps:**
1. Create product with compatibility: `Toyota Camry 2015-2020|Honda Accord`
2. Import

**Expected Results:**
- ✅ Splits correctly into 2 values
- ✅ No data corruption

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.9: Max Price Value
**Objective:** Handle maximum price (999,999.99)  
**Steps:**
1. Create product with price: `999999.99`
2. Create product with price: `1000000.00`
3. Import

**Expected Results:**
- ✅ First product imports successfully
- ✅ Second product fails validation
- ✅ Error: "Price must not exceed 999,999.99"

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 5.10: Showcasre Order Boundaries
**Objective:** Test showcase order limits  
**Steps:**
1. Create product with showcaseOrder: `1`
2. Create product with showcaseOrder: `999`
3. Create product with showcaseOrder: `0`
4. Create product with showcaseOrder: `1000`
5. Import

**Expected Results:**
- ✅ Products 1-2 import successfully
- ✅ Product 3 warning: "Invalid showcase order"
- ✅ Product 4 warning: "Invalid showcase order"
- ✅ Invalid values set to 999

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

## 6. Data Integrity Tests

### Test 6.1: Export-Import Cycle
**Objective:** Verify data integrity through full cycle  
**Steps:**
1. Export all products
2. Import exported file with upsert mode
3. Compare data

**Expected Results:**
- ✅ All products imported successfully
- ✅ No data loss or corruption
- ✅ Decimal precision preserved
- ✅ Arrays intact
- ✅ JSON objects unchanged
- ✅ Dates preserved

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 6.2: Decimal Precision
**Objective:** Verify decimal precision maintained  
**Steps:**
1. Create product with price: `12.34`
2. Create product with price: `99.99`
3. Import
4. Export
5. Check exported values

**Expected Results:**
- ✅ Prices stored as `12.34` and `99.99`
- ✅ No rounding errors
- ✅ No scientific notation

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 6.3: Category Relationship
**Objective:** Verify category relationships preserved  
**Steps:**
1. Create products in various categories
2. Import
3. Verify in database

**Expected Results:**
- ✅ Category IDs correctly assigned
- ✅ Category relationships intact
- ✅ Can filter by category

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 6.4: Slug Generation
**Objective:** Verify unique slugs generated  
**Steps:**
1. Import product: "Brake Pad Set"
2. Import another: "Brake Pad Set"
3. Check slugs

**Expected Results:**
- ✅ First slug: `brake-pad-set`
- ✅ Second slug: `brake-pad-set-xxxxx` (random suffix)
- ✅ Both slugs unique
- ✅ URLs work for both products

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 6.5: Update Preserves Slug
**Objective:** Verify update mode keeps existing slug  
**Steps:**
1. Export existing product
2. Change name in CSV
3. Import with update mode
4. Check slug

**Expected Results:**
- ✅ Slug unchanged
- ✅ Name updated
- ✅ Existing URLs still work

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 6.6: Boolean Conversions
**Objective:** Verify boolean field handling  
**Steps:**
1. Create products with:
   - `featured: true`
   - `featured: false`
   - `featured:` (empty)
2. Import

**Expected Results:**
- ✅ `true` → `true`
- ✅ `false` → `false`
- ✅ Empty → `false` (default)

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

### Test 6.7: Date Handling
**Objective:** Verify date parsing  
**Steps:**
1. Create product with publishedAt: `2024-01-15T10:00:00.000Z`
2. Create product with publishedAt: `2024-01-15`
3. Import

**Expected Results:**
- ✅ Both dates parse correctly
- ✅ Stored as DateTime in database
- ✅ Timezone preserved

**Actual Results:** [User to fill]

**Status:** ⬜ Pass / ⬜ Fail

---

## Test Summary

**Total Tests:** 47  
**Passed:** [Count]  
**Failed:** [Count]  
**Blocked:** [Count]

### Critical Issues Found
[List any critical bugs]

### Minor Issues Found
[List any minor issues]

### Recommendations
[Any recommendations for improvements]

---

## Sign-off

**Tested By:** [Name]  
**Date:** [Date]  
**Environment:** [Development/Staging/Production]  
**Browser:** [Chrome/Firefox/Safari/Edge]  
**Version:** Phase 15

**Approval:**
- ⬜ All tests passed
- ⬜ Ready for production
- ⬜ Issues need to be addressed

---

*This test plan covers all features of the CSV Import/Export system. Execute each test and document results.*
