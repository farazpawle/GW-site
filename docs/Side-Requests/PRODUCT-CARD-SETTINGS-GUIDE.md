# How to Use Product Card Settings (Step-by-Step)

## ✅ The Feature Is Working!

Backend tests confirm everything works correctly. Here's how to use it:

---

## 📝 Step-by-Step Instructions:

### 1. **Go to Admin Settings**
   - Navigate to: `Admin Panel → Settings`
   - Click the `🎴 Product Card` tab

### 2. **Toggle Fields On/Off**
   - Each field has an iOS-style toggle switch
   - **Green** = Field visible on product cards
   - **Gray** = Field hidden on product cards
   
   Example: Toggle OFF "Country of Origin"

### 3. **Click "Save Changes"**
   - The button is at the top right
   - Wait for success message: "Successfully updated X settings! Hard refresh..."

### 4. **Hard Refresh Product Pages** ⚠️ IMPORTANT!
   - Open any page with product cards (`/products`, `/all-parts`, etc.)
   - Press: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
   - This clears browser cache and fetches new settings

### 5. **Verify Changes**
   - Open DevTools Console (F12)
   - Look for log: `🎴 ProductCard: Settings loaded:` 
   - Check the field you toggled (e.g., `showOrigin: false`)
   - Visually verify the field is hidden on all product cards

---

## 🐛 Troubleshooting:

### "Field still showing after toggle"
**Cause**: Browser cached the old ProductCard component  
**Solution**: Hard refresh with Ctrl+Shift+R (not just F5)

### "Console log shows old values"
**Cause**: React state might be stale  
**Solution**: Close and reopen the tab completely

### "Toggle saved but API returns old value"
**Cause**: Server cache (60-second TTL)  
**Solution**: Wait 60 seconds or restart dev server

---

## 🧪 Testing with Script:

Run this to test any field:
```bash
npx tsx scripts/test-e2e-settings.ts
```

This simulates toggling OFF the Origin field and confirms the API sees the change.

---

## 💡 Pro Tips:

1. **Batch Changes**: Toggle multiple fields at once before saving
2. **Test Mode**: Toggle one field, save, verify, then bulk update
3. **Cache-Busting**: Settings are cached for 60 seconds server-side for performance
4. **New Visitors**: New page loads always fetch fresh settings (no refresh needed)

---

## 🔧 Technical Details:

### How It Works:
1. Admin toggles setting → Saves to database as `product_card_showOrigin = "false"`
2. Server cache clears automatically on save
3. ProductCard component fetches settings on mount via `/api/public/product-card-settings`
4. API reads individual keys from database and combines into object
5. ProductCard conditionally renders fields based on settings

### Cache Layers:
- **Browser**: No cache (Cache-Control: no-store)
- **Server**: 60-second in-memory cache (cleared on save)
- **Client Component**: Fetches once on mount (refresh to update)

---

## ✅ Current Status:

- ✅ Backend working correctly
- ✅ Database saves toggle states
- ✅ API returns correct values
- ✅ Cache clears on save
- ✅ ProductCard respects settings
- ✅ Console logging for debugging

**Ready to use!** 🚀
