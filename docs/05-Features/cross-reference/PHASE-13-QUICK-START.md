# Phase 13 Quick Start Guide

## 🚀 One-Click Setup (RECOMMENDED)

**Double-click this file:**
```
setup-phase13.bat
```

This will:
1. ✅ Stop all Node processes
2. ✅ Regenerate Prisma Client (fixes all TypeScript errors)
3. ✅ Seed dummy data (7 cross-refs + 6 OEM numbers + 16 vehicles)
4. ✅ Start dev server

**Total time: ~30 seconds**

---

## 📊 What Dummy Data Gets Created

The script will populate **the first published product** with:

### Cross-References (7 total):
- **3 Alternative Parts**
  - Bosch 0986AB1234
  - Denso DEN-5678-XYZ
  - NGK NGK-AB-9012

- **2 Superseding Parts**
  - OEM OLD-PART-001
  - OEM OLD-PART-002

- **2 Compatible Parts**
  - ACDelco AC-D1234-56
  - Valeo VAL-789-XYZ

### OEM Part Numbers (6 total):
- Toyota 90919-02260
- Lexus 90919-02268
- Honda 30520-R70-A01
- Nissan 22401-ED000
- BMW 12137594937
- Mercedes-Benz A0041591503

### Vehicle Compatibility (16 total):
- **Toyota**: Camry (2015-2020), Corolla (2014-2019), RAV4 (2016-2021)
- **Honda**: Accord (2018-2023), Civic (2016-2021), CR-V (2017-2022)
- **Nissan**: Altima (2013-2018), Rogue (2014-2020)
- **Ford**: F-150 (2015-2020), Mustang (2015-2023)
- **Chevrolet**: Silverado 1500 (2014-2019), Malibu (2016-2021)
- **BMW**: 3 Series (2012-2018), X5 (2014-2018)
- **Mercedes-Benz**: C-Class (2015-2021), E-Class (2017-2023)

---

## 🔍 Where to Check the Changes

### Admin Panel
1. Go to: `http://localhost:3000/admin/parts`
2. Click **"Edit"** on the first product
3. You'll see **4 tabs** at the top:
   - 📦 Product Info (existing)
   - 🔗 **Cross-References** ← NEW!
   - 🏷️ **OEM Numbers** ← NEW!
   - 🚗 **Vehicle Compatibility** ← NEW!
4. Click each tab to see the dummy data

### Frontend (Customer View)
1. Go to: `http://localhost:3000/products/[product-slug]`
   - Replace `[product-slug]` with your product's slug
   - Example: `http://localhost:3000/products/brake-pad-front`
2. Scroll down past the **"Product Inquiry"** section
3. You should see a new section: **"Technical Information & Compatibility"**
4. This section will show:
   - 🔗 Cross-References (grouped by type with colored cards)
   - 🏷️ OEM Numbers (table with manufacturer and part numbers)
   - 🚗 Vehicle Compatibility (filterable table with make/model/year)

---

## 🐛 Troubleshooting

### Problem: "Prisma generation failed"
**Solution:**
1. Close VS Code completely
2. Open Task Manager
3. End all `node.exe` processes
4. Run `setup-phase13.bat` again

### Problem: "No published products found"
**Solution:**
1. Go to `http://localhost:3000/admin/parts`
2. Create a new product or publish an existing one
3. Run `setup-phase13.bat` again

### Problem: "Cannot find module '@prisma/client'"
**Solution:**
```bash
npm install
```
Then run `setup-phase13.bat` again

### Problem: "I don't see the data on frontend"
**Check:**
1. Make sure you're viewing the **correct product slug**
2. The section only appears if data exists
3. Try the admin panel first to verify data was created

---

## 📝 Manual Steps (If Batch File Doesn't Work)

### Step 1: Stop Dev Server
Press `Ctrl+C` in the terminal running `npm run dev`

### Step 2: Regenerate Prisma Client
```bash
npx prisma generate
```

Wait for: `✔ Generated Prisma Client`

### Step 3: Seed Dummy Data
```bash
npx tsx scripts/seed-cross-reference-data.ts
```

You should see:
```
✅ Created 7 cross-references
✅ Created 6 OEM part numbers
✅ Created 16 vehicle compatibility records
```

### Step 4: Restart Dev Server
```bash
npm run dev
```

---

## 🎨 What Each Component Looks Like

### Cross-References Display
```
┌─────────────────────────────────────┐
│ Alternative Parts                    │
├─────────────────────────────────────┤
│ 🔄 Bosch                            │
│    Part Number: 0986AB1234          │
│    Notes: Direct replacement        │
└─────────────────────────────────────┘
[Blue card with border]

┌─────────────────────────────────────┐
│ Superseding Parts                    │
├─────────────────────────────────────┤
│ ⬆️ OEM                              │
│    Part Number: OLD-PART-001        │
│    Notes: Supersedes previous gen   │
└─────────────────────────────────────┘
[Green card with border]

┌─────────────────────────────────────┐
│ Compatible Parts                     │
├─────────────────────────────────────┤
│ ✓ ACDelco                           │
│    Part Number: AC-D1234-56         │
│    Notes: Compatible with mods      │
└─────────────────────────────────────┘
[Purple card with border]
```

### OEM Numbers Table
```
┌──────────────────┬──────────────────┬──────────────────┐
│ Manufacturer     │ OEM Part Number  │ Notes            │
├──────────────────┼──────────────────┼──────────────────┤
│ 🏷️ BMW          │ 12137594937      │ BMW genuine part │
│ 🏷️ Honda        │ 30520-R70-A01    │ Honda cross-comp │
│ 🏷️ Lexus        │ 90919-02268      │ Lexus equivalent │
│ 🏷️ Mercedes-Benz│ A0041591503      │ Mercedes OE      │
│ 🏷️ Nissan       │ 22401-ED000      │ Nissan OEM spec  │
│ 🏷️ Toyota       │ 90919-02260      │ Original Toyota  │
└──────────────────┴──────────────────┴──────────────────┘
```

### Vehicle Compatibility Table
```
Filters:
[Filter by Make ▼] [Filter by Model ▼] [Reset Filters]

┌──────────┬──────────┬─────────────┬──────────────────┐
│ Make     │ Model    │ Year Range  │ Engine           │
├──────────┼──────────┼─────────────┼──────────────────┤
│ 🚗 BMW   │ 3 Series │ 2012 - 2018 │ 2.0L Turbo      │
│ 🚗 BMW   │ X5       │ 2014 - 2018 │ 3.0L Turbo      │
│ 🚗 Chev… │ Malibu   │ 2016 - 2021 │ 1.5L Turbo      │
│ ...      │ ...      │ ...         │ ...              │
└──────────┴──────────┴─────────────┴──────────────────┘

[Previous] Page 1 of 2 [Next]
```

---

## ✅ Success Checklist

After running the setup script, verify:

- [ ] No TypeScript errors in VS Code
- [ ] Dev server starts without errors
- [ ] Admin panel shows 4 tabs in product edit page
- [ ] Cross-References tab shows 7 entries
- [ ] OEM Numbers tab shows 6 entries
- [ ] Vehicle Compatibility tab shows 16 entries
- [ ] Frontend product page shows "Technical Information & Compatibility" section
- [ ] Cross-references display with colored cards
- [ ] OEM numbers show in table format
- [ ] Vehicle compatibility has working filters

---

## 🎯 Next Steps After Verification

Once you confirm everything works:

1. **Test Admin CRUD Operations**:
   - Add a new cross-reference
   - Edit an existing OEM number
   - Delete a vehicle compatibility entry

2. **Test Frontend Filters**:
   - Filter vehicles by "Toyota"
   - Filter by "Camry"
   - Reset filters

3. **Test Responsiveness**:
   - Resize browser to mobile width
   - Check horizontal scrolling on tables

4. **Add Real Data**:
   - Replace dummy data with actual product information
   - Or keep dummy data for demo purposes

---

## 📞 Still Having Issues?

If the setup doesn't work:

1. Check the terminal output for specific errors
2. Make sure you have a published product in the database
3. Verify Node.js and npm are installed correctly
4. Try restarting your computer (Windows file locks can be persistent)

---

**Last Updated:** October 15, 2025  
**Phase 13 Status:** 100% Complete ✅
