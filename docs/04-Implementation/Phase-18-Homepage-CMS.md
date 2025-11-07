# Phase 18: Homepage CMS System

**Status:** 📋 Planning Complete - Ready for Implementation  
**Priority:** HIGH  
**Estimated Time:** 13-19 hours  
**Completion:** 0%  
**Started:** November 5, 2025

---

## 🎯 Phase Goal

Build a comprehensive CMS (Content Management System) for the homepage that allows administrators to control all sections from the admin panel without touching code.

**What Success Looks Like:**
- ✅ Admin can edit hero section text, subtitle, and CTAs
- ✅ Admin can manage carousel images (add/remove/edit)
- ✅ Admin can toggle visibility of any section
- ✅ Admin can reorder sections via drag-and-drop
- ✅ Admin can edit all homepage section content
- ✅ Changes reflect immediately on public homepage
- ✅ Non-technical users can manage homepage content

---

## 📋 Implementation Overview

### Architecture Components

1. **Database Layer**
   - New `PageSection` model with JSON config field
   - Relation to existing `Page` model
   - Indexes for performance

2. **API Layer**
   - 7 RESTful endpoints for CRUD operations
   - Validation with Zod
   - Activity logging
   - Revalidation for cache management

3. **Admin Interface**
   - Homepage management page at `/admin/homepage`
   - Drag-drop reordering with @dnd-kit
   - Visibility toggle switches
   - Dynamic section editor modals

4. **Frontend Integration**
   - Refactor section components to accept props
   - Dynamic section renderer
   - Database-driven homepage
   - Backward compatibility with defaults

---

## 🗂️ Documentation Location

All detailed documentation has been moved to:

**`docs/05-Features/Homepage-CMS/`**

### Available Documents:

1. **Homepage-CMS-Summary.md**
   - Executive overview
   - What you'll be able to do
   - User interface preview
   - Next steps

2. **Homepage-CMS-Planning.md**
   - Complete technical specification
   - Database schema details
   - API endpoint documentation
   - Component architecture
   - Config JSON structures
   - Acceptance criteria

3. **Homepage-CMS-Roadmap.md**
   - Visual implementation guide
   - File structure map
   - Data flow diagrams
   - Code patterns and examples
   - Troubleshooting guide
   - Implementation checkpoints

4. **Homepage-CMS-QuickRef.md**
   - Quick reference card
   - 25 task checklist
   - Key commands
   - Config schemas
   - Dependencies list

---

## 📊 Task Breakdown

### Phase 1: Database Layer (3 tasks) - 1-2 hours
1. Add PageSection model to Prisma schema
2. Generate and apply database migration
3. Create seed script with default homepage content

### Phase 2: API Layer (6 tasks) - 2-3 hours
4. GET endpoint - List all sections
5. POST endpoint - Create new section
6. GET endpoint - Single section details
7. PUT endpoint - Update section
8. DELETE endpoint - Remove section
9. PUT endpoint - Bulk reorder sections

### Phase 3: Admin UI - Core (3 tasks) - 2-3 hours
10. Create homepage management page
11. Add drag-drop reordering functionality
12. Add visibility toggle switches

### Phase 4: Admin UI - Section Editors (5 tasks) - 4-5 hours
13. Create section editor modal component
14. Build hero section form
15. Build carousel section form
16. Build other section forms (BrandStory, Categories, PrecisionMfg)
17. Connect modal to management page

### Phase 5: Frontend Integration (5 tasks) - 2-3 hours
18. Refactor HeroSection to accept props
19. Refactor other section components
20. Create DynamicSection mapper component
21. Update homepage to fetch sections from database

### Phase 6: Testing & Polish (3 tasks) - 2-3 hours
22. Test complete admin workflow
23. Test public homepage rendering
24. Add navigation link to admin sidebar

**Total: 25 tasks**

---

## 🛠️ Technical Stack

### New Dependencies
```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x"
}
```

### Existing Technologies
- ✅ Next.js 14+ App Router
- ✅ Prisma ORM (PostgreSQL)
- ✅ shadcn/ui components
- ✅ MinIO for image storage
- ✅ TypeScript
- ✅ Zod validation

---

## 🎨 Section Types & Configurations

### 1. Hero Section
```typescript
{
  title: string
  subtitle: string
  cta1: { text: string, link: string }
  cta2: { text: string, link: string }
  badgeText?: string
}
```

### 2. Brand Carousel
```typescript
{
  heading: string
  logos: Array<{id: string, image: string, description: string}>
}
```

### 3. Brand Story
```typescript
{
  cards: Array<{icon: string, title: string, description: string}>
}
```

### 4. Categories
```typescript
{
  title: string
  categories: Array<{name: string, icon: string, link: string}>
}
```

### 5. Precision Manufacturing
```typescript
{
  title: string
  subtitle: string
  features: Array<{title: string, description: string, icon: string}>
}
```

---

## 🔒 Safety & Quality Measures

### Data Safety
- Current homepage content preserved as database defaults
- Backward compatibility with hardcoded components
- Fallback rendering if no sections found
- All operations logged in ActivityLog

### Code Quality
- TypeScript for type safety
- Zod schemas for runtime validation
- Comprehensive error handling
- Proper HTTP status codes

### Performance
- Database indexes on `pageId + position`
- React cache() for server components
- revalidatePath() on updates
- Optimistic UI updates in admin

### User Experience
- Toast notifications for all actions
- Inline form validation
- Mobile responsive design
- Intuitive drag-drop interface

---

## ✅ Acceptance Criteria

### Admin Panel Functionality
- [ ] Can view list of all homepage sections
- [ ] Can reorder sections via drag-and-drop
- [ ] Can toggle section visibility (show/hide)
- [ ] Can edit hero section: title, subtitle, CTAs
- [ ] Can manage carousel: add/remove/edit images
- [ ] Can edit brand story cards
- [ ] Can edit categories
- [ ] Can edit precision manufacturing content
- [ ] All operations show toast notifications
- [ ] All operations logged in ActivityLog

### Public Homepage
- [ ] Displays only visible sections
- [ ] Sections appear in correct order
- [ ] Dynamic content from database displays
- [ ] Falls back to hardcoded if no sections
- [ ] All styling and animations preserved
- [ ] Responsive on all devices

### Technical Quality
- [ ] No console errors
- [ ] API validates all inputs
- [ ] Database migrations successful
- [ ] Seed script populates defaults
- [ ] TypeScript types correct
- [ ] Follows project patterns

---

## 🚀 Future Enhancements (Post-Phase)

1. Live preview before publishing
2. Section templates library
3. Version history and rollback
4. A/B testing configurations
5. Extend to About and Contact pages
6. Custom CSS per section
7. Animation configuration
8. Create entirely new section types
9. Section duplication feature
10. Import/export configurations

---

## 📍 Key Files to Create/Modify

### New Files (8)
```
prisma/migrations/[timestamp]_add_page_section/
scripts/seed-homepage-sections.ts
src/app/admin/homepage/page.tsx
src/app/api/admin/homepage/sections/route.ts
src/app/api/admin/homepage/sections/[id]/route.ts
src/app/api/admin/homepage/sections/reorder/route.ts
src/components/admin/homepage/SectionEditorModal.tsx
src/components/DynamicSection.tsx
```

### Modified Files (7)
```
prisma/schema.prisma
src/app/(public)/page.tsx
src/components/sections/HeroSection.tsx
src/components/sections/BrandStorySection.tsx
src/components/sections/CategoriesSection.tsx
src/components/sections/PrecisionManufacturingSection.tsx
src/components/admin/AdminLayoutClient.tsx
```

---

## 🎓 Related Phases

- **Phase 10** (Advanced CMS) - Future expansion planned
- **Phase 14** (Media Library) - Image management integration
- **Phase 17** (Performance) - Optimization considerations

---

## 📚 Additional Resources

For complete implementation details, see:
- **Documentation:** `docs/05-Features/Homepage-CMS/`
- **Task Management:** CoT (Chain of Thought) system with 25 detailed tasks
- **Code Patterns:** See Roadmap document for examples

---

## 🏁 Getting Started

### Quick Start Commands
```bash
# 1. Install dependencies
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# 2. Update database
npx prisma migrate dev --name add_page_section_model

# 3. Seed default data
npm run seed-homepage  # or run script manually

# 4. Start development
npm run dev

# 5. Access admin panel
# http://localhost:3000/admin/homepage
```

### Implementation Order
1. Start with Database Layer (tasks 1-3)
2. Build API Layer (tasks 4-9)
3. Create Admin UI (tasks 10-17)
4. Integrate Frontend (tasks 18-21)
5. Test & Polish (tasks 22-25)

---

## 📞 Notes

- This is a **showcase website**, not e-commerce
- Focus on content management, not product sales
- Built to extend to other pages later
- Architecture inspired by Shopify's section system
- Maintains all existing styling and brand identity

---

**Phase Status:** ✅ Planning Complete  
**Next Action:** Begin implementation with task #1 (Database Schema)  
**Estimated Completion:** 13-19 hours from start  
**Priority Level:** HIGH
