# Quick Start: Creating a Page and Adding to Menu

## Visual Guide for Admin Users

This guide walks you through creating a new page and adding it to your navigation menu in 5 simple steps.

---

## Step-by-Step Process

### Step 1: Navigate to Pages Management

```
Admin Panel → Pages
```

**What you'll see:**
- List of existing pages
- Search and filter options
- "New Page" button in top right

**Action**: Click **"New Page"** button

---

### Step 2: Fill in Page Details

#### Form Fields:

**Basic Info:**
```
Title: *Required*
Example: "Brake Parts Catalog"

Slug: *Auto-generated from title*
Example: "brake-parts-catalog"
→ Page URL will be: https://yoursite.com/brake-parts-catalog

Description: *Optional*
Example: "Browse our complete selection of brake parts"
```

**Product Group Configuration:**

Choose what products this page will display:

```
Group Type: [Dropdown]
Options:
  • Category   - Show products from specific categories
  • Tag        - Show products with specific tags
  • Collection - Show products from a collection
  • All        - Show all products (with optional filters)
```

**Group Values** (JSON format):
```json
Examples:

For Category:
{
  "categoryIds": ["cat_brake_123"]
}

For Tags:
{
  "tags": ["brake", "safety"]
}

For Multiple Filters:
{
  "tags": ["premium"],
  "brands": ["Bosch"],
  "minPrice": 100,
  "maxPrice": 500,
  "inStock": true
}
```

**Display Settings:**
```
Layout:          [Grid ▼]  or  [List ▼]
Sort By:         [Name ▼]  or  [Price ▼]  or  [Newest ▼]
Items Per Page:  [12] (number input)
```

**SEO Settings** (Optional but Recommended):
```
Meta Title:       "Best Brake Parts | Your Store Name"
Meta Description: "Shop premium brake pads, rotors, and systems..."
```

**Publishing:**
```
☑ Published   (Check to make live immediately)
```

**Action**: Click **"Create Page"** button at bottom

---

### Step 3: Navigate to Menu Items

```
Admin Panel → Menu Items
```

**What you'll see:**
- Tree structure of existing menu items
- Parent/child relationships
- Drag-and-drop interface
- "Add Menu Item" button

**Action**: Click **"Add Menu Item"** button

---

### Step 4: Configure Menu Item

#### Modal Form:

**Menu Label:**
```
Label: *Required*
Example: "Brake Parts"

This is what users will see in the navigation menu
```

**Parent Menu** (Optional for sub-menus):
```
Parent Menu Item: [Dropdown]
Options:
  • None (Top Level)     ← Creates main menu item
  • Products            ← Creates sub-menu under "Products"
  • └ By Category       ← Creates sub-sub-menu
```

**Link Type** (Radio Buttons):
```
○ Link to Page       ← Connect to a page you created
○ External URL       ← Link to any URL
```

**If "Link to Page" selected:**
```
Select Page: [Dropdown]
Options:
  • Brake Parts Catalog    ← The page you just created
  • Other existing pages...
```

**If "External URL" selected:**
```
External URL: [Text Input]
Examples:
  • /contact
  • /about-us
  • https://external-site.com
```

**Settings:**
```
Position: [2]
(Lower numbers appear first: 0, 1, 2, 3...)

☑ Visible in menu
(Uncheck to hide without deleting)

☐ Open in new tab
(Check for external links)
```

**Action**: Click **"Create"** button

---

### Step 5: Verify and Test

#### Check Menu Structure:
1. Look at the menu tree in admin
2. Verify the item appears in correct position
3. Check parent/child relationships

#### Test on Frontend:
1. Open your website
2. Look at the navigation menu
3. Click the new menu item
4. Verify it opens the correct page with products

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CREATE PAGE                                              │
│ Admin → Pages → New Page                                    │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Title: Brake Parts                                    │   │
│ │ Slug: brake-parts                                     │   │
│ │ Group Type: Tag                                       │   │
│ │ Group Values: { "tags": ["brake"] }                   │   │
│ │ Published: ✓                                          │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│                          ↓                                   │
│                   [Create Page]                             │
└─────────────────────────────────────────────────────────────┘

                            ↓

┌─────────────────────────────────────────────────────────────┐
│ 2. ADD TO MENU                                              │
│ Admin → Menu Items → Add Menu Item                         │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Label: Brake Parts                                    │   │
│ │ Parent: Products                                      │   │
│ │ Link Type: ○ Page ● External                          │   │
│ │ Select Page: Brake Parts ▼                            │   │
│ │ Position: 2                                           │   │
│ │ Visible: ✓   Open New Tab: ☐                         │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│                          ↓                                   │
│                     [Create Item]                           │
└─────────────────────────────────────────────────────────────┘

                            ↓

┌─────────────────────────────────────────────────────────────┐
│ 3. RESULT - FRONTEND MENU                                   │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │  Home | Products ▼ | About | Contact                   │ │
│ │            ├── Brake Parts     ← Your new item          │ │
│ │            ├── Engine Parts                             │ │
│ │            └── Transmission                             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│         Clicking "Brake Parts" opens:                       │
│         https://yoursite.com/brake-parts                    │
│         (Shows products with "brake" tag)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Common Scenarios

### Scenario 1: Top-Level Menu Item
```
Menu Structure:
Home | Products | Brake Parts ← (Top Level)

Configuration:
- Parent: None (Top Level)
- Position: 2
```

### Scenario 2: Sub-Menu Item
```
Menu Structure:
Products ▼
  ├── Brake Parts ← (Sub-menu)
  └── Engine Parts

Configuration:
- Parent: Products
- Position: 0
```

### Scenario 3: Nested Sub-Menu
```
Menu Structure:
Products ▼
  └── By Category ▼
      ├── Brake Parts ← (Nested sub-menu)
      └── Engine Parts

Configuration:
- Parent: By Category
- Position: 0
```

---

## Tips & Best Practices

### 💡 Page Creation Tips:
1. **Use descriptive titles**: Make it clear what products the page shows
2. **SEO-friendly slugs**: Use hyphens, lowercase, no special characters
3. **Test product filters**: Preview page before publishing
4. **Add meta descriptions**: Helps with search engine rankings
5. **Start as draft**: Create and test, then publish when ready

### 💡 Menu Item Tips:
1. **Keep labels short**: 1-3 words is ideal for navigation
2. **Use logical ordering**: Most important items first (lower position numbers)
3. **Limit menu depth**: 2-3 levels maximum for usability
4. **Group related items**: Use parent/child relationships
5. **Test on mobile**: Ensure menu works on small screens

### 💡 Product Group Tips:
1. **Start simple**: Use single filter first, then add more
2. **Combine filters**: Mix tags + brands + price for precision
3. **Monitor results**: Check how many products match your criteria
4. **Update regularly**: Products change, so adjust filters
5. **Use collections**: For curated, hand-picked product sets

---

## Troubleshooting

### ❌ Menu item not showing
```
Check:
□ Is it marked as "Visible"?
□ Is the position number correct?
□ Is the page published?
□ Refresh the website cache
```

### ❌ Page shows no products
```
Check:
□ Are the products published?
□ Do products have the tags/categories you specified?
□ Is the JSON in Group Values valid?
□ Are there products matching all filters?
```

### ❌ Can't delete page
```
Error: "Page is linked to menu items"

Solution:
1. Go to Menu Items
2. Find items linking to this page
3. Edit or delete those menu items first
4. Then delete the page
```

---

## Next Steps

Once you've created pages and menu items:

1. **Create more pages** for different product groups
2. **Organize menu structure** with logical hierarchy
3. **Test user experience** by navigating through menus
4. **Add more menu items** for collections, categories, etc.
5. **Monitor page performance** and adjust product filters
6. **Update menu regularly** based on inventory and seasons

---

## Need Help?

### Additional Resources:
- Full Documentation: `/docs/05-Features/Menu-Items-And-Pages-System-Guide.md`
- API Reference: Check the guide for endpoint details
- Admin Panel: Built-in help tooltips and validation

### Common Questions:
**Q: Can I have multiple menu items link to the same page?**  
A: Yes! Multiple menu items can point to the same page.

**Q: What happens if I delete a page?**  
A: System prevents deletion if menu items link to it.

**Q: Can I reorder menu items?**  
A: Yes! Use drag-and-drop in the Menu Items page.

**Q: How many levels of sub-menus can I create?**  
A: Technically unlimited, but 2-3 levels recommended for UX.

**Q: Can I hide menu items temporarily?**  
A: Yes! Uncheck "Visible in menu" instead of deleting.
