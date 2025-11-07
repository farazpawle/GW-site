# Homepage CMS - Quick Reference Card

## 🎯 What It Does
Control your entire homepage from the admin panel - edit text, manage images, reorder sections, toggle visibility.

---

## 📋 25 Implementation Tasks

### Database (3 tasks) - 1-2 hours
1. ✅ Add PageSection model to schema
2. ✅ Create migration
3. ✅ Seed with defaults

### API (6 tasks) - 2-3 hours
4. ✅ GET list sections
5. ✅ POST create section
6. ✅ GET single section
7. ✅ PUT update section
8. ✅ DELETE section
9. ✅ PUT bulk reorder

### Admin UI Core (3 tasks) - 2-3 hours
10. ✅ Create management page
11. ✅ Add drag-drop
12. ✅ Add visibility toggles

### Section Editors (5 tasks) - 4-5 hours
13. ✅ Create modal component
14. ✅ Hero form
15. ✅ Carousel form
16. ✅ Other forms
17. ✅ Connect to page

### Frontend (5 tasks) - 2-3 hours
18. ✅ Refactor HeroSection
19. ✅ Refactor other sections
20. ✅ Create mapper
21. ✅ Update homepage

### Testing & Polish (3 tasks) - 2-3 hours
22. ✅ Test admin flow
23. ✅ Test public homepage
24. ✅ Create docs
25. ✅ Add nav link

---

## 🏗️ Architecture At a Glance

```
Database: PageSection model
   ↓
API: 7 endpoints (CRUD + reorder)
   ↓
Admin UI: List, Edit, Drag-Drop
   ↓
Public: Fetch & Render Dynamically
```

---

## 📁 Key Files

### New Files
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

### Modified Files
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

## ⚡ Quick Commands

```bash
# Setup
npx prisma migrate dev --name add_page_section_model
npm run seed-homepage
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Dev
npm run dev

# Access
http://localhost:3000/admin/homepage
```

---

## 🎨 Section Config Schemas

### Hero
```json
{
  "title": "string",
  "subtitle": "string",
  "cta1": {"text": "string", "link": "string"},
  "cta2": {"text": "string", "link": "string"},
  "badgeText": "string"
}
```

### Carousel
```json
{
  "heading": "string",
  "logos": [
    {"id": "string", "image": "url", "description": "string"}
  ]
}
```

### Brand Story
```json
{
  "cards": [
    {"icon": "string", "title": "string", "description": "string"}
  ]
}
```

### Categories
```json
{
  "title": "string",
  "categories": [
    {"name": "string", "icon": "string", "link": "string"}
  ]
}
```

### Precision Mfg
```json
{
  "title": "string",
  "subtitle": "string",
  "features": [
    {"title": "string", "description": "string", "icon": "string"}
  ]
}
```

---

## ✅ Acceptance Checklist

- [ ] Can view section list in admin
- [ ] Can reorder via drag-drop
- [ ] Can toggle visibility
- [ ] Can edit hero content
- [ ] Can manage carousel images
- [ ] Can edit all sections
- [ ] Changes show on public site
- [ ] Mobile responsive
- [ ] No errors
- [ ] Activity logged

---

## 🔧 Dependencies

**Required:**
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

**Existing:**
- Prisma
- Next.js App Router
- shadcn/ui
- MinIO
- PostgreSQL

---

## 🚦 Implementation Order

1. **Database First** - Can't do anything without data structure
2. **API Second** - Frontend needs something to call
3. **Admin UI Third** - Build the control interface
4. **Frontend Last** - Make public site dynamic
5. **Testing Always** - At each phase

---

## 💡 Key Patterns

### API Route
```typescript
await requireAdmin()
try {
  const result = await prisma.pageSection.findMany(...)
  return NextResponse.json(result)
} catch {
  return NextResponse.json({error}, {status: 500})
}
```

### Component Props
```typescript
interface Props {
  field?: string  // Optional with default
}
export default function Component({ 
  field = "default" 
}: Props = {}) {
  // Use field
}
```

### Drag-Drop
```typescript
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={sections}>
    {sections.map(section => (
      <SortableItem key={section.id} {...section} />
    ))}
  </SortableContext>
</DndContext>
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Migration fails | Check schema syntax |
| No sections show | Run seed script |
| Drag-drop broken | Install @dnd-kit |
| Config not saving | Check validation |
| Public site stale | Verify revalidatePath |
| Images broken | Check MinIO URLs |

---

## 📚 Documentation

1. **Homepage-CMS-Summary.md** - Executive overview
2. **Homepage-CMS-Planning.md** - Full technical spec
3. **Homepage-CMS-Roadmap.md** - Visual implementation guide
4. **This file** - Quick reference

---

## 🎯 Estimated Time: 13-19 hours

**Ready to start?** Begin with task #1: Add PageSection model to schema

**Need help?** Check the detailed planning documents

**Questions?** All answers are in the documentation

---

**Last Updated:** November 5, 2025  
**Status:** Ready for Implementation ✅
