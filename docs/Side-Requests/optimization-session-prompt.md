# Website Optimization Session - Prompt for Next Session

**Date Created:** October 9, 2025  
**Current Status:** Website is functional but needs optimization for reduced weight and resource consumption

---

## 🎯 Session Objective

**"I want to optimize my Garrit Wulf automotive parts website to be lightweight and consume fewer resources. Based on the previous analysis, please help me implement the following optimizations:"**

---

## 📋 Optimization Tasks Checklist

### **Phase 1: Immediate Impact Optimizations** (High Priority)

#### 1. Fix Build Errors for Production
```
Task: Fix all ESLint errors preventing production build
Priority: HIGH
Current Status: Build fails due to ~150+ ESLint errors

Issues to fix:
- React escaped entities (apostrophes, quotes in JSX)
- Replace <a> tags with Next.js <Link> components
- Replace <img> tags with Next.js <Image> components
- Fix TypeScript 'any' types
- Remove unused variables
- Add 'use const' where needed

Command to test: npm run build
Expected outcome: Clean production build with bundle size report
```

#### 2. Optimize Icon Library (Lucide React)
```
Task: Implement tree-shaking for lucide-react icons
Current: Importing entire library (~34 MB)
Target: Only import used icons (~2-3 MB)

Changes needed:
- Find all lucide-react imports across the project
- Replace named imports with individual icon imports
- Example:
  Before: import { Search, Filter, Loader2 } from 'lucide-react'
  After:  import Search from 'lucide-react/dist/esm/icons/search'

Estimated savings: 25-30 MB in dependencies
```

#### 3. Add Bundle Analyzer
```
Task: Install and configure bundle analyzer to identify bloat
Commands:
  npm install -D @next/bundle-analyzer
  
Update next.config.ts:
  import bundleAnalyzer from '@next/bundle-analyzer'
  const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
  export default withBundleAnalyzer(nextConfig)

Run analysis: ANALYZE=true npm run build
Expected: Visual report of bundle sizes and optimization opportunities
```

#### 4. Implement Dynamic Imports (Code Splitting)
```
Task: Lazy load heavy components to reduce initial bundle
Target components:
- Admin dashboard components
- Product image galleries
- Rich text editors
- Chart/analytics components
- Modal dialogs

Example:
  const ProductForm = dynamic(() => import('@/components/admin/parts/ProductForm'), {
    loading: () => <Loader2 className="animate-spin" />
  })

Expected: Reduce initial JS bundle by 30-40%
```

---

### **Phase 2: Database & API Optimizations** (Medium Priority)

#### 5. Implement Query Optimization
```
Task: Add database query caching and optimization

Actions:
- Add indexes for frequently queried fields
- Implement pagination for all list endpoints
- Add select() to Prisma queries to fetch only needed fields
- Use include strategically (avoid over-fetching relations)

Example optimization:
  // Before: Fetches all fields
  const products = await prisma.part.findMany()
  
  // After: Selective fields
  const products = await prisma.part.findMany({
    select: { id: true, name: true, price: true, images: true },
    take: 20, // Pagination
    skip: (page - 1) * 20
  })

Expected: 50-70% reduction in API response sizes
```

#### 6. Add API Response Caching
```
Task: Implement Redis or in-memory caching for API responses

Strategy:
- Cache product listings (5-10 min TTL)
- Cache category data (30 min TTL)
- Cache site settings (1 hour TTL)
- Cache navigation menu (1 hour TTL)
- Invalidate cache on data updates

Tools: Redis or Next.js built-in cache
Expected: 60-80% reduction in database queries
```

#### 7. Implement ISR (Incremental Static Regeneration)
```
Task: Enable ISR for product pages and listings

Add to pages:
  // app/(public)/products/page.tsx
  export const revalidate = 3600 // Revalidate every hour
  
  // app/(public)/products/[slug]/page.tsx
  export const revalidate = 1800 // Revalidate every 30 min

Benefits:
- Faster page loads (served from cache)
- Reduced server load
- Better SEO (pre-rendered pages)

Expected: 70-90% faster page loads for returning visitors
```

---

### **Phase 3: Asset Optimizations** (Medium Priority)

#### 8. Optimize All Images
```
Task: Convert all images to modern formats and optimize sizes

Actions:
- Convert PNG/JPG to WebP/AVIF
- Implement responsive images with srcset
- Add blur placeholders for better UX
- Compress images (target: 50-70% size reduction)
- Use CDN for image delivery

Tools: 
- sharp (already available in Next.js)
- ImageMagick or Squoosh for batch conversion
- Cloudinary or Vercel for CDN

Command to add to Image components:
  <Image 
    src={...} 
    placeholder="blur"
    blurDataURL={...}
    quality={80}
    formats={['webp', 'avif']}
  />

Expected: 60-80% reduction in image file sizes
```

#### 9. Implement Font Optimization
```
Task: Optimize font loading and reduce font file sizes

Current: Loading Google Fonts via external link
Target: Self-host and subset fonts

Actions:
- Download Oswald and Aclonica fonts
- Subset fonts (include only used characters)
- Use font-display: swap
- Implement next/font for automatic optimization

Example:
  import { Oswald } from 'next/font/google'
  const oswald = Oswald({ 
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-oswald'
  })

Expected: 40-60% reduction in font file sizes
```

#### 10. Minify and Compress CSS
```
Task: Further optimize CSS delivery

Actions:
- Remove unused Tailwind classes (already done by default)
- Enable CSS minification in production
- Add brotli/gzip compression
- Inline critical CSS

Add to next.config.ts:
  compress: true,
  productionBrowserSourceMaps: false,
  
Expected: 30-50% reduction in CSS file size
```

---

### **Phase 4: Remove Unused Dependencies** (Low-Medium Priority)

#### 11. Audit and Remove Unused Packages
```
Task: Remove unnecessary dependencies

Commands to run:
  npm install -g depcheck
  depcheck
  
  npm install -g npm-check
  npm-check -u

Potential candidates for removal:
- Check if 'effect' package (25 MB) is fully utilized
- Review if 'next-auth' (listed but might be unused, using Clerk)
- Check for duplicate dependencies
- Remove dev dependencies from production

Expected: 50-100 MB reduction in node_modules
```

#### 12. Replace Heavy Libraries
```
Task: Replace heavy dependencies with lighter alternatives

Review these replacements:
- framer-motion (12 MB) → CSS animations or lighter animation lib
- Consider if all Clerk features are needed → Maybe use lighter auth
- Check if all Prisma features are used → Maybe use lighter ORM

Expected: Variable savings depending on replacements
```

---

### **Phase 5: Performance Monitoring** (Ongoing)

#### 13. Add Performance Monitoring
```
Task: Implement performance tracking

Tools to add:
- Vercel Analytics (built-in if using Vercel)
- Google Lighthouse CI
- Web Vitals reporting
- Custom performance metrics

Add to app/layout.tsx:
  import { Analytics } from '@vercel/analytics/react'
  export default function RootLayout() {
    return (
      <>
        <Analytics />
        {children}
      </>
    )
  }
```

#### 14. Set Up Performance Budgets
```
Task: Define and enforce performance budgets

Create performance-budget.json:
{
  "budgets": [
    { "path": "/**", "maxSize": "300kb", "type": "total" },
    { "path": "/**", "maxSize": "150kb", "type": "script" },
    { "path": "/**", "maxSize": "50kb", "type": "stylesheet" }
  ]
}

Add to CI/CD pipeline to fail builds exceeding budgets
```

---

## 🎯 Expected Overall Impact

### Before Optimization:
```
Total Size:              788 MB
Production Bundle:       ~4-6 MB (estimated)
Page Load Time:          2-3 seconds
First Load JS:           200 KB
Dependencies:            36,522 files
```

### After Full Optimization:
```
Total Size:              ~500-600 MB (-25%)
Production Bundle:       ~2-3 MB (-50%)
Page Load Time:          1-1.5 seconds (-50%)
First Load JS:           100-120 KB (-40%)
Dependencies:            ~30,000 files (-18%)
```

### Performance Improvements:
```
Lighthouse Score:        85-95 → 95-100
Core Web Vitals:         Good → Excellent
Server Resources:        2-4 GB → 1-2 GB RAM
Page Weight:             500-800 KB → 200-400 KB
Build Time:              ~12s → ~8s
```

---

## 📝 Step-by-Step Implementation Order

### **Recommended Sequence:**

1. **Day 1: Build & Bundle Analysis**
   - Fix ESLint errors
   - Generate production build
   - Add bundle analyzer
   - Identify biggest offenders

2. **Day 2: Quick Wins**
   - Optimize lucide-react imports
   - Add dynamic imports for admin
   - Implement ISR on product pages
   - Convert images to WebP

3. **Day 3: Database & API**
   - Add query optimization
   - Implement API caching
   - Add pagination everywhere
   - Optimize Prisma queries

4. **Day 4: Dependencies**
   - Remove unused packages
   - Audit large dependencies
   - Consider lighter alternatives
   - Update outdated packages

5. **Day 5: Monitoring**
   - Add performance monitoring
   - Set up performance budgets
   - Run final benchmarks
   - Document improvements

---

## 🚀 Prompt to Use in Next Session

**Copy and paste this prompt:**

---

### **📋 OPTIMIZATION SESSION PROMPT**

```
Hi! I want to optimize my Garrit Wulf automotive parts website to be lightweight 
and consume fewer resources. Please help me implement these optimizations in order:

PHASE 1 (Start Here):
1. Fix all ESLint errors so I can generate a production build
2. Install and configure bundle analyzer to see what's taking up space
3. Optimize lucide-react imports to use tree-shaking (currently 34 MB)
4. Add dynamic imports for admin components to reduce initial bundle

Current stats:
- Total: 788 MB
- Source: 3.21 MB  
- Dependencies: 784 MB
- Build fails due to ESLint errors

Target goals:
- Reduce total size by 25%
- Reduce page load time by 50%
- Reduce initial JS bundle by 40%

Please start with Phase 1, item 1. Show me:
1. All ESLint errors that need fixing
2. The files that need changes
3. Automated fixes where possible
4. Manual fixes I need to review

After fixing build errors, we'll run the production build and see the 
actual bundle sizes, then proceed with targeted optimizations.

The full optimization plan is in: docs/Side-Requests/optimization-session-prompt.md
```

---

## 🔧 Commands Reference

### Quick commands you'll need:

```bash
# Fix ESLint errors automatically (where possible)
npm run lint -- --fix

# Build for production
npm run build

# Analyze bundle
ANALYZE=true npm run build

# Check bundle sizes
npm run build -- --profile

# Audit dependencies
npm audit
npm audit fix

# Check for unused dependencies
npx depcheck

# Check outdated packages
npm outdated

# Update packages
npm update

# Install bundle analyzer
npm install -D @next/bundle-analyzer

# Test production build locally
npm run build && npm start

# Check for duplicate dependencies
npm dedupe
```

---

## 📊 Tracking Progress

### Create a progress checklist:

- [ ] Phase 1.1: Fix ESLint errors
- [ ] Phase 1.2: Optimize icon library
- [ ] Phase 1.3: Add bundle analyzer
- [ ] Phase 1.4: Implement dynamic imports
- [ ] Phase 2.5: Implement query optimization
- [ ] Phase 2.6: Add API response caching
- [ ] Phase 2.7: Implement ISR
- [ ] Phase 3.8: Optimize all images
- [ ] Phase 3.9: Implement font optimization
- [ ] Phase 3.10: Minify and compress CSS
- [ ] Phase 4.11: Audit and remove unused packages
- [ ] Phase 4.12: Replace heavy libraries
- [ ] Phase 5.13: Add performance monitoring
- [ ] Phase 5.14: Set up performance budgets

### Measure before and after each phase:
```bash
# Before optimization
npm run build > before.txt

# After optimization  
npm run build > after.txt

# Compare
diff before.txt after.txt
```

---

## 🎓 Additional Resources

### Learn more about these optimizations:

1. **Next.js Performance:**
   - https://nextjs.org/docs/app/building-your-application/optimizing

2. **Bundle Analysis:**
   - https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer

3. **Image Optimization:**
   - https://nextjs.org/docs/app/building-your-application/optimizing/images

4. **Font Optimization:**
   - https://nextjs.org/docs/app/building-your-application/optimizing/fonts

5. **Database Optimization:**
   - https://www.prisma.io/docs/guides/performance-and-optimization

6. **Core Web Vitals:**
   - https://web.dev/vitals/

---

## ⚠️ Important Notes

### Before starting optimization:

1. **Backup your code:**
   ```bash
   git add .
   git commit -m "Pre-optimization backup"
   git push
   ```

2. **Test thoroughly after each change:**
   - Run dev server: `npm run dev`
   - Test all pages
   - Test admin dashboard
   - Test product creation/editing
   - Test image uploads

3. **Measure everything:**
   - Take benchmarks before changes
   - Measure after each optimization
   - Document improvements

4. **Don't optimize prematurely:**
   - Focus on biggest wins first
   - Use data to guide decisions
   - Don't sacrifice functionality for size

---

**Ready to optimize? Use the prompt above in your next session!** 🚀

**Estimated time:** 3-5 sessions (5-8 hours total)  
**Expected impact:** 25-50% reduction in resources  
**Difficulty level:** Medium (requires careful testing)
