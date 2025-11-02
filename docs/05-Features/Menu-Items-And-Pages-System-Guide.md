# Menu Items & Pages System - User Guide

## Overview
The admin panel has a complete system for creating custom pages and linking them to navigation menu items. This guide explains how to use both features together.

## System Architecture

### Two Main Components:

1. **Pages Management** (`/admin/pages`)
   - Create custom pages that display specific products
   - Configure which products to show (categories, tags, collections, etc.)
   - Set page layout, sorting, and SEO settings
   - Publish/unpublish pages

2. **Menu Items Management** (`/admin/menu-items`)
   - Create navigation menu structure
   - Link menu items to pages or external URLs
   - Support multi-level menus (parent/child relationships)
   - Drag-and-drop ordering
   - Show/hide menu items

---

## How to Create a Page and Add it to Menu

### Step 1: Create a Page

1. Navigate to **Admin Panel** → **Pages**
2. Click **"New Page"** button
3. Fill in page details:

#### Basic Information:
- **Title**: Display name (e.g., "Brake Systems")
- **Slug**: URL path (e.g., "brake-systems" → `/brake-systems`)
- **Description**: Brief description of the page

#### Product Group Configuration:
Choose what products to display:

**Group Type Options:**
- `category` - Show products from specific categories
- `tag` - Show products with specific tags
- `collection` - Show products from a collection
- `all` - Show all products with optional filters

**Group Values** (JSON configuration):
```json
{
  "categoryIds": ["cat123", "cat456"],
  "tags": ["brake", "safety"],
  "collectionId": "col789",
  "showAll": false,
  "brands": ["Bosch", "Brembo"],
  "origins": ["Germany"],
  "minPrice": 50,
  "maxPrice": 500,
  "inStock": true
}
```

#### Display Options:
- **Layout**: Grid or List view
- **Sort By**: Name, Price, or Newest
- **Items Per Page**: How many products to show (default: 12)

#### SEO Settings:
- **Meta Title**: SEO title tag
- **Meta Description**: SEO description tag

#### Publishing:
- **Published**: Toggle to make page live
- **Published At**: Automatically set when published

4. Click **"Create Page"**

### Step 2: Add Page to Menu

1. Navigate to **Admin Panel** → **Menu Items**
2. Click **"Add Menu Item"** button
3. Fill in menu item details:

#### Menu Item Configuration:
- **Label**: Text shown in navigation (e.g., "Brake Systems")
- **Parent Menu Item**: Select parent for sub-menu (or "None" for top-level)

#### Link Type:
Choose one:
- **Link to Page**: Select from your created pages
- **External URL**: Enter any URL (internal or external)

#### Link Configuration:
- **Select Page**: Choose the page you created
  OR
- **External URL**: Enter URL (e.g., `/about`, `https://example.com`)

#### Settings:
- **Position**: Order in menu (0, 1, 2... lower numbers first)
- **Visible in menu**: Toggle to show/hide
- **Open in new tab**: Toggle for external links

4. Click **"Create"**

---

## Use Cases & Examples

### Example 1: Product Category Page

**Scenario**: Create a "Brake Parts" page showing all brake-related products

**Step 1: Create Page**
- Title: "Brake Parts"
- Slug: "brake-parts"
- Group Type: `tag`
- Group Values: `{ "tags": ["brake", "braking system"] }`
- Layout: Grid
- Published: Yes

**Step 2: Add to Menu**
- Label: "Brake Parts"
- Link Type: Link to Page
- Select Page: "Brake Parts"
- Position: 2
- Visible: Yes

**Result**: Menu shows "Brake Parts" → clicking opens `/brake-parts` page

---

### Example 2: Multi-Level Menu

**Scenario**: Create "Products" menu with sub-categories

**Create Pages:**
1. "All Products" (showAll: true)
2. "Brake Systems" (categoryId: brake category)
3. "Transmission Parts" (categoryId: transmission category)

**Create Menu Structure:**

**Top Level:**
- Label: "Products"
- Link to Page: "All Products"
- Position: 1

**Sub-Menu Items:**
- Label: "Brake Systems"
- Parent: "Products"
- Link to Page: "Brake Systems"
- Position: 0

- Label: "Transmission Parts"
- Parent: "Products"
- Link to Page: "Transmission Parts"
- Position: 1

**Result**:
```
Products ▼
  ├─ Brake Systems
  └─ Transmission Parts
```

---

### Example 3: External Link in Menu

**Scenario**: Add "Contact Us" link to menu

**Create Menu Item:**
- Label: "Contact Us"
- Link Type: External URL
- External URL: `/contact`
- Position: 5
- Visible: Yes
- Open in new tab: No

**Result**: Menu shows "Contact Us" → clicking opens `/contact` page

---

### Example 4: Collection Page

**Scenario**: Create "Featured Products" page from a collection

**Step 1: Create Page**
- Title: "Featured Products"
- Slug: "featured"
- Group Type: `collection`
- Group Values: `{ "collectionId": "coll_123" }`
- Published: Yes

**Step 2: Add to Menu**
- Label: "Featured"
- Link to Page: "Featured Products"
- Position: 0

---

## Advanced Features

### Multi-Level Menus (Nested Navigation)

You can create up to multiple levels of menus:

1. **Create Parent Item**:
   - Label: "Shop"
   - Link to Page or URL
   - Parent: None (top-level)

2. **Create Child Items**:
   - Label: "By Category"
   - Parent: "Shop"
   - Link to Page

3. **Create Grandchild Items**:
   - Label: "Brake Parts"
   - Parent: "By Category"
   - Link to Page

**Visual Structure**:
```
Shop ▼
  └─ By Category ▼
      ├─ Brake Parts
      ├─ Engine Parts
      └─ Transmission Parts
```

### Dynamic Product Filtering

Pages can show filtered products using Group Values:

**Show products with multiple criteria:**
```json
{
  "tags": ["premium", "certified"],
  "brands": ["Bosch", "Continental"],
  "origins": ["Germany", "Japan"],
  "minPrice": 100,
  "maxPrice": 1000,
  "inStock": true
}
```

**Result**: Page displays only German/Japanese Bosch or Continental products, priced $100-$1000, that are in stock and tagged as premium/certified.

---

## Menu Management Features

### Drag-and-Drop Ordering
- Reorder menu items by dragging
- Works for both top-level and sub-menu items
- Automatically saves new order

### Show/Hide Items
- Toggle visibility without deleting
- Useful for seasonal menus or testing
- Hidden items shown in admin with indicator

### Delete Protection
- Cannot delete pages with active menu links
- System prevents orphaned menu items
- Must remove menu links before deleting pages

---

## Page Display Features

### Automatic Product Loading
- Pages automatically fetch products based on configuration
- Supports pagination
- Real-time filtering based on group values

### Layout Options
- **Grid**: Cards in responsive grid (default)
- **List**: Detailed list view with more information

### Sorting Options
- Name (A-Z or Z-A)
- Price (Low to High or High to Low)
- Newest First
- Most Popular

### SEO Optimization
- Each page has custom meta title and description
- Automatically generated Open Graph tags
- Clean, SEO-friendly URLs

---

## Best Practices

### Page Organization
1. **Plan your structure**: Map out page hierarchy before creating
2. **Use clear names**: Make titles descriptive and user-friendly
3. **Organize by category**: Group related products logically
4. **Set proper slugs**: Use SEO-friendly, readable URLs

### Menu Structure
1. **Keep it simple**: 3-4 top-level items is ideal
2. **Limit nesting**: Max 2-3 levels deep
3. **Use descriptive labels**: Clear, concise menu text
4. **Order logically**: Put important items first

### Product Groups
1. **Test configurations**: Preview before publishing
2. **Use multiple filters**: Combine tags, brands, categories
3. **Monitor performance**: Check what displays correctly
4. **Update regularly**: Keep product groups current

---

## Troubleshooting

### Issue: Page not showing in menu
**Solution**: 
- Check if menu item is marked as "Visible"
- Verify the menu item links to correct page
- Ensure page is published

### Issue: Wrong products displaying
**Solution**:
- Review Group Values JSON configuration
- Check category/tag assignments on products
- Verify filter criteria (price, stock, etc.)

### Issue: Cannot delete page
**Solution**:
- Check if page is linked to menu items
- Go to Menu Items and remove links first
- Then delete the page

### Issue: Menu order not saving
**Solution**:
- Ensure drag operation completes
- Check for JavaScript errors in browser console
- Refresh page to see saved state

---

## API Endpoints

### Pages
- `GET /api/admin/pages` - List all pages
- `POST /api/admin/pages` - Create page
- `GET /api/admin/pages/[id]` - Get page details
- `PUT /api/admin/pages/[id]` - Update page
- `DELETE /api/admin/pages/[id]` - Delete page

### Menu Items
- `GET /api/admin/menu-items` - List menu tree
- `POST /api/admin/menu-items` - Create menu item
- `PUT /api/admin/menu-items/[id]` - Update menu item
- `DELETE /api/admin/menu-items/[id]` - Delete menu item
- `PATCH /api/admin/menu-items/reorder` - Reorder items

---

## Summary

The Pages + Menu Items system provides a complete solution for:
✅ Creating custom product listing pages  
✅ Building dynamic navigation menus  
✅ Organizing products by categories, tags, collections  
✅ Multi-level menu structures  
✅ SEO-optimized pages  
✅ Easy management with drag-and-drop  

**Workflow**: Create Page → Configure Products → Add to Menu → Publish
