# Fix Search Functionality Issue

## Problem
Prisma client generation is failing with EPERM (permission error) on Windows, preventing the search API from accessing the SearchQuery and SearchAnalytics models.

## Solution Steps

### Step 1: Stop All Running Processes
```powershell
# Close all terminal windows running npm/dev servers
# Or press Ctrl+C in any terminal running the dev server
```

### Step 2: Kill Node.js Processes
```powershell
# Open PowerShell as Administrator and run:
taskkill /F /IM node.exe
```

### Step 3: Clean and Regenerate Prisma Client
```powershell
# Delete the existing Prisma client
Remove-Item -Recurse -Force node_modules\.prisma

# Regenerate Prisma client
npx prisma generate
```

### Step 4: Run Database Migrations (if needed)
```powershell
# Ensure the search models exist in the database
npx prisma migrate dev
```

### Step 5: Restart Development Server
```powershell
npm run dev
```

## Testing the Fix

### 1. Test Search Bar
- Go to the homepage
- Click the search icon in the navigation
- Type at least 2 characters (e.g., "brake")
- You should see autocomplete suggestions appear

### 2. Test Search Results Page
- Perform a search
- You should be redirected to `/search?q=<your-query>`
- Results should display in a grid layout
- Filters should appear on the left sidebar (desktop)

### 3. Test Search API Directly
Open browser console and run:
```javascript
// Test suggestions API
fetch('/api/search/suggestions?q=brake')
  .then(r => r.json())
  .then(console.log)

// Test search API
fetch('/api/search?q=brake')
  .then(r => r.json())
  .then(console.log)
```

## If Issue Persists

### Check Prisma Client Status
```powershell
# Verify Prisma client is generated
dir node_modules\.prisma\client
```

### Check Database Connection
```powershell
# Test database connection
npx prisma studio
```

### Check for Multiple Node Processes
```powershell
# List all Node.js processes
Get-Process node
```

### Alternative: Use the Batch Script
```powershell
# Run the regenerate script
.\regenerate-prisma.bat
```

## Common Errors and Solutions

### Error: "SearchQuery model not found"
**Cause:** Prisma client is outdated
**Solution:** Run `npx prisma generate` again

### Error: "Cannot find module '@prisma/client'"
**Cause:** Prisma client not installed
**Solution:** Run `npm install @prisma/client`

### Error: "Table 'search_queries' does not exist"
**Cause:** Database migration not run
**Solution:** Run `npx prisma migrate dev`

### Error: "EPERM: operation not permitted"
**Cause:** File is locked by another process
**Solution:** 
1. Close all terminals
2. Run `taskkill /F /IM node.exe`
3. Delete `node_modules\.prisma` folder
4. Run `npx prisma generate`

## Expected Behavior After Fix

✅ Search bar shows autocomplete suggestions after typing 2+ characters
✅ Search results page displays products matching the query
✅ Filters work (category, price, brand, tags)
✅ Pagination works on search results
✅ Recent searches are saved in localStorage
✅ Search analytics are logged to database
✅ No console errors in browser or terminal

## Technical Details

### What Was Implemented
- `SearchBar.tsx` - Search input with autocomplete
- `/api/search/route.ts` - Main search API with filtering
- `/api/search/suggestions/route.ts` - Autocomplete API
- `/api/search/analytics/route.ts` - Search analytics tracking
- `/search/page.tsx` - Search results page
- `SearchFilters.tsx` - Advanced filtering component
- Database models: `SearchQuery`, `SearchAnalytics`

### Why It Wasn't Working
The Prisma client generation was failing silently in the background, so the TypeScript types existed but the runtime code couldn't access the database models. This caused the search API to fail when trying to log queries to `SearchQuery` and `SearchAnalytics` tables.

## Need Help?
If the issue persists after following these steps, check:
1. Terminal output for specific error messages
2. Browser console for API errors (F12 → Console)
3. Network tab for failed API requests (F12 → Network)
4. Database connection in Prisma Studio
