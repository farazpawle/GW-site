# Product Context: Garrit & Wulf Website

## Why This Project Exists

### Business Model Clarification (Updated Nov 2, 2025)
**CRITICAL**: Garrit & Wulf is a **showcase/portfolio website**, NOT an e-commerce website.

**What This Means**:
- Primary purpose: Display product catalog for visibility and brand awareness
- Secondary purpose: Generate B2B inquiries and quote requests
- NO shopping cart, checkout, or online payments
- NO product reviews or ratings (B2B decisions happen offline)
- NO inventory alerts or stock management for customers
- Pricing shown for informational purposes only
- Customers contact directly via phone, email, or quote request form

**Why This Matters**:
- Admin dashboard should focus on engagement metrics, not sales
- Success measured by: page views, product views, inquiries, quote requests
- Inventory tracking needed (for internal use), but no "out of stock = can't buy" logic
- Analytics should track catalog quality and visitor engagement, not revenue
- Implementation plans must exclude e-commerce features (carts, reviews, checkout flows)
- Focus on lead generation, not transaction processing

**Impact on Development** (Realized Nov 2, 2025):
- Phase 17 documentation originally written for e-commerce model
- Required aggressive cleanup: removed shopping carts, product reviews, Algolia search, inventory alerts, comparison features
- Time savings: 17-20 weeks of planned e-commerce work → 3-4 weeks of showcase-relevant work
- Key insight: Most e-commerce "must-haves" are unnecessary for showcase/inquiry model

### Business Problems Solved
1. **Online Presence**: Garrit & Wulf needed a professional digital presence to compete in the modern auto parts market
2. **Product Catalog Visibility**: Required a searchable, browsable catalog of auto parts for customers to review
3. **Inquiry Generation**: Needed an efficient way for customers to request quotes and submit inquiries
4. **Brand Identity**: Required consistent visual branding to establish trust and professionalism
5. **Information Access**: Customers needed easy access to company location, contact details, and business hours
6. **Product Specifications**: Showcase detailed product information, certifications, compatibility, and technical specs

### User Journey

#### Primary User Flow (Showcase Model)
1. **Discovery** → User lands on homepage via search or referral
2. **Browse Catalog** → Views product categories and individual products
3. **Product Details** → Reviews specifications, compatibility, certifications, pricing
4. **Engagement** → User engages through one of these paths:
   - Request quote via product page
   - Submit contact inquiry
   - Call/email directly
   - Visit physical location
5. **Conversion** → Contacts company to discuss purchase (NOT online checkout)

#### Secondary User Flows
- Direct contact from homepage quick-contact sections
- Product category browsing from navigation
- Product search and filtering
- Social media engagement via footer links
- Location finding via Google Maps embed
- Download product specifications (PDFs)
- Watch product videos

#### Admin User Journey
1. **Dashboard** → View engagement metrics (page views, product views, inquiries)
2. **Product Management** → Add/edit products with showcase metadata
3. **Inquiry Management** → Review and respond to contact messages and quote requests
4. **Catalog Quality** → Monitor products needing attention (missing descriptions, images)
5. **Analytics** → Track visitor engagement and catalog completion

## How It Should Work

### Core Features (Public Site)
1. **Homepage**: Engaging hero with dual CTAs, animated statistics, brand story, category cards, and precision manufacturing showcase
2. **Navigation**: Persistent header with logo, main menu, and contact button
3. **Product Catalog**: Searchable, filterable product list with showcase mode (pricing visible for info only)
4. **Product Details**: Rich product pages with specs, compatibility, videos, PDFs, related products
5. **About Page**: Company mission, vision, values, and "Why Choose Us" section
6. **Contact Page**: Hero section, quick contact cards, interactive form, and map embed
7. **Footer**: Comprehensive site links, contact info, social media, and product categories

### Core Features (Admin Dashboard)
1. **Engagement Metrics**: Page views, product views, visitor trends (NOT revenue/sales)
2. **Inquiry Management**: Track contact messages and quote requests
3. **Activity Timeline**: Recent admin actions (product updates, new categories, etc.)
4. **Product Performance**: Top viewed products, products needing attention
5. **Catalog Quality**: Completion metrics (products with descriptions, images, specs)
6. **Quick Actions**: Common admin tasks with keyboard shortcuts

### Design Philosophy
- **Dark & Premium**: Black backgrounds (#0a0a0a, #1a1a1a) convey sophistication
- **Maroon Accent**: #6e0000 provides brand recognition and contrast
- **Card-Based Layout**: Modern card designs with borders and hover effects
- **Smooth Interactions**: Subtle animations and transitions enhance UX
- **Mobile-First**: Responsive grid layouts that adapt to all screen sizes

### User Experience Goals
- **Fast**: Optimized images and efficient code for quick loading
- **Clear**: Obvious navigation and calls-to-action
- **Professional**: Polished design that builds trust
- **Accessible**: Easy-to-read typography and clear color contrast
- **Engaging**: Interactive elements that invite exploration
- **Informative**: Rich product details without overwhelming users

## Content Strategy

### Key Messages (Public Site)
1. **Quality**: "Precision-Manufactured Auto Parts" and "Superior Parts"
2. **Experience**: References to years of excellence and industry leadership
3. **Range**: European, American, and Truck parts coverage
4. **Trust**: EGH membership and professional presentation
5. **Accessibility**: Clear contact information and location
6. **Expertise**: Detailed product specifications and compatibility information

### Key Metrics (Admin Dashboard)
1. **Engagement**: Page views, product views, time on site
2. **Inquiries**: Contact form submissions, quote requests
3. **Catalog**: Products added, updated, views per product
4. **Quality**: Products with complete info (description, images, specs)
5. **Activity**: Admin actions (updates, additions, deletions)

### Visual Hierarchy
- **Primary**: Hero sections with large headings and CTAs
- **Secondary**: Feature cards with icons and descriptions
- **Tertiary**: Supporting text and links
- **Accents**: Maroon highlights for important actions

## Success Metrics

### Public Site Metrics
- **Engagement**: Page views, unique visitors, time on site, bounce rate
- **Product Interest**: Product page views, top viewed products, search queries
- **Lead Generation**: Contact form submissions, quote requests, phone calls
- **Catalog Growth**: New products added, products updated, catalog completeness

### Admin Dashboard Metrics
- **Visitor Engagement**: Daily/weekly/monthly page views and product views
- **Inquiry Conversion**: Contact messages and quote requests per visitor
- **Catalog Quality**: Percentage of products with complete information
- **Admin Activity**: Product updates, new categories, system usage

### What We DON'T Measure
- ❌ Revenue (this is NOT an e-commerce site)
- ❌ Sales (no online checkout)
- ❌ Cart abandonment (no shopping cart)
- ❌ Conversion rate to purchase (purchases happen offline)
- ❌ Average order value (no orders)

## Technical Requirements

### Performance Targets
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.0s
- Cumulative Layout Shift: <0.1

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

### Accessibility Standards
- Semantic HTML structure
- Alt text for all images
- Keyboard navigation support
- ARIA labels where appropriate
- Sufficient color contrast ratios
