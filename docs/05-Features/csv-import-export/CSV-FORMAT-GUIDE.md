# CSV Import/Export Format Guide

This guide provides comprehensive documentation for the CSV format used in the product import/export system.

## Table of Contents
- [Overview](#overview)
- [Column Reference](#column-reference)
- [Data Type Formats](#data-type-formats)
- [Required vs Optional Fields](#required-vs-optional-fields)
- [Validation Rules](#validation-rules)
- [Import Modes](#import-modes)
- [Example Rows](#example-rows)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

The CSV import/export system supports **27 columns** for managing product data in bulk. The system uses standard CSV format with comma delimiters and double-quote text qualifiers.

**File Requirements:**
- Format: CSV (Comma-Separated Values)
- Encoding: UTF-8
- Max file size: 10MB
- First row: Column headers (case-sensitive)

---

## Column Reference

| # | Column Name | Data Type | Required | Description |
|---|-------------|-----------|----------|-------------|
| 1 | `name` | String | ✅ Yes | Product name (display title) |
| 2 | `sku` | String | ✅ Yes | Stock Keeping Unit (unique identifier) |
| 3 | `partNumber` | String | ✅ Yes | Manufacturer part number (uppercase, numbers, hyphens only) |
| 4 | `price` | Decimal | ✅ Yes | Product price (must be positive, max 999999.99) |
| 5 | `comparePrice` | Decimal | ❌ No | Original price for comparison (strikethrough display) |
| 6 | `compareAtPrice` | Decimal | ❌ No | Alternative comparison price |
| 7 | `description` | Text | ❌ No | Full product description (supports markdown) |
| 8 | `shortDesc` | Text | ❌ No | Brief product summary |
| 9 | `category` | String | ✅ Yes | Category name (must match existing category, case-insensitive) |
| 10 | `brand` | String | ❌ No | Brand or manufacturer name |
| 11 | `origin` | String | ❌ No | Country of origin |
| 12 | `warranty` | String | ❌ No | Warranty information |
| 13 | `difficulty` | String | ❌ No | Installation difficulty: `Easy`, `Moderate`, `Professional`, or `Advanced` |
| 14 | `tags` | Array | ❌ No | Search tags (pipe-separated: `tag1\|tag2\|tag3`) |
| 15 | `compatibility` | Array | ❌ No | Compatible vehicles (pipe-separated) |
| 16 | `application` | Array | ❌ No | Application areas (pipe-separated) |
| 17 | `certifications` | Array | ❌ No | Product certifications (pipe-separated) |
| 18 | `images` | Array | ❌ No | Image URLs (pipe-separated) |
| 19 | `specifications` | JSON | ❌ No | Technical specs as JSON object |
| 20 | `videoUrl` | URL | ❌ No | Product video URL (YouTube, Vimeo, etc.) |
| 21 | `pdfUrl` | URL | ❌ No | PDF documentation URL |
| 22 | `featured` | Boolean | ❌ No | Featured product flag: `true` or `false` (default: `false`) |
| 23 | `published` | Boolean | ❌ No | Published status: `true` or `false` (default: `false`) |
| 24 | `publishedAt` | DateTime | ❌ No | Publication date (ISO 8601 format) |
| 25 | `showcaseOrder` | Integer | ❌ No | Display order (1-999, lower = higher priority, default: 999) |
| 26 | `views` | Integer | ❌ No | View count (default: 0) |
| 27 | `hasVariants` | Boolean | ❌ No | Has product variants: `true` or `false` (default: `false`) |

---

## Data Type Formats

### String
Plain text, enclosed in quotes if contains commas or special characters.
```csv
"Auto Parts Store"
```

### Decimal
Numeric value with up to 2 decimal places. No currency symbols.
```csv
99.99
```

### Text
Longer text content, can contain line breaks (use escaped quotes).
```csv
"High-quality brake pads with ceramic compound.
Designed for maximum stopping power."
```

### Array (Pipe-Delimited)
Multiple values separated by pipe character (`|`). No spaces around pipes.
```csv
"Toyota Camry 2015-2020|Honda Accord 2016-2021"
```

### JSON
Valid JSON object, escaped properly in CSV.
```csv
"{""material"":""Ceramic"",""weight"":""2.5kg"",""temp_range"":""-40 to 300°C""}"
```

### Boolean
String literals: `true` or `false` (case-insensitive).
```csv
true
false
```

### DateTime (ISO 8601)
Format: `YYYY-MM-DDTHH:mm:ss.sssZ` or `YYYY-MM-DD`
```csv
2024-01-15T10:30:00.000Z
2024-01-15
```

### Integer
Whole number, no decimals.
```csv
5
999
```

---

## Required vs Optional Fields

### ✅ Required Fields (5)
These fields **must** be provided for every product:

1. **name** - Product display name
2. **sku** - Unique stock identifier
3. **partNumber** - Manufacturer part number
4. **price** - Product price
5. **category** - Category name (must exist in system)

### ❌ Optional Fields (22)
All other fields can be left empty or omitted. System will use default values:

- Text fields → `null` (empty)
- Arrays → `[]` (empty array)
- Booleans → `false`
- Numbers → `0` or `999` (showcaseOrder)
- JSON → `null`

---

## Validation Rules

### SKU Rules
- ✅ Must be unique across all products
- ✅ Can contain letters, numbers, hyphens, underscores
- ✅ Case-sensitive (`SKU-001` ≠ `sku-001`)
- ❌ Cannot contain spaces or special characters
- ❌ Cannot be empty

### Part Number Rules
- ✅ Must be unique
- ✅ Uppercase letters, numbers, hyphens only
- ✅ Format: `[A-Z0-9-]+`
- ❌ No lowercase letters, spaces, or other characters

### Price Rules
- ✅ Must be positive number
- ✅ Max value: 999,999.99
- ✅ Up to 2 decimal places
- ❌ Cannot be zero or negative
- ❌ No currency symbols ($, €, etc.)

### Category Rules
- ✅ Must match existing category name
- ✅ Case-insensitive matching
- ✅ Leading/trailing spaces ignored
- ❌ Cannot be empty
- ❌ Cannot be a non-existent category

### Difficulty Rules
If provided, must be one of:
- `Easy`
- `Moderate`
- `Professional`
- `Advanced`

### Showcase Order Rules
- ✅ Integer between 1 and 999
- ✅ Lower numbers appear first
- ❌ Cannot be 0 or negative

---

## Import Modes

The system supports three import modes:

### 1. Create Only
- Creates new products only
- **Fails** if SKU already exists
- Use for: Initial product imports

### 2. Update Only
- Updates existing products by SKU
- **Fails** if SKU not found
- Use for: Bulk product updates

### 3. Upsert (Recommended)
- Creates new or updates existing by SKU
- **Safe for any scenario**
- Use for: General imports, mixed create/update

---

## Example Rows

### ✅ Valid Example
```csv
name,sku,partNumber,price,comparePrice,compareAtPrice,description,shortDesc,category,brand,origin,warranty,difficulty,tags,compatibility,application,certifications,images,specifications,videoUrl,pdfUrl,featured,published,publishedAt,showcaseOrder,views,hasVariants
"Ceramic Brake Pads Set",BP-CER-001,BP-CER-001,89.99,129.99,119.99,"Premium ceramic brake pads for superior stopping power and reduced brake dust.","High-performance ceramic brake pads",Brakes,BrakeMaster,Germany,2 years,Moderate,"brake pads|ceramic|performance","Toyota Camry 2015-2020|Honda Accord 2016-2021","Front Brakes|Rear Brakes","ISO 9001|ECE R90","https://example.com/brake-pad-1.jpg|https://example.com/brake-pad-2.jpg","{""material"":""Ceramic"",""weight"":""2.5kg""}",https://youtube.com/watch?v=example,https://example.com/manual.pdf,true,true,2024-01-15T10:00:00.000Z,5,150,false
```

### ✅ Minimal Valid Example
```csv
name,sku,partNumber,price,comparePrice,compareAtPrice,description,shortDesc,category,brand,origin,warranty,difficulty,tags,compatibility,application,certifications,images,specifications,videoUrl,pdfUrl,featured,published,publishedAt,showcaseOrder,views,hasVariants
"Oil Filter",OF-001,OF-STD-001,12.99,,,,,Filters,,,,,,,,,,,,,,false,,,
```

### ❌ Invalid Examples

**Missing Required Fields:**
```csv
name,sku,partNumber,price,category
"Brake Pad",,BP-001,,Brakes  ❌ Missing SKU and price
```

**Invalid Price:**
```csv
name,sku,partNumber,price,category
"Air Filter",AF-001,AF-001,$29.99,Filters  ❌ Currency symbol not allowed
"Oil Filter",OF-001,OF-001,-10.00,Filters  ❌ Negative price
```

**Invalid Part Number:**
```csv
name,sku,partNumber,price,category
"Spark Plug",SP-001,sp-ngk-001,5.99,Ignition  ❌ Lowercase not allowed
"Wire Set",WS-001,WS 8MM 001,39.99,Ignition  ❌ Spaces not allowed
```

**Non-existent Category:**
```csv
name,sku,partNumber,price,category
"Turbo Kit",TK-001,TK-V6-001,999.99,Turbos  ❌ Category doesn't exist
```

**Duplicate SKU (within file):**
```csv
name,sku,partNumber,price,category
"Product 1",SKU-001,PN-001,10.00,Parts
"Product 2",SKU-001,PN-002,20.00,Parts  ❌ Duplicate SKU
```

---

## Troubleshooting

### Common Errors & Solutions

#### Error: "SKU already exists"
**Cause:** Product with this SKU is already in database  
**Solution:** 
- Use "Update" or "Upsert" mode instead of "Create"
- Or change the SKU to a unique value

#### Error: "Category not found"
**Cause:** Category name doesn't match any existing category  
**Solution:** 
- Check spelling and capitalization
- View available categories in the admin panel
- Create the category first, then import

#### Error: "Invalid price format"
**Cause:** Price contains invalid characters or format  
**Solution:** 
- Remove currency symbols ($, €, £)
- Use decimal point, not comma (99.99 not 99,99)
- Ensure positive number

#### Error: "Part number must contain only uppercase letters, numbers, and hyphens"
**Cause:** Part number contains invalid characters  
**Solution:** 
- Use UPPERCASE letters only
- Only letters, numbers, and hyphens allowed
- No spaces or special characters

#### Error: "Invalid CSV format"
**Cause:** CSV file is malformed  
**Solution:** 
- Ensure UTF-8 encoding
- Use comma delimiters
- Quote text containing commas
- Check for unclosed quotes

#### Error: "File size exceeds 10MB"
**Cause:** CSV file is too large  
**Solution:** 
- Split into multiple smaller files
- Remove unnecessary data
- Compress images separately

### Validation Warnings

**Warnings don't block import** but indicate potential issues:

- **Invalid comparePrice**: Will be set to null
- **Invalid JSON in specifications**: Will be set to null
- **Invalid showcaseOrder**: Will be set to 999

---

## Best Practices

### 1. Use the Template
Download the official CSV template from the import page to ensure correct format.

### 2. Test with Small Batches
Import 5-10 products first to verify format before bulk importing hundreds.

### 3. Validate Before Import
Use the validation step to identify errors before executing the import.

### 4. Use Unique SKUs
Establish a SKU naming convention:
- ✅ `CAT-TYPE-001` (Category-Type-Number)
- ✅ `BP-CER-001` (BrakePad-Ceramic-001)
- ❌ `SKU1`, `SKU2` (not descriptive)

### 5. Backup Before Updates
Export your current products before doing bulk updates via "Update" mode.

### 6. Use Upsert for Safety
When unsure, use "Upsert" mode - it's safe for both new and existing products.

### 7. Prepare Images First
Upload product images to your media library and copy the URLs before importing.

### 8. Format Arrays Carefully
Use pipe character (`|`) with no spaces:
- ✅ `tag1|tag2|tag3`
- ❌ `tag1 | tag2 | tag3` (spaces will be included)

### 9. Validate JSON Syntax
Test JSON objects in a JSON validator before adding to CSV:
```json
{"key": "value", "number": 123}
```

### 10. Handle Special Characters
Quote CSV cells containing:
- Commas: `"Value with, comma"`
- Quotes: `"Value with ""quoted"" text"`
- Line breaks: `"Multi\nline\ntext"`

### 11. Clean Data First
Remove:
- Trailing spaces in category names
- Inconsistent capitalization in SKUs
- Currency symbols in prices
- Invalid characters in part numbers

### 12. Use Spreadsheet Software Carefully
When using Excel or Google Sheets:
- Save as CSV UTF-8
- Don't auto-format numbers (leading zeros)
- Keep text format for SKUs
- Check date formats match ISO 8601

---

## Quick Reference Card

### Required Fields Checklist
- [ ] name
- [ ] sku (unique)
- [ ] partNumber (uppercase, numbers, hyphens only)
- [ ] price (positive number, no symbols)
- [ ] category (must exist in system)

### Data Format Quick Guide
| Type | Format | Example |
|------|--------|---------|
| String | Plain text | `"Brake Pad"` |
| Decimal | Number | `99.99` |
| Array | Pipe-separated | `"A\|B\|C"` |
| Boolean | true/false | `true` |
| JSON | Escaped JSON | `"{\""key\"":\""val\""}"` |
| Date | ISO 8601 | `2024-01-15T10:00:00Z` |

### Import Mode Selection
- **First import?** → Use "Create"
- **Updating prices?** → Use "Update" 
- **Not sure?** → Use "Upsert" ✅ (safest)

---

## Support

For additional help:
1. Download the template CSV for correct format
2. Use validation step to identify errors before import
3. Check error reports for specific row/field issues
4. Review this guide for data format requirements

---

*Last updated: Phase 15 - CSV Import/Export System*
