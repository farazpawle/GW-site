# Quick Reference: SKU Field Usage

## What is SKU?
SKU (Stock Keeping Unit) is a unique identifier for each product. It helps with:
- Inventory management
- Product tracking
- Quick product lookup
- Integration with external systems

## SKU Format Rules
- **Required**: Yes, every product must have a SKU
- **Unique**: No two products can have the same SKU
- **Characters**: Only uppercase letters (A-Z), numbers (0-9), and hyphens (-)
- **Length**: 1-100 characters

## Examples of Valid SKUs
✅ `SKU-BRA-123456`
✅ `BRAKE-PAD-2024`
✅ `HP-AIR-FILTER-001`
✅ `EXH-SYS-789`
✅ `LED-KIT-XYZ123`

## Examples of Invalid SKUs
❌ `sku-brake-pad` (must be uppercase)
❌ `BRAKE PAD 001` (no spaces allowed)
❌ `BRAKE_PAD_001` (no underscores allowed)
❌ `BRAKE.PAD.001` (no periods allowed)
❌ `brake/pad/001` (no slashes allowed)

## Where SKU Appears

### 1. Admin Product Form
- Located right after the "Part Number" field
- Marked as required with a red asterisk (*)
- Automatically converts input to uppercase

### 2. Product Cards (Public View)
- Appears in the top-right corner
- Displays in small, gray, monospace font
- Visible next to the brand name

### 3. Admin Product Table
- Has its own dedicated column
- Located between "Part #" and "Category"
- Sortable by clicking the column header
- Displays in monospace font

### 4. Search Results
- Products can be found by searching their SKU
- SKU is included in the search index

## Current Products with SKUs

| Product Name                    | SKU              |
|---------------------------------|------------------|
| High Performance Brake Pad Set  | SKU-BRA-123456   |
| LED Headlight Upgrade Kit       | SKU-LIG-901234   |
| Performance Air Filter          | SKU-AIR-345678   |
| Racing Exhaust System           | SKU-EXH-567890   |
| Sport Suspension Kit            | SKU-SUS-789012   |

## Best Practices

### 1. Consistent Naming Convention
Choose a format and stick with it. Recommended format:
```
[PREFIX]-[CATEGORY]-[PRODUCT_CODE]
```

### 2. Make it Meaningful
Include information that helps identify the product:
- Product category
- Product line or series
- Sequential number

### 3. Keep it Short
While you have 100 characters, shorter SKUs are easier to:
- Remember
- Type
- Communicate verbally

### 4. Plan for Growth
Leave room in your numbering system for future products:
- Use 001, 002, 003 instead of 1, 2, 3
- This allows for up to 999 products in a series

### 5. Document Your System
Keep a record of your SKU format rules for:
- New team members
- Consistency across products
- Future reference

## Common Use Cases

### Adding a New Product
1. Go to Admin > Products > Add New Product
2. Fill in basic information (Name, Part Number, etc.)
3. Enter a unique SKU following your format rules
4. Save the product

### Editing an Existing Product
1. Go to Admin > Products
2. Click "Edit" on the product
3. Modify the SKU if needed (ensure it's still unique)
4. Save changes

### Finding a Product by SKU
1. Use the search bar in the admin or public interface
2. Type the SKU (or part of it)
3. Product will appear in search results

### Sorting by SKU
1. Go to Admin > Products table
2. Click the "SKU" column header
3. Products will be sorted alphabetically by SKU

## Troubleshooting

### Error: "SKU is required"
**Cause**: SKU field is empty
**Solution**: Enter a valid SKU value

### Error: "SKU must contain only uppercase letters, numbers, and hyphens"
**Cause**: SKU contains invalid characters
**Solution**: Remove spaces, underscores, periods, or lowercase letters

### Error: "SKU already exists" (Duplicate SKU)
**Cause**: Another product already uses this SKU
**Solution**: Choose a different, unique SKU

### SKU Not Showing on Product Card
**Cause**: SKU might be empty or the component needs refresh
**Solution**: 
1. Verify the product has a SKU in the database
2. Refresh the page
3. Check browser console for errors

## API Usage

### Get Product with SKU
```typescript
GET /api/public/showcase/products/:slug
Response includes: { ..., sku: "SKU-BRA-123456", ... }
```

### Search by SKU
```typescript
GET /api/parts?search=SKU-BRA
Returns: All products with SKU containing "SKU-BRA"
```

### Create Product with SKU
```typescript
POST /api/admin/parts
Body: {
  name: "New Product",
  sku: "NEW-PROD-001",
  // ... other fields
}
```

## Support
For questions or issues with the SKU field:
1. Check this guide first
2. Review the main documentation: `docs/SKU-IMPLEMENTATION-COMPLETE.md`
3. Check the validation rules in: `src/lib/validations/product.ts`

---
**Last Updated**: October 16, 2025
