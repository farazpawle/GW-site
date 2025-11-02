# Phase 10: Advanced CMS / Theme Section Management (FUTURE)

**Status:** 📋 Archived for Future  
**Priority:** VERY LOW (Advanced Feature - Not Currently Needed)  
**Started:** Not yet  
**Estimated Time:** 8-10 hours  
**Completion:** 0%

---

## 🎯 Goal

Build a Shopify-like CMS system where administrators can customize the website's UI by selecting, configuring, and arranging pre-built sections (Hero, Carousel, Features, etc.) without writing code.

**What Success Looks Like:**
- ✅ Admin can see available section components
- ✅ Admin can add/remove sections from pages
- ✅ Admin can drag-and-drop to reorder sections
- ✅ Admin can configure section content (images, text, colors)
- ✅ Admin can preview changes before publishing
- ✅ Changes apply to live site immediately on publish
- ✅ Support for multiple pages (Home, About, Contact)

---

## 🏗️ System Architecture

### Database Schema Extension

```prisma
// New models to add to schema.prisma

model Page {
  id          String   @id @default(cuid())
  name        String   @unique // "home", "about", "contact"
  title       String
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  sections    PageSection[]
  
  @@map("pages")
}

model PageSection {
  id            String   @id @default(cuid())
  pageId        String
  sectionType   String   // "hero", "carousel", "features", etc.
  position      Int      // Order on page (0, 1, 2, ...)
  visible       Boolean  @default(true)
  config        Json     // Section-specific configuration
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  page          Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  
  @@map("page_sections")
  @@index([pageId, position])
}

model SectionTemplate {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  category    String   // "hero", "content", "media", "cta"
  description String?
  thumbnail   String?
  configSchema Json    // JSON schema for configuration
  defaults    Json     // Default configuration values
  
  @@map("section_templates")
}
```

---

## 📋 Available Section Types

### 1. Hero Section
**Configuration Options:**
```typescript
{
  backgroundImage: string,
  title: string,
  subtitle: string,
  ctaText: string,
  ctaLink: string,
  overlayOpacity: number (0-1),
  textAlign: "left" | "center" | "right"
}
```

### 2. Carousel Section
**Configuration Options:**
```typescript
{
  images: Array<{url: string, caption: string}>,
  autoplay: boolean,
  interval: number (seconds),
  showDots: boolean,
  showArrows: boolean
}
```

### 3. Features Grid
**Configuration Options:**
```typescript
{
  title: string,
  features: Array<{
    icon: string,
    title: string,
    description: string
  }>,
  columns: 2 | 3 | 4
}
```

### 4. Product Grid
**Configuration Options:**
```typescript
{
  title: string,
  categoryId: string | null, // Filter by category
  limit: number,
  layout: "grid" | "list",
  showPrice: boolean,
  showStock: boolean
}
```

### 5. Testimonials
**Configuration Options:**
```typescript
{
  title: string,
  testimonials: Array<{
    quote: string,
    author: string,
    role: string,
    avatar: string | null
  }>
}
```

### 6. Call-to-Action (CTA)
**Configuration Options:**
```typescript
{
  backgroundColor: string,
  title: string,
  description: string,
  buttonText: string,
  buttonLink: string,
  image: string | null
}
```

### 7. Contact Form
**Configuration Options:**
```typescript
{
  title: string,
  description: string,
  fields: Array<"name" | "email" | "phone" | "message">,
  submitText: string,
  successMessage: string
}
```

### 8. Image + Text (Content Block)
**Configuration Options:**
```typescript
{
  image: string,
  imagePosition: "left" | "right",
  title: string,
  content: string (HTML),
  buttonText: string | null,
  buttonLink: string | null
}
```

---

## 📋 Tasks

### Task 1: Extend Database Schema
**Time:** 20 minutes

**Actions:**
- Add Page, PageSection, SectionTemplate models to schema
- Run migration
- Seed default section templates

**Files to Create:**
- `prisma/migrations/[timestamp]_add_cms_tables/migration.sql`
- `prisma/seeds/section-templates.ts`

---

### Task 2: Create Section Template Library
**Time:** 90 minutes

**Actions:**
- Build React components for each section type (8 sections)
- Make components configurable via props
- Add TypeScript interfaces for each config
- Create section registry

**Files to Create:**
- `src/components/sections/HeroSection.tsx`
- `src/components/sections/CarouselSection.tsx`
- `src/components/sections/FeaturesSection.tsx`
- `src/components/sections/ProductGridSection.tsx`
- `src/components/sections/TestimonialsSection.tsx`
- `src/components/sections/CTASection.tsx`
- `src/components/sections/ContactFormSection.tsx`
- `src/components/sections/ContentBlockSection.tsx`
- `src/lib/section-registry.ts` - Maps section types to components

---

### Task 3: Create Page Builder UI
**Time:** 120 minutes

**Features:**
- Left sidebar: Available sections (drag from here)
- Center panel: Current page sections (drop here)
- Right sidebar: Section configuration form
- Drag-and-drop with react-beautiful-dnd or dnd-kit
- Add/remove sections
- Reorder sections
- Select section to configure

**Files to Create:**
- `src/app/admin/page-builder/[pageId]/page.tsx` - Page builder UI
- `src/components/admin/page-builder/SectionLibrary.tsx` - Available sections
- `src/components/admin/page-builder/PageCanvas.tsx` - Droppable canvas
- `src/components/admin/page-builder/SectionConfig.tsx` - Configuration panel
- `src/components/admin/page-builder/SectionItem.tsx` - Draggable section

**Libraries to Install:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable
npm install react-hook-form @hookform/resolvers zod
```

---

### Task 4: Create Configuration Forms
**Time:** 90 minutes

**Features:**
- Dynamic form generation based on section type
- Form fields for each config option
- Image upload fields
- Color picker
- Rich text editor for content
- Real-time validation

**Files to Create:**
- `src/components/admin/page-builder/config-forms/HeroConfigForm.tsx`
- `src/components/admin/page-builder/config-forms/CarouselConfigForm.tsx`
- (One form component per section type)
- `src/components/admin/page-builder/FormField.tsx` - Reusable form fields

---

### Task 5: Create Preview System
**Time:** 60 minutes

**Features:**
- Live preview of page as sections are added/configured
- Toggle preview mode (desktop, tablet, mobile)
- Side-by-side edit/preview or modal preview
- Render sections with current configuration

**Files to Create:**
- `src/components/admin/page-builder/Preview.tsx` - Preview panel
- `src/components/admin/page-builder/PreviewFrame.tsx` - Iframe or embedded preview

---

### Task 6: Create Page Builder API
**Time:** 60 minutes

**Features:**
- GET: Fetch page with sections
- POST: Create new page
- PUT: Update page sections and config
- PATCH: Publish/unpublish page
- POST: Duplicate section
- DELETE: Remove section

**Files to Create:**
- `src/app/api/admin/pages/route.ts` - GET all pages, POST new
- `src/app/api/admin/pages/[pageId]/route.ts` - GET, PUT, PATCH, DELETE
- `src/app/api/admin/pages/[pageId]/sections/route.ts` - POST new section
- `src/app/api/admin/pages/[pageId]/sections/[sectionId]/route.ts` - PUT, DELETE

---

### Task 7: Create Dynamic Page Renderer
**Time:** 45 minutes

**Features:**
- Fetch page sections from database
- Render sections in order
- Pass configuration to each section component
- Only show published pages on frontend
- Fallback for unpublished/missing pages

**Files to Create:**
- `src/app/[pageSlug]/page.tsx` - Dynamic page renderer
- `src/lib/render-section.tsx` - Section rendering utility

**Example Renderer:**
```typescript
export default async function DynamicPage({ params }) {
  const page = await prisma.page.findUnique({
    where: { name: params.pageSlug },
    include: {
      sections: {
        where: { visible: true },
        orderBy: { position: 'asc' }
      }
    }
  })
  
  if (!page || !page.published) {
    notFound()
  }
  
  return (
    <>
      {page.sections.map(section => (
        <RenderSection
          key={section.id}
          type={section.sectionType}
          config={section.config}
        />
      ))}
    </>
  )
}
```

---

### Task 8: Create Page Management Dashboard
**Time:** 45 minutes

**Features:**
- List all pages (home, about, contact, etc.)
- Create new page
- Edit page (opens page builder)
- Duplicate page
- Delete page
- Publish/unpublish toggle

**Files to Create:**
- `src/app/admin/pages/page.tsx` - Page management dashboard
- `src/components/admin/PageCard.tsx` - Page card component

---

### Task 9: Add Section Templates Seeding
**Time:** 30 minutes

**Features:**
- Seed database with all 8 section templates
- Include thumbnails, descriptions, config schemas
- Default values for each section

**Files to Create:**
- `prisma/seeds/section-templates.ts`

---

### Task 10: Polish & Test
**Time:** 60 minutes

**Features:**
- Test drag-and-drop functionality
- Test all section configurations
- Test preview system
- Test publish/unpublish
- Responsive design
- Loading states
- Error handling
- Fix bugs

---

## 📁 Files Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── pages/
│   │   │   └── page.tsx              (NEW) Page management
│   │   └── page-builder/
│   │       └── [pageId]/
│   │           └── page.tsx          (NEW) Page builder UI
│   │
│   ├── [pageSlug]/
│   │   └── page.tsx                  (NEW) Dynamic page renderer
│   │
│   └── api/admin/
│       └── pages/
│           ├── route.ts              (NEW) GET, POST
│           └── [pageId]/
│               ├── route.ts          (NEW) GET, PUT, PATCH, DELETE
│               └── sections/
│                   ├── route.ts      (NEW) POST
│                   └── [sectionId]/
│                       └── route.ts  (NEW) PUT, DELETE
│
├── components/
│   ├── sections/                     (NEW) Public-facing sections
│   │   ├── HeroSection.tsx
│   │   ├── CarouselSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── ProductGridSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── CTASection.tsx
│   │   ├── ContactFormSection.tsx
│   │   └── ContentBlockSection.tsx
│   │
│   └── admin/
│       └── page-builder/             (NEW) Page builder components
│           ├── SectionLibrary.tsx
│           ├── PageCanvas.tsx
│           ├── SectionConfig.tsx
│           ├── SectionItem.tsx
│           ├── Preview.tsx
│           ├── PreviewFrame.tsx
│           └── config-forms/
│               ├── HeroConfigForm.tsx
│               ├── CarouselConfigForm.tsx
│               └── ... (one per section)
│
└── lib/
    ├── section-registry.ts           (NEW) Section type mapping
    └── render-section.tsx            (NEW) Section renderer utility
```

---

## 🎨 Design Specifications

### Page Builder Interface
```
┌────────────────────────────────────────────────────────────────┐
│  Page Builder: Home Page                    [Preview] [Publish]│
├──────────┬─────────────────────────────┬──────────────────────┤
│          │                             │                      │
│ SECTIONS │    PAGE CANVAS              │  CONFIGURATION       │
│          │                             │                      │
│ Hero     │  ┌───────────────────────┐  │  Hero Section        │
│ Carousel │  │  [Hero Section]       │  │  ─────────────       │
│ Features │  │  ✏️ ⬆️ ⬇️ ❌            │  │  Background Image:   │
│ Products │  └───────────────────────┘  │  [Upload]            │
│ CTA      │                             │                      │
│ Contact  │  ┌───────────────────────┐  │  Title:              │
│          │  │  [Features Grid]      │  │  [____________]      │
│ + Add    │  │  ✏️ ⬆️ ⬇️ ❌            │  │                      │
│          │  └───────────────────────┘  │  Subtitle:           │
│          │                             │  [____________]      │
│          │  [+ Add Section Here]       │                      │
│          │                             │  CTA Button:         │
│          │                             │  Text: [_____]       │
│          │                             │  Link: [_____]       │
│          │                             │                      │
│          │                             │  [Save Config]       │
└──────────┴─────────────────────────────┴──────────────────────┘
```

---

## 🔧 Technical Challenges & Solutions

### Challenge 1: Drag-and-Drop Implementation
**Solution:** Use @dnd-kit/core library with sortable list for sections

### Challenge 2: Dynamic Form Generation
**Solution:** Use JSON schema from section templates to generate forms dynamically

### Challenge 3: Real-time Preview
**Solution:** Use React state to track section configs, re-render preview on change

### Challenge 4: Section Data Persistence
**Solution:** Store configuration as JSON in PageSection.config field

### Challenge 5: Section Component Registry
**Solution:** Create mapping object: `{ hero: HeroSection, carousel: CarouselSection, ... }`

---

## ✅ Acceptance Criteria

**Core Functionality:**
- [ ] Can create new pages
- [ ] Can add sections to pages
- [ ] Can drag-and-drop to reorder sections
- [ ] Can configure each section's content
- [ ] Can preview page before publishing
- [ ] Can publish/unpublish pages
- [ ] Published pages render on frontend
- [ ] Section configurations persist correctly

**User Experience:**
- [ ] Intuitive drag-and-drop interface
- [ ] Real-time preview updates
- [ ] Clear visual feedback on actions
- [ ] Loading states during saves
- [ ] Error messages for invalid configs
- [ ] Mobile-responsive builder (optional)

**Technical Quality:**
- [ ] No data loss on configuration changes
- [ ] Fast page load times on frontend
- [ ] Proper database indexing
- [ ] TypeScript type safety
- [ ] Clean code architecture

---

## 💡 Future Enhancements

- [ ] Section templates marketplace
- [ ] Custom CSS per section
- [ ] A/B testing for sections
- [ ] Section analytics (views, clicks)
- [ ] Version history / rollback
- [ ] Section scheduling (show/hide by date)
- [ ] Conditional sections (show based on user role)
- [ ] Global sections (header, footer)
- [ ] Section animations
- [ ] Multi-language support per section

---

## 📊 Progress Tracking

| Task | Estimated | Actual | Status |
|------|-----------|--------|--------|
| Database Schema | 20 min | - | ⬜ Not started |
| Section Components | 90 min | - | ⬜ Not started |
| Page Builder UI | 120 min | - | ⬜ Not started |
| Configuration Forms | 90 min | - | ⬜ Not started |
| Preview System | 60 min | - | ⬜ Not started |
| Page Builder API | 60 min | - | ⬜ Not started |
| Dynamic Page Renderer | 45 min | - | ⬜ Not started |
| Page Management | 45 min | - | ⬜ Not started |
| Section Templates Seed | 30 min | - | ⬜ Not started |
| Polish & Test | 60 min | - | ⬜ Not started |
| **TOTAL** | **~9 hours** | - | - |

---

## 🔗 Dependencies

**Required Before Starting:**
- Phase 3: Product Management (for ProductGridSection)
- Phase 4: Category Management (for filtering products)
- Image upload system (from Phase 3)

**External Libraries:**
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "react-hook-form": "^7.63.0",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.11"
}
```

---

**Status:** Advanced feature - implement after core e-commerce functionality! 🎨
