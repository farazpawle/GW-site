# Phase 12: Search & Filtering System

**Status:** Not Started  
**Priority:** 🔴 HIGH  
**Estimated Time:** 4-6 hours  
**Dependencies:** Phase 3, 4, 4.5 Complete ✅

---

## 📋 Overview

Implement a comprehensive search and filtering system for the Garrit Wulf auto parts website. The current search bar in the navigation is non-functional and needs a complete backend and frontend implementation.

### Goals

- ✅ Enable users to search for products by name, part number, description, tags, brand, compatibility
- ✅ Provide advanced filtering options (price range, category, brand, origin, tags)
- ✅ Implement instant search with debouncing for better UX
- ✅ Add search suggestions/autocomplete
- ✅ Display relevant search results with highlighting
- ✅ Track search analytics for business insights
- ✅ Ensure mobile-responsive design
- ✅ Optimize database queries for fast search performance

---

## 🎯 What Will Be Built

### 1. **Global Search**
- Search across products (Parts), categories, collections, and blog posts
- Multi-field search (name, description, part number, tags, brand, compatibility)
- Real-time search with debouncing (300ms delay)
- Search history tracking (last 5 searches per user)

### 2. **Advanced Filtering**
- Price range slider
- Category multi-select
- Brand checkbox filters
- Origin filters
- Tag-based filtering
- Stock availability toggle
- Featured products toggle

### 3. **Search Suggestions**
- Autocomplete dropdown (top 5 results)
- Popular searches section
- Recent searches (stored in localStorage)
- "Did you mean?" suggestions for typos

### 4. **Search Results Page**
- Dedicated `/search` page with results grid
- Result count display
- Sorting options (relevance, price, name, newest)
- Pagination (12 items per page)
- Loading states with skeleton UI
- Empty state with helpful suggestions

### 5. **Search Analytics** (Admin)
- Track popular search terms
- Monitor search-to-conversion rate
- Identify searches with no results
- Admin dashboard widget for search insights

---

## 🏗️ Technical Architecture

### Frontend Components

```
src/components/search/
├── SearchBar.tsx              # Main search input (Navigation)
├── SearchOverlay.tsx          # Full-screen search modal
├── SearchSuggestions.tsx      # Autocomplete dropdown
├── SearchFilters.tsx          # Filter sidebar component
├── SearchResults.tsx          # Results grid display
├── SearchEmptyState.tsx       # No results UI
└── SearchSkeleton.tsx         # Loading skeleton
```

### Backend API Routes

```
src/app/api/search/
├── route.ts                   # Main search API (GET)
├── suggestions/route.ts       # Autocomplete API (GET)
├── analytics/route.ts         # Track search events (POST)
└── popular/route.ts           # Get popular searches (GET)
```

### Pages

```
src/app/search/
├── page.tsx                   # Search results page (Server Component)
└── loading.tsx                # Loading state
```

### Database

```prisma
// New models to add to schema.prisma

model SearchQuery {
  id          String   @id @default(cuid())
  query       String
  filters     Json?    // Stored filters applied
  resultsCount Int
  userId      String?  // Optional: track by user
  createdAt   DateTime @default(now())

  @@index([query])
  @@index([createdAt])
  @@map("search_queries")
}

model SearchAnalytics {
  id          String   @id @default(cuid())
  term        String
  count       Int      @default(1)
  lastSearched DateTime @default(now())

  @@unique([term])
  @@index([count])
  @@map("search_analytics")
}
```

---

## 🔍 Search Implementation Strategy

### 1. **Database Query Optimization**

Use Prisma's `contains` with case-insensitive search for basic implementation:

```typescript
// Basic search query
const results = await prisma.part.findMany({
  where: {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { partNumber: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { tags: { hasSome: [query] } },
      { brand: { contains: query, mode: 'insensitive' } },
      { compatibility: { hasSome: [query] } },
    ],
    published: true,
  },
  include: {
    category: true,
  },
  take: 12,
  skip: (page - 1) * 12,
})
```

### 2. **Advanced: PostgreSQL Full-Text Search** (Optional Enhancement)

For better performance with large datasets:

```sql
-- Add full-text search index
CREATE INDEX parts_search_idx ON parts 
USING gin(to_tsvector('english', name || ' ' || description || ' ' || part_number));
```

```typescript
// Using raw SQL for full-text search
const results = await prisma.$queryRaw`
  SELECT * FROM parts
  WHERE to_tsvector('english', name || ' ' || description || ' ' || part_number) 
  @@ plainto_tsquery('english', ${query})
  AND published = true
  LIMIT 12
  OFFSET ${(page - 1) * 12}
`
```

### 3. **Filtering Strategy**

```typescript
const filters = {
  categoryId: categoryIds?.length ? { in: categoryIds } : undefined,
  brand: brands?.length ? { in: brands } : undefined,
  origin: origins?.length ? { in: origins } : undefined,
  tags: tags?.length ? { hasSome: tags } : undefined,
  price: {
    gte: minPrice || undefined,
    lte: maxPrice || undefined,
  },
  featured: featuredOnly ? true : undefined,
}
```

### 4. **Search Debouncing** (Client-Side)

```typescript
import { useState, useEffect } from 'react'
import { useDebounce } from '@/lib/hooks/useDebounce'

const [searchQuery, setSearchQuery] = useState('')
const debouncedQuery = useDebounce(searchQuery, 300)

useEffect(() => {
  if (debouncedQuery) {
    fetchSuggestions(debouncedQuery)
  }
}, [debouncedQuery])
```

---

## 📝 Task Breakdown

### Task 1: Database Schema Updates
**Time:** 20 minutes

**Files to Create:**
- `prisma/migrations/XXX_add_search_models.sql`

**What to Do:**
1. Add `SearchQuery` model to track search queries
2. Add `SearchAnalytics` model to track popular searches
3. Run migration: `npx prisma migrate dev --name add_search_models`
4. Generate Prisma client: `npx prisma generate`

**Acceptance Criteria:**
- ✅ Migration runs successfully
- ✅ New tables appear in database
- ✅ Prisma client generates without errors

---

### Task 2: Search API Endpoint
**Time:** 45 minutes

**Files to Create:**
- `src/app/api/search/route.ts` (150 lines)

**What to Do:**
1. Create GET endpoint that accepts `query`, `page`, `categoryId[]`, `brand[]`, `minPrice`, `maxPrice`, `tags[]`
2. Build dynamic Prisma query with all filters
3. Return results with metadata (totalCount, currentPage, totalPages)
4. Log search query to `SearchQuery` model
5. Update `SearchAnalytics` aggregation

**API Response Format:**
```json
{
  "results": [
    {
      "id": "...",
      "name": "...",
      "slug": "...",
      "price": 150.00,
      "images": ["..."],
      "category": { "name": "..." }
    }
  ],
  "metadata": {
    "totalCount": 45,
    "currentPage": 1,
    "totalPages": 4,
    "itemsPerPage": 12
  }
}
```

**Acceptance Criteria:**
- ✅ API returns correct search results
- ✅ Filters work individually and combined
- ✅ Pagination works correctly
- ✅ Search queries are logged to database
- ✅ Returns empty array for no results

---

### Task 3: Search Suggestions API
**Time:** 30 minutes

**Files to Create:**
- `src/app/api/search/suggestions/route.ts` (80 lines)

**What to Do:**
1. Create GET endpoint that accepts `q` (query parameter)
2. Return top 5 matching products (name + part number)
3. Return top 3 matching categories
4. Include result type indicator
5. Optimize for speed (use `take: 5`, only fetch necessary fields)

**API Response Format:**
```json
{
  "products": [
    { "id": "...", "name": "...", "partNumber": "...", "image": "..." }
  ],
  "categories": [
    { "id": "...", "name": "...", "slug": "..." }
  ]
}
```

**Acceptance Criteria:**
- ✅ Returns suggestions in < 200ms
- ✅ Limits to top 5 products + 3 categories
- ✅ Returns empty array for no matches
- ✅ Handles special characters safely

---

### Task 4: Search Results Page
**Time:** 60 minutes

**Files to Create:**
- `src/app/search/page.tsx` (250 lines)
- `src/app/search/loading.tsx` (30 lines)

**What to Do:**
1. Create Server Component page that reads `searchParams`
2. Fetch search results server-side using API
3. Display results in responsive grid (3 columns desktop, 2 tablet, 1 mobile)
4. Add sorting dropdown (relevance, price-asc, price-desc, name-asc, newest)
5. Add pagination controls
6. Show total results count
7. Handle empty state with suggestions
8. Add loading skeleton UI in `loading.tsx`

**URL Format:**
```
/search?q=brake+pads&category=abc123&minPrice=50&maxPrice=200&page=2&sort=price-asc
```

**Acceptance Criteria:**
- ✅ Search results display correctly
- ✅ Pagination works and updates URL
- ✅ Sorting updates results without full page reload
- ✅ Loading state shows while fetching
- ✅ Empty state shows helpful message
- ✅ Mobile responsive layout

---

### Task 5: Update SearchBar Component
**Time:** 45 minutes

**Files to Modify:**
- `src/components/ui/Navigation.tsx`

**Files to Create:**
- `src/components/search/SearchBar.tsx` (180 lines)
- `src/components/search/SearchSuggestions.tsx` (120 lines)

**What to Do:**
1. Extract search UI from `Navigation.tsx` into `SearchBar.tsx` (Client Component)
2. Implement Form submission to `/search` page
3. Add debounced autocomplete (300ms delay)
4. Fetch suggestions from API on input change
5. Show suggestions dropdown with keyboard navigation (Arrow Up/Down, Enter)
6. Store last 5 searches in localStorage
7. Display recent searches when input is focused (empty query)
8. Add "Clear History" button

**Acceptance Criteria:**
- ✅ Search form submits to `/search` page with query
- ✅ Autocomplete shows after typing 2+ characters
- ✅ Suggestions are debounced (300ms)
- ✅ Keyboard navigation works (Arrow keys + Enter)
- ✅ Recent searches persist in localStorage
- ✅ Clicking suggestion navigates to product/search
- ✅ ESC key closes suggestions dropdown

---

### Task 6: Advanced Filters Component
**Time:** 60 minutes

**Files to Create:**
- `src/components/search/SearchFilters.tsx` (300 lines)

**What to Do:**
1. Create filter sidebar component (Client Component)
2. Add category multi-select (checkboxes)
3. Add brand multi-select (checkboxes with search)
4. Add price range slider (use `rc-slider` or native input range)
5. Add tag filter (checkboxes)
6. Add origin filter (checkboxes)
7. Add "Featured Only" toggle
8. Add "Clear All Filters" button
9. Sync filters with URL search params
10. Show active filter count badge

**URL Sync Example:**
```
/search?q=brake&category=abc,def&brand=Bosch&minPrice=50&maxPrice=200
```

**Acceptance Criteria:**
- ✅ All filters update URL params
- ✅ URL params populate filter state on page load
- ✅ "Clear All" resets filters and URL
- ✅ Filter count badge shows active filters
- ✅ Filters apply immediately (no "Apply" button needed)
- ✅ Mobile: Filters in collapsible drawer
- ✅ Desktop: Fixed sidebar

---

### Task 7: Search Analytics Dashboard Widget
**Time:** 40 minutes

**Files to Create:**
- `src/app/api/search/analytics/route.ts` (100 lines)
- `src/components/admin/analytics/SearchAnalytics.tsx` (150 lines)

**Files to Modify:**
- `src/app/admin/page.tsx` (add widget)

**What to Do:**
1. Create API to fetch top 10 search terms with counts
2. Create API to fetch "no results" searches
3. Build admin widget showing:
   - Total searches this week
   - Top 10 search terms (bar chart)
   - Recent searches with no results (table)
4. Add to admin dashboard

**Acceptance Criteria:**
- ✅ API returns search analytics data
- ✅ Widget displays on admin dashboard
- ✅ Top searches shown in descending order
- ✅ "No results" searches highlighted for action
- ✅ Data refreshes on page load

---

### Task 8: Search Utility Functions
**Time:** 30 minutes

**Files to Create:**
- `src/lib/search/utils.ts` (150 lines)
- `src/lib/search/filters.ts` (100 lines)

**What to Do:**
1. Create `buildSearchQuery()` helper for Prisma queries
2. Create `parseSearchParams()` to normalize URL params
3. Create `highlightSearchTerm()` for result highlighting
4. Create `sanitizeSearchInput()` for XSS protection
5. Create `saveRecentSearch()` / `getRecentSearches()` for localStorage
6. Create `getSuggestedSearches()` for "Did you mean?" feature

**Acceptance Criteria:**
- ✅ All helper functions work correctly
- ✅ Input sanitization prevents XSS
- ✅ localStorage functions handle errors gracefully
- ✅ Functions are typed with TypeScript

---

### Task 9: Empty State & Error Handling
**Time:** 30 minutes

**Files to Create:**
- `src/components/search/SearchEmptyState.tsx` (120 lines)
- `src/components/search/SearchErrorState.tsx` (80 lines)

**What to Do:**
1. Create empty state component with:
   - "No results found" message
   - Suggestions to adjust filters
   - Popular searches
   - Link to browse all products
2. Create error state for API failures
3. Add to search results page with conditional rendering

**Acceptance Criteria:**
- ✅ Empty state shows when no results
- ✅ Error state shows on API failure
- ✅ Helpful suggestions provided
- ✅ Links work correctly

---

### Task 10: Mobile Optimization & Testing
**Time:** 45 minutes

**Files to Modify:**
- All search-related components

**What to Do:**
1. Test search on mobile devices (responsive design)
2. Optimize filter drawer for mobile (slide-in from bottom)
3. Ensure touch targets are 44x44px minimum
4. Test keyboard behavior on mobile browsers
5. Add loading states for slow connections
6. Test with 1000+ products for performance
7. Add error boundaries for graceful failures

**Acceptance Criteria:**
- ✅ Search works on mobile browsers (iOS Safari, Android Chrome)
- ✅ Filters accessible via drawer on mobile
- ✅ Touch targets meet accessibility guidelines
- ✅ No layout shift during loading
- ✅ Performance acceptable with large datasets
- ✅ Errors don't crash the app

---

## 🎨 UI/UX Design Guidelines

### Search Bar (Navigation)
```
┌────────────────────────────────────────┐
│ [🔍] Search for auto parts...      [X] │
└────────────────────────────────────────┘
```

### Search Suggestions Dropdown
```
┌────────────────────────────────────────┐
│ [🔍] brake pads                        │
├────────────────────────────────────────┤
│ Products (3)                           │
│ • Ceramic Brake Pads - $85.00         │
│ • Performance Brake Kit - $150.00     │
│ • OEM Brake Discs - $120.00           │
│                                        │
│ Categories (1)                         │
│ • Brake Systems                        │
│                                        │
│ Recent Searches                        │
│ • oil filters                          │
│ • headlight bulbs                      │
│ [Clear History]                        │
└────────────────────────────────────────┘
```

### Search Results Page Layout
```
┌─────────────────────────────────────────────────────┐
│  [🔍] brake pads                                    │
│                                                     │
│  ┌──────────┐  48 results for "brake pads"         │
│  │          │  Sort by: [Relevance ▼]              │
│  │ FILTERS  │                                       │
│  │          │  ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ Category │  │ [📷] │ │ [📷] │ │ [📷] │          │
│  │ □ Brakes │  │$85.00│ │$95.00│ │$120 │          │
│  │ □ Engine │  └──────┘ └──────┘ └──────┘          │
│  │          │  ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ Price    │  │ [📷] │ │ [📷] │ │ [📷] │          │
│  │ ▬▬●══════│  │$150  │ │$200  │ │$85   │          │
│  │ $0  $500 │  └──────┘ └──────┘ └──────┘          │
│  │          │                                       │
│  │ Brand    │  [1] [2] [3] [4] [Next]              │
│  │ □ Bosch  │                                       │
│  │ □ OEM    │                                       │
│  └──────────┘                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Requirements

### Unit Tests
- `buildSearchQuery()` generates correct Prisma queries
- `parseSearchParams()` normalizes URL params correctly
- `sanitizeSearchInput()` prevents XSS attacks
- `highlightSearchTerm()` highlights matches correctly

### Integration Tests
- Search API returns correct results for various queries
- Filters combine correctly (category + price + brand)
- Pagination works across multiple pages
- Analytics tracking records searches correctly

### E2E Tests (Playwright)
```typescript
test('Search flow', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="search-button"]')
  await page.fill('input[name="query"]', 'brake pads')
  await page.press('input[name="query"]', 'Enter')
  await expect(page).toHaveURL(/\/search\?q=brake\+pads/)
  await expect(page.locator('.search-result')).toHaveCount.greaterThan(0)
})
```

---

## 🚀 Performance Optimization

### Database Indexes
```sql
-- Add indexes for fast search
CREATE INDEX idx_parts_name ON parts(name);
CREATE INDEX idx_parts_part_number ON parts(part_number);
CREATE INDEX idx_parts_brand ON parts(brand);
CREATE INDEX idx_parts_published ON parts(published);

-- Composite index for filtered searches
CREATE INDEX idx_parts_search ON parts(published, category_id, price);
```

### API Response Caching
```typescript
// Cache popular searches for 5 minutes
export const revalidate = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  // Cache key based on query + filters
  const cacheKey = `search:${query}:${JSON.stringify(filters)}`
  
  // Check cache first (using Redis or node-cache)
  // ...
}
```

### Client-Side Optimization
- Debounce autocomplete requests (300ms)
- Use React.memo() for filter components
- Lazy load images in search results
- Implement virtual scrolling for large result sets (future)

---

## 📦 Dependencies to Install

```bash
npm install --save \
  @tanstack/react-query \    # For client-side data fetching
  use-debounce \              # Debouncing utility
  rc-slider \                 # Price range slider
  react-intersection-observer # Lazy loading images
```

---

## 🔮 Future Enhancements

### Phase 12.1: Advanced Search (Optional)
- Voice search integration (Web Speech API)
- Image search (upload part photo, find similar)
- Barcode/QR scanner for part numbers
- "Search by vehicle" (year, make, model)

### Phase 12.2: AI-Powered Search (Optional)
- Natural language queries ("best brake pads for 2015 Honda Accord")
- Semantic search using embeddings
- ML-based search ranking
- Personalized search results

### Phase 12.3: Third-Party Search (Optional)
- Integrate Algolia for blazing-fast search
- Implement Elasticsearch for advanced features
- Add Typesense as open-source alternative

---

## ✅ Acceptance Criteria

### Phase Complete When:
- ✅ Users can search for products from navigation bar
- ✅ Search results display on `/search` page with filtering
- ✅ Autocomplete suggestions appear while typing
- ✅ Recent searches are stored and displayed
- ✅ Advanced filters work (category, price, brand, tags)
- ✅ Search analytics track popular terms
- ✅ Admin dashboard shows search insights
- ✅ Mobile-responsive design works perfectly
- ✅ No performance issues with 1000+ products
- ✅ All tests pass
- ✅ No console errors or warnings

---

## 📚 Resources

### Documentation
- [Next.js Form Component](https://nextjs.org/docs/app/api-reference/components/form)
- [Prisma Full-Text Search](https://www.prisma.io/docs/concepts/components/prisma-client/full-text-search)
- [PostgreSQL Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [React Hook Form](https://react-hook-form.com/)

### Libraries
- [use-debounce](https://github.com/xnimorz/use-debounce)
- [rc-slider](https://github.com/react-component/slider)
- [@tanstack/react-query](https://tanstack.com/query/latest)

---

## 🎯 Success Metrics

After Phase 12 completion, measure:
- **Search Usage:** Track searches per day
- **Search Success Rate:** % of searches with results
- **Top Search Terms:** Identify popular products
- **Filter Usage:** Which filters are used most
- **Search-to-View Rate:** % of searches leading to product views
- **Performance:** Search response time < 200ms

---

**Ready to Start?**

Begin with **Task 1: Database Schema Updates** to add search tracking models to the database.

🚀 **Let's make search work!**
