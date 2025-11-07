# Homepage CMS System - Implementation Planning

**Status:** 📋 Planning Complete - Ready for Implementation  
**Priority:** HIGH  
**Estimated Time:** 13-19 hours  
**Completion:** 0%

---

## 🎯 Goal

Create a comprehensive CMS system in the admin panel to dynamically control the entire homepage. Administrators will be able to:

- ✅ Edit hero section text, subtitle, and CTA buttons
- ✅ Manage carousel images (add, remove, edit captions)
- ✅ Toggle visibility of any section (show/hide)
- ✅ Reorder sections via drag-and-drop
- ✅ Edit content for all homepage sections
- ✅ See changes reflected immediately on the public site

---

## 🏗️ Architecture Overview

### Database Schema

**New Model: PageSection**
```prisma
model PageSection {
  id          String   @id @default(cuid())
  pageId      String
  sectionType String   // "hero" | "brandStory" | "carousel" | "categories" | "precisionMfg"
  position    Int      // 0, 1, 2, 3, 4...
  visible     Boolean  @default(true)
  config      Json     // Section-specific configuration
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  page        Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  
  @@index([pageId, position])
  @@index([visible])
  @@map("page_sections")
}
```

**Extended Model: Page**
```prisma
model Page {
  // ... existing fields
  sections    PageSection[]  // New relation
}
```

### Config JSON Structures

Each section type has its own configuration structure:

**1. Hero Section**
```typescript
{
  title: string
  subtitle: string
  cta1: { text: string, link: string }
  cta2: { text: string, link: string }
  badgeText?: string
}
```

**2. Brand Carousel**
```typescript
{
  heading: string
  logos: Array<{
    id: string
    image: string  // MinIO URL
    description: string
  }>
}
```

**3. Brand Story**
```typescript
{
  cards: Array<{
    icon: string  // Lucide icon name or emoji
    title: string
    description: string
  }>
}
```

**4. Categories**
```typescript
{
  title: string
  categories: Array<{
    name: string
    icon: string
    link: string
  }>
}
```

**5. Precision Manufacturing**
```typescript
{
  title: string
  subtitle: string
  features: Array<{
    title: string
    description: string
    icon: string
  }>
}
```

---

## 📡 API Endpoints

### Admin Homepage Sections API

1. **GET** `/api/admin/homepage/sections`
   - List all homepage sections, ordered by position
   - Query params: `?visible=true` (optional filter)

2. **POST** `/api/admin/homepage/sections`
   - Create new section
   - Body: `{ sectionType, position, visible, config }`

3. **GET** `/api/admin/homepage/sections/[id]`
   - Get single section details

4. **PUT** `/api/admin/homepage/sections/[id]`
   - Update section config or properties
   - Body: `{ config?, visible?, position? }`

5. **DELETE** `/api/admin/homepage/sections/[id]`
   - Remove section and reorder remaining

6. **PUT** `/api/admin/homepage/sections/reorder`
   - Bulk position updates (drag-drop)
   - Body: `{ sections: Array<{id, position}> }`

---

## 🎨 Admin UI Components

### 1. Homepage Management Page
**Location:** `/admin/homepage`

**Features:**
- List view of all sections
- Section cards showing:
  - Section type badge
  - Position number
  - Visibility toggle
  - Edit button
  - Drag handle
- "Add New Section" button (future enhancement)
- "Preview Homepage" link

### 2. Section Editor Modal
**Component:** `SectionEditorModal.tsx`

**Features:**
- Dynamic form based on section type
- Real-time validation
- Image upload integration (MinIO)
- Array field management (add/remove items)
- Save/Cancel actions
- Toast notifications

### 3. Drag-Drop Interface
**Library:** `@dnd-kit/core`, `@dnd-kit/sortable`

**Features:**
- Drag handle on each section card
- Visual feedback during drag
- Optimistic UI update
- API call on drop
- Error handling with rollback

---

## 🔧 Frontend Integration

### 1. Component Refactoring

All existing section components will be modified to accept props:

```typescript
// Before (hardcoded)
export default function HeroSection() {
  const title = "Excellence in Automotive Parts";
  // ...
}

// After (dynamic with defaults)
interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  // ...
}

export default function HeroSection({ 
  title = "Excellence in Automotive Parts",
  subtitle = "...",
  // ...
}: HeroSectionProps) {
  // Use prop values
}
```

### 2. Dynamic Section Mapper

**Component:** `DynamicSection.tsx`

```typescript
function DynamicSection({ type, config }) {
  switch(type) {
    case 'hero': return <HeroSection {...config} />
    case 'carousel': return <BrandCarouselSection {...config} />
    case 'brandStory': return <BrandStorySection {...config} />
    case 'categories': return <CategoriesSection {...config} />
    case 'precisionMfg': return <PrecisionManufacturingSection {...config} />
    default: return null
  }
}
```

### 3. Homepage Rendering

```typescript
// src/app/(public)/page.tsx
export default async function HomePage() {
  const sections = await prisma.pageSection.findMany({
    where: { 
      page: { slug: 'home' },
      visible: true 
    },
    orderBy: { position: 'asc' }
  })
  
  // Fallback to hardcoded if no sections (backward compatibility)
  if (sections.length === 0) {
    return <HardcodedHomepage />
  }
  
  return (
    <div>
      {sections.map(section => (
        <DynamicSection 
          key={section.id}
          type={section.sectionType}
          config={section.config}
        />
      ))}
    </div>
  )
}
```

---

## 🔒 Technical Safeguards

### 1. Backward Compatibility
- Seed database with current hardcoded content as defaults
- Fallback rendering if no sections found
- All components work with or without props

### 2. Data Validation
- Zod schemas for all API inputs
- TypeScript interfaces for type safety
- Admin UI prevents invalid configurations

### 3. Performance
- Database indexes on `pageId + position` and `visible`
- React `cache()` for section queries
- `revalidatePath('/')` on updates

### 4. Error Handling
- Try-catch in all API routes
- Proper HTTP status codes
- User-friendly error messages
- Toast notifications for feedback

---

## 📋 Implementation Tasks (25 Total)

### Phase 1: Database Layer (3 tasks)
1. ✅ Add PageSection model to schema
2. ✅ Generate and apply migration
3. ✅ Create seed script with defaults

### Phase 2: API Layer (6 tasks)
4. ✅ GET list sections endpoint
5. ✅ POST create section endpoint
6. ✅ GET single section endpoint
7. ✅ PUT update section endpoint
8. ✅ DELETE section endpoint
9. ✅ PUT bulk reorder endpoint

### Phase 3: Admin UI - Core (3 tasks)
10. ✅ Create homepage management page
11. ✅ Add drag-drop reordering
12. ✅ Add visibility toggles

### Phase 4: Admin UI - Section Editors (5 tasks)
13. ✅ Create section editor modal component
14. ✅ Hero section form
15. ✅ Carousel section form
16. ✅ Other section forms (BrandStory, Categories, PrecisionMfg)
17. ✅ Connect modal to page

### Phase 5: Frontend Integration (5 tasks)
18. ✅ Refactor HeroSection to accept props
19. ✅ Refactor other section components
20. ✅ Create DynamicSection mapper
21. ✅ Update homepage to fetch sections

### Phase 6: Testing & Polish (3 tasks)
22. ✅ Test admin flow end-to-end
23. ✅ Test public homepage rendering
24. ✅ Create implementation documentation
25. ✅ Add navigation link

---

## ✅ Acceptance Criteria

### Admin Panel
- [ ] Can view list of all homepage sections
- [ ] Can reorder sections via drag-drop
- [ ] Can toggle section visibility (show/hide)
- [ ] Can edit hero section: title, subtitle, CTAs
- [ ] Can manage carousel: add/remove/edit images
- [ ] Can edit brand story cards
- [ ] Can edit categories list
- [ ] Can edit precision manufacturing content
- [ ] All operations show toast notifications
- [ ] All operations logged in ActivityLog

### Public Homepage
- [ ] Displays only visible sections
- [ ] Sections appear in correct order
- [ ] Dynamic content from database displays correctly
- [ ] Falls back to hardcoded if no sections
- [ ] All styling and animations preserved
- [ ] Responsive on mobile/tablet/desktop

### Technical
- [ ] No console errors
- [ ] API validates all inputs
- [ ] Database migrations run successfully
- [ ] Seed script populates defaults
- [ ] TypeScript types are correct
- [ ] Code follows project patterns

---

## 🚀 Future Enhancements (Out of Scope)

1. **Live Preview** - Preview changes before saving
2. **Section Templates** - Library of pre-made sections
3. **Version History** - Rollback to previous configurations
4. **A/B Testing** - Test different section configurations
5. **Multi-Page Support** - Extend to About, Contact pages
6. **Custom CSS** - Per-section styling options
7. **Animation Config** - Control animations from admin
8. **Add New Sections** - Create entirely new section types
9. **Section Duplication** - Copy existing sections
10. **Import/Export** - Backup and restore configurations

---

## 📊 Technical Decisions

### Why JSON Config?
- Flexibility: Each section type has different fields
- Extensibility: Easy to add new fields without migrations
- TypeScript: Can validate with Zod and type with interfaces

### Why Single Table?
- Simpler: One model vs. 5+ separate models
- Easier Queries: Single query for all sections
- Maintainable: Less code duplication

### Why Not Section Templates?
- YAGNI: Current need is homepage only
- Simplicity: Reduces initial complexity
- Future: Can add later if needed

### Why Drag-Drop?
- UX: Intuitive for non-technical users
- Industry Standard: Shopify, WordPress use it
- Modern: Expected in 2025 CMS systems

---

## 🔗 Dependencies

### Required Packages
- `@dnd-kit/core` - Drag and drop core
- `@dnd-kit/sortable` - Sortable list functionality
- `@dnd-kit/utilities` - Helper utilities

### Existing Integrations
- ✅ MinIO for image uploads
- ✅ shadcn/ui components
- ✅ Prisma ORM
- ✅ Activity logging system
- ✅ Admin authentication

---

## 📝 Notes

- This system is designed for the Garrit & Wulf **showcase website** (not e-commerce)
- Focus is on content management, not product sales
- Built to be extended to other pages in the future
- Architecture inspired by Shopify's section system
- Maintains all existing styling and brand identity

---

## 🎓 Learning Resources

### For Future Developers
- Prisma JSON fields: https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#json-type
- dnd-kit: https://docs.dndkit.com/
- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Zod validation: https://zod.dev/

---

## 📅 Timeline Estimate

| Phase | Tasks | Time |
|-------|-------|------|
| Database | 3 | 1-2 hours |
| API Layer | 6 | 2-3 hours |
| Admin Core UI | 3 | 2-3 hours |
| Section Editors | 5 | 4-5 hours |
| Frontend | 5 | 2-3 hours |
| Testing & Polish | 3 | 2-3 hours |
| **TOTAL** | **25** | **13-19 hours** |

---

**Status:** ✅ Planning Complete - Ready for Implementation  
**Next Step:** Begin with Phase 1 - Database Layer  
**Document Created:** November 5, 2025
