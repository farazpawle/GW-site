# Ecommerce to Showcase-Only Website Conversion Plan

## Overview
This document outlines the complete plan to convert the Garrit & Wulf website from a full ecommerce platform to a showcase-only website that displays products and services without payment functionality.

**Status**: 📋 Planning Phase  
**Priority**: Medium  
**Estimated Effort**: 2-3 days  
**Impact**: Major architectural change  

---

## Current State Analysis

### ✅ What We Keep (Showcase Features)
- **Product Catalog**: Display products with images, descriptions, and specifications
- **Categories**: Product categorization and filtering
- **Pages System**: About Us, Contact, Services pages
- **Admin Panel**: Content management for products and pages
- **User Authentication**: For admin access and customer inquiries
- **Search Functionality**: Product search and filtering
- **Navigation**: Menu system and site navigation
- **Responsive Design**: Mobile and desktop layouts
- **Settings System**: Site configuration and branding

### ❌ What We Remove (Ecommerce Features)
- **Payment Processing**: Stripe integration, payment intents
- **Shopping Cart**: Cart functionality and session management
- **Order Management**: Order creation, tracking, fulfillment
- **Customer Orders**: Order history and status tracking
- **Inventory Management**: Stock tracking and quantity management
- **Checkout Process**: Payment forms and checkout flows
- **Pricing Display**: Product prices and currency handling
- **Shipping**: Shipping methods and calculations

---

## Implementation Plan

### Phase 1: Database Schema Changes
**Estimated Time**: 4-6 hours

#### Files to Modify:
```
prisma/schema.prisma
```

#### Changes Required:
1. **Remove Tables**:
   - `Order`
   - `OrderItem` 
   - `Cart`
   - `CartItem`
   - `Payment`
   - `ShippingMethod`

2. **Modify Product Model**:
   ```prisma
   model Product {
     // Remove price-related fields
     // Remove inventory fields (stock, quantity)
     // Keep: name, description, images, category, specifications
   }
   ```

3. **Update Relations**:
   - Remove order-related foreign keys
   - Remove cart-related foreign keys
   - Simplify product relationships

#### Migration Script:
```sql
-- Remove ecommerce tables
DROP TABLE IF EXISTS "OrderItem";
DROP TABLE IF EXISTS "Order";
DROP TABLE IF EXISTS "CartItem";
DROP TABLE IF EXISTS "Cart";
DROP TABLE IF EXISTS "Payment";
DROP TABLE IF EXISTS "ShippingMethod";

-- Update Product table
ALTER TABLE "Product" DROP COLUMN IF EXISTS "price";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "stock";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "quantity";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "sku";
```

### Phase 2: Remove API Routes
**Estimated Time**: 2-3 hours

#### Directories to Remove:
```
src/app/api/cart/
src/app/api/checkout/
src/app/api/orders/
src/app/api/payments/
src/app/api/webhooks/stripe/
```

#### Files to Remove:
- `src/app/api/cart/route.ts`
- `src/app/api/cart/[id]/route.ts`
- `src/app/api/checkout/route.ts`
- `src/app/api/orders/**/*`
- `src/app/api/payments/**/*`
- `src/app/api/webhooks/**/*`

### Phase 3: Update Frontend Components
**Estimated Time**: 6-8 hours

#### Components to Remove:
```
src/components/cart/
src/components/checkout/
src/components/payments/
```

#### Components to Modify:
1. **Product Display Components**:
   ```typescript
   // src/components/products/ProductCard.tsx
   // Remove: price display, add to cart button
   // Keep: image, name, description, view details
   
   // src/components/products/ProductDetails.tsx
   // Remove: price, quantity selector, add to cart
   // Add: contact for quote, specifications display
   ```

2. **Navigation Components**:
   ```typescript
   // src/components/ui/Navigation.tsx
   // Remove: cart icon, cart counter
   // Keep: all navigation links
   ```

3. **Header Component**:
   ```typescript
   // src/components/Header.tsx
   // Remove: cart button
   // Enhance: contact button, quote request
   ```

#### New Components to Create:
1. **Quote Request Component**:
   ```typescript
   // src/components/quote/QuoteRequestForm.tsx
   // Purpose: Allow customers to request quotes for products
   ```

2. **Product Inquiry Component**:
   ```typescript
   // src/components/products/ProductInquiry.tsx
   // Purpose: Contact form specific to product inquiries
   ```

### Phase 4: Update Admin Panel
**Estimated Time**: 4-5 hours

#### Admin Pages to Remove:
```
src/app/admin/orders/
src/app/admin/payments/
src/app/admin/analytics/ (payment-related)
```

#### Admin Pages to Modify:
1. **Product Management**:
   ```typescript
   // src/app/admin/products/
   // Remove: price fields, inventory fields
   // Keep: all content management features
   ```

2. **Analytics Dashboard**:
   ```typescript
   // src/app/admin/analytics/
   // Remove: revenue, orders, payment metrics
   // Focus: page views, product views, contact inquiries
   ```

#### Admin Features to Add:
1. **Quote Management**:
   ```typescript
   // src/app/admin/quotes/
   // Purpose: Manage incoming quote requests
   ```

2. **Inquiry Management**:
   ```typescript
   // src/app/admin/inquiries/
   // Purpose: Manage product inquiries and contact forms
   ```

### Phase 5: Update Pages and Routing
**Estimated Time**: 3-4 hours

#### Pages to Remove:
```
src/app/cart/
src/app/checkout/
src/app/orders/
src/app/account/orders/
```

#### Pages to Modify:
1. **Product Pages**:
   ```typescript
   // src/app/products/[slug]/page.tsx
   // Remove: pricing display, cart functionality
   // Add: quote request, detailed specifications
   ```

2. **Category Pages**:
   ```typescript
   // src/app/categories/[slug]/page.tsx
   // Remove: price filtering, sort by price
   // Keep: all other filtering options
   ```

#### New Pages to Create:
1. **Quote Request Page**:
   ```typescript
   // src/app/quote/page.tsx
   // Purpose: Dedicated page for quote requests
   ```

2. **Services Page**:
   ```typescript
   // src/app/services/page.tsx
   // Purpose: Showcase services offered
   ```

### Phase 6: Environment and Configuration
**Estimated Time**: 1-2 hours

#### Remove Environment Variables:
```bash
# .env.local - Remove these variables
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

#### Update Settings:
```typescript
// Remove ecommerce-related settings
// Update site description and meta tags
// Focus on showcase/portfolio messaging
```

### Phase 7: Update Dependencies
**Estimated Time**: 1 hour

#### Remove Dependencies:
```json
// package.json - Remove these packages
{
  "stripe": "^X.X.X",
  "@stripe/stripe-js": "^X.X.X"
}
```

#### Update Scripts:
```json
// Remove payment-related build scripts
// Update database seed scripts
```

---

## New Features to Implement

### 1. Enhanced Product Showcase
- **High-quality image galleries**
- **Detailed specifications**
- **Technical documentation**
- **Application examples**
- **Compatibility information**

### 2. Quote Request System
- **Product-specific quote forms**
- **Bulk quote requests**
- **File upload for technical drawings**
- **Quote tracking for customers**
- **Admin quote management**

### 3. Enhanced Contact System
- **Multiple contact forms** (general, technical, sales)
- **Live chat integration** (optional)
- **Technical support requests**
- **Callback scheduling**

### 4. Content Management
- **Case studies**
- **Technical articles**
- **Product applications**
- **Industry solutions**

---

## Testing Strategy

### 1. Functionality Testing
- [ ] All product pages load without errors
- [ ] Navigation works correctly
- [ ] Search functionality works
- [ ] Contact forms submit successfully
- [ ] Admin panel functions properly

### 2. Data Integrity Testing
- [ ] No orphaned records after cleanup
- [ ] All product data displays correctly
- [ ] User authentication still works
- [ ] Settings system functions

### 3. Performance Testing
- [ ] Page load times improved (less JS/CSS)
- [ ] Database queries optimized
- [ ] No unused API calls

### 4. User Experience Testing
- [ ] Clear call-to-actions for quotes
- [ ] Easy product browsing
- [ ] Effective contact methods
- [ ] Mobile responsiveness

---

## Rollback Plan

### Database Backup
1. **Full database backup** before starting
2. **Schema versioning** for easy rollback
3. **Data export** of critical tables

### Code Backup
1. **Git branch** for conversion work
2. **Tagged release** before changes
3. **Docker image backup** of working version

### Rollback Steps
1. Restore database from backup
2. Checkout previous git commit
3. Restore environment variables
4. Restart application services

---

## Risk Assessment

### High Risk
- **Data loss** during database migration
- **SEO impact** from removed pages
- **User confusion** about new functionality

### Medium Risk
- **Performance degradation** during transition
- **Admin workflow disruption**
- **Third-party integration issues**

### Mitigation Strategies
- **Comprehensive testing** on staging environment
- **Gradual rollout** with feature flags
- **User communication** about changes
- **Staff training** on new workflows

---

## Success Metrics

### Technical Metrics
- [ ] 0 broken links after conversion
- [ ] <3 second page load times
- [ ] 100% functional test pass rate
- [ ] No console errors

### Business Metrics
- [ ] Increased quote requests
- [ ] Improved contact form submissions
- [ ] Better product page engagement
- [ ] Enhanced user session duration

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Planning & Analysis | 1 day | This document |
| Database Changes | 0.5 day | Database backup |
| API Cleanup | 0.5 day | Database complete |
| Frontend Updates | 1.5 days | API cleanup |
| Admin Panel Updates | 1 day | Frontend complete |
| Testing & QA | 0.5 day | All development complete |
| **Total** | **5 days** | - |

---

## Next Steps

1. **Review and approve** this conversion plan
2. **Create staging environment** for testing
3. **Schedule conversion** during low-traffic period
4. **Prepare user communication** about changes
5. **Begin Phase 1** implementation

---

## Notes

- **Preserve all product data** - only remove commerce functionality
- **Maintain admin access** for content management
- **Keep user system** for quote tracking and inquiries
- **Focus on lead generation** rather than direct sales
- **Ensure mobile optimization** throughout conversion

---

*Last Updated: October 13, 2025*  
*Document Version: 1.0*  
*Author: Development Team*