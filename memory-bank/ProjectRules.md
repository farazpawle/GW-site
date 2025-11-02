# Project Rules: Garrit & Wulf Website

## Critical Project Understanding

### Business Model Rules (MUST READ)
**Updated:** November 2, 2025

1. **NOT E-COMMERCE**: This is a showcase/portfolio website for generating B2B inquiries, NOT an online store
2. **NO Implementation of**:
   - Shopping carts or checkout flows
   - Product reviews or ratings systems
   - Inventory alerts for customers
   - Product comparison features
   - Transaction processing or payment gateways
   - Order management or fulfillment tracking

3. **YES Implementation of**:
   - Product catalog display (with informational pricing)
   - Inquiry generation (contact forms, quote requests)
   - Engagement metrics (page views, product views)
   - Lead tracking (inquiries, quote requests)
   - Catalog quality monitoring (missing images/descriptions)

4. **When Planning Features**:
   - Always ask: "Does this generate inquiries or showcase products?"
   - If it's about transactions/sales, it's wrong for this project
   - Focus on content quality, not conversion funnels
   - Measure success by engagement, not revenue

5. **Documentation Standard**:
   - Implementation plans must reflect showcase model
   - Remove e-commerce assumptions (carts, checkout, inventory management)
   - Focus on content management and lead generation
   - Example: Phase 17 reduced from 17-20 weeks to 3-4 weeks by removing e-commerce features

---

## Development Standards

### 1. Design Consistency Rules

#### Color Usage
- **Primary Maroon**: `#6e0000` for buttons, icons, accents
- **Light Maroon**: `#ff9999` for hover states on links
- **Dark Backgrounds**: `#0a0a0a` (primary), `#1a1a1a` (cards)
- **Borders**: `#2a2a2a` for card borders
- **Text**: White (#ffffff) primary, gray-400 (#9ca3af) secondary
- **Never use blue**: Project switched from blue to maroon theme

#### Component Styling Pattern
```tsx
// Always use this pattern for cards
<div 
  className="rounded-2xl border p-6 transition-all duration-300 hover:scale-105"
  style={{ 
    backgroundColor: '#1a1a1a',
    borderColor: '#2a2a2a'
  }}
>
  {/* Content */}
</div>

// Always use this for maroon buttons
<button 
  className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
  style={{ backgroundColor: '#6e0000' }}
>
  Button Text
</button>

// Always use this for icon backgrounds
<div 
  className="w-12 h-12 rounded-full flex items-center justify-center"
  style={{ backgroundColor: '#6e0000' }}
>
  <Icon className="w-6 h-6 text-white" />
</div>
```

#### Layout Rules
- **Container**: Always use `container mx-auto px-4`
- **Section Padding**: Use `py-16 md:py-24` for vertical spacing
- **Grid Gaps**: Use `gap-8` for card grids
- **Max Width**: Container defaults to `max-w-7xl`

### 2. Component Organization Rules

#### File Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout with Header/Footer
│   ├── page.tsx            # Homepage only
│   └── [route]/
│       ├── layout.tsx      # Optional route layout
│       ├── page.tsx        # Route page content ONLY
│       └── loading.tsx     # Loading state
├── components/
│   ├── Header.tsx          # Site header
│   ├── Footer.tsx          # Site footer
│   ├── sections/           # Page sections
│   └── ui/                 # Reusable UI components
└── public/
    └── images/             # All images go here
```

#### Component Rules
1. **Don't duplicate Layout components**: Pages should NOT include their own Header/Footer
2. **Use Server Components by default**: Add 'use client' only when needed
3. **One component per file**: Except for tightly coupled sub-components
4. **Export default for main component**: Named exports for utilities
5. **Colocate related components**: Keep section components in `sections/`

### 3. Styling Rules

#### Tailwind Usage
- **Use Tailwind classes** for layout, spacing, and responsive design
- **Use inline styles** for brand colors (#6e0000, #1a1a1a, etc.)
- **Avoid custom CSS**: Use Tailwind utilities instead
- **Responsive breakpoints**: Use `md:` (768px) and `lg:` (1024px)

#### Animation Rules
```tsx
// Standard transition for interactive elements
className="transition-all duration-300"

// Hover scale effect
className="hover:scale-105"

// Hover color change for links
className="text-gray-400 hover:text-[#ff9999] transition-colors"
```

### 4. Image Handling Rules

#### Always Use Next/Image
```tsx
import Image from 'next/image';

// Standard image
<Image 
  src="/images/filename.jpg"
  alt="Descriptive alt text"
  width={800}
  height={600}
  className="..."
/>

// Background/fill image
<Image 
  src="/images/filename.jpg"
  alt="Descriptive alt text"
  fill
  className="object-cover"
/>
```

#### Image Guidelines
- Store all images in `/public/images/`
- Use descriptive filenames (e.g., `brake-system.jpg`)
- Always provide width and height or use `fill`
- Always include descriptive alt text
- Prefer AVIF/WebP for better compression
- Use JPG for photos, PNG for graphics with transparency

### 5. Navigation Rules

#### Link Structure
- **Homepage**: `/`
- **About**: `/about`
- **Contact**: `/contact`
- **Parts**: `/parts` (with optional `?category=european`)
- **Career**: `/career`
- **Terms**: `/terms`
- **Privacy**: `/privacy`

#### Navigation Component
- Use Next.js `Link` component for internal links
- Use `<a>` with `target="_blank"` for external links
- Always include `rel="noopener noreferrer"` for external links

### 6. Form Rules

#### Contact Form Pattern
```tsx
'use client';

const [formData, setFormData] = useState({ name: '', email: '', message: '' });
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (response.ok) {
      // Success handling
    } else {
      // Error handling
    }
  } catch (error) {
    // Error handling
  } finally {
    setIsSubmitting(false);
  }
};
```

#### Form Validation
- Validate on client side before submission
- Always validate on server side (API route)
- Show clear error messages
- Disable submit button while submitting
- Show loading state during submission

### 7. Typography Rules

#### Heading Hierarchy
```tsx
// Page title (h1)
<h1 className="text-5xl md:text-7xl font-bold">

// Section title (h2)
<h2 className="text-3xl md:text-4xl font-bold mb-12">

// Card title (h3)
<h3 className="text-xl md:text-2xl font-bold mb-4">

// Body text
<p className="text-base md:text-lg text-gray-400">

// Small text
<p className="text-sm text-gray-400">
```

#### Font Usage
- **Oswald**: Headings (via next/font/google)
- **System font**: Body text (default)

### 8. Responsive Design Rules

#### Breakpoints
- **Mobile First**: Start with mobile design
- **md: (768px)**: Tablet and up
- **lg: (1024px)**: Desktop and up

#### Grid Patterns
```tsx
// 1 column mobile, 2 tablet, 3 desktop
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

// 1 column mobile, 2 tablet, 4 desktop (footer)
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">

// Flex that wraps on mobile
<div className="flex flex-col md:flex-row gap-4">
```

### 9. Performance Rules

#### Image Optimization
- Use Next/Image for all images
- Specify width/height to prevent layout shift
- Use appropriate image formats (AVIF > WebP > JPG)
- Lazy load images below the fold (automatic with Next/Image)

#### Code Splitting
- Use dynamic imports for large components
- Keep Server Components where possible
- Minimize 'use client' components

#### Bundle Size
- Import only what you need from libraries
- Use tree-shakeable libraries (like Lucide React)
- Avoid large dependencies

### 10. Accessibility Rules

#### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Use `<button>` for actions, `<a>` for navigation
- Use `<nav>` for navigation sections
- Use `<main>` for main content

#### ARIA Labels
```tsx
// For icon-only buttons
<button aria-label="Close menu">
  <X className="w-6 h-6" />
</button>

// For social links
<a href="..." aria-label="Facebook">
  <FacebookIcon />
</a>
```

#### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Maintain logical tab order
- Show focus states on interactive elements

### 11. SEO Rules

#### Page Metadata
```tsx
// In each page.tsx or layout.tsx
export const metadata = {
  title: 'Page Title | Garrit & Wulf',
  description: 'Page description for SEO',
  openGraph: {
    title: 'Page Title',
    description: 'Page description',
    images: ['/images/og-image.jpg'],
  },
};
```

#### Content Structure
- One h1 per page
- Logical heading hierarchy
- Descriptive alt text for images
- Internal linking between pages

### 12. Error Handling Rules

#### Error Boundaries
- Use error.tsx for page-level errors
- Use global-error.tsx for root-level errors
- Provide helpful error messages
- Log errors for debugging

#### Loading States
- Use loading.tsx for async route loading
- Show loading spinners for form submissions
- Show skeleton loaders for dynamic content

### 13. API Route Rules

#### Response Format
```typescript
// Success
return NextResponse.json({ 
  success: true, 
  data: result 
});

// Error
return NextResponse.json({ 
  success: false, 
  error: 'Error message' 
}, { status: 400 });
```

#### Validation
- Always validate input on server side
- Return meaningful error messages
- Use proper HTTP status codes
- Handle errors gracefully

### 14. Git Commit Rules

#### Commit Message Format
```
type(scope): description

Examples:
feat(contact): add contact form validation
fix(footer): correct social media links
style(homepage): update hero section colors
docs(readme): update installation instructions
```

#### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `style`: Visual changes
- `refactor`: Code restructuring
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

### 15. Testing Rules

#### Before Committing
- [ ] Check all pages load without errors
- [ ] Test navigation between pages
- [ ] Verify responsive design on multiple sizes
- [ ] Check console for errors/warnings
- [ ] Verify all images load correctly
- [ ] Test forms if modified

#### Before Deploying
- [ ] Run `npm run build` successfully
- [ ] Test production build locally
- [ ] Run Lighthouse audit
- [ ] Test on real mobile devices
- [ ] Verify all links work
- [ ] Check loading speeds

## Phase Implementation Rules

### Documentation First Approach
- **All 9 phases are fully documented** in `docs/04-Implementation/`
- **Always read phase documentation** before starting implementation
- **Follow task order** as specified in documentation
- **Update progress tracking** in phase document as you complete tasks

### Implementation Workflow
1. **Read Memory Bank** at start of session
2. **Review Phase Document** (e.g., Phase-3-Product-Management.md)
3. **Install Required Libraries** listed in documentation
4. **Implement Tasks Sequentially** following the guide
5. **Test Each Task** before moving to next
6. **Mark Tasks Complete** in documentation
7. **Update Memory Bank** at end of session

### Phase Priority Order
1. ✅ **Phase 1**: Foundation (COMPLETE)
2. ✅ **Phase 2**: Admin UI (COMPLETE)
3. 🔥 **Phase 3**: Product Management (NEXT - HIGH PRIORITY)
4. 🟡 **Phase 4**: Category Management (MEDIUM)
5. 🔵 **Phase 5**: CMS/Theme Builder (LOW)
6. 🟡 **Phase 6**: Order Management (MEDIUM)
7. 🔵 **Phase 7**: Analytics Dashboard (LOW)
8. 🔵 **Phase 8**: User Management (LOW)
9. 🔵 **Phase 9**: Site Settings (LOW)

### Reference Documents
- **Project Roadmap**: `docs/PROJECT-ROADMAP.md`
- **Phase Completion Summary**: `docs/ALL-PHASES-DOCUMENTATION-COMPLETE.md`
- **Individual Phase Docs**: `docs/04-Implementation/Phase-X-*.md`

---

## Critical Rules to Never Break

### ❌ NEVER
1. Use blue colors (project uses maroon theme)
2. Add Header/Footer inside individual pages (use Layout)
3. Commit sensitive data (.env files)
4. Use `<img>` instead of Next/Image
5. Skip alt text on images
6. Use custom CSS instead of Tailwind
7. Deploy without testing build
8. Hard-code API URLs (use environment variables)
9. Start implementing without reading phase documentation
10. Skip updating Memory Bank after major work

### ✅ ALWAYS
1. Use maroon (#6e0000) for primary actions
2. Test on mobile before considering complete
3. Validate forms on server side
4. Use TypeScript types for props
5. Include loading and error states
6. Optimize images before adding
7. Follow the established component patterns
8. Keep accessibility in mind
9. Read phase documentation before starting implementation
10. Update Memory Bank at completion of work session
