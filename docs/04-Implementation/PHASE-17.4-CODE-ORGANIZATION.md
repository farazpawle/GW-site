# Phase 17.4: Code Organization & Architecture (Simplified for Showcase Site)

**Status:** Planning  
**Priority:** Low  
**Start Date:** When needed  
**Estimated Duration:** 3-4 days (minimal refactoring)  
**Parent Phase:** Phase 17 - Comprehensive System Improvements  
**Prerequisites:** None (independent task)  
**Can run parallel with:** Any other phase

---

## Overview

This sub-phase focuses on two small improvements for better maintainability: centralizing validation schemas and adding custom error classes. The original plan included service layers, repositories, DI containers, and Storybook - all unnecessary for a showcase website.

---

## Current State (Already Good)

✅ **18+ UI components** in `src/components/ui/` with consistent styling  
✅ **Compound component patterns** already used (Card with CardHeader, CardTitle, etc.)  
✅ **Design tokens** defined in `tailwind.config.ts` (brand colors, spacing, etc.)  
✅ **Component variants** working (Button: primary/secondary, sizes: sm/md/lg)  
✅ **Try/catch error handling** in all API routes  
✅ **Zod validation** working in API routes  

---

## Problems Being Addressed

1. ⚠️ Inline validation schemas scattered across API routes (duplication)
2. ⚠️ Generic error handling (no custom error classes)
3. ✅ ~~Duplicate color definitions~~ (already solved with Tailwind config)
4. ✅ ~~Component composition~~ (already using compound components)
5. ❌ ~~Service layer needed~~ (NOT needed - showcase site, not e-commerce)
6. ❌ ~~Repository pattern~~ (NOT needed - direct Prisma calls are fine)
7. ❌ ~~DI container~~ (NOT needed - over-engineering for showcase)

---

## Implementation Tasks

### Task A: Validation Schema Consolidation (2 days)

**Objective:** Centralize Zod schemas to reduce duplication across API routes

**Current Problem:**
- Validation schemas defined inline in each API route
- `partSchema` in `/api/parts/route.ts`
- `quoteRequestSchema` in `/api/quote-requests/route.ts`
- Duplication and no reusability

**Steps:**

1. **Create validation folder structure** (30 min)
   ```
   src/lib/validation/
     schemas/
       part.schema.ts
       quote.schema.ts
       base.schema.ts
     index.ts
   ```

2. **Create base schemas** (1 hour)
   - File: `src/lib/validation/schemas/base.schema.ts`
   - Common reusable schemas:
     ```typescript
     import { z } from 'zod';
     
     export const emailSchema = z.string().email().max(100);
     export const slugSchema = z.string().min(2).max(200)
       .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
     export const paginationSchema = z.object({
       page: z.number().int().positive().default(1),
       limit: z.number().int().positive().max(100).default(12),
     });
     ```

3. **Move part validation schemas** (2 hours)
   - File: `src/lib/validation/schemas/part.schema.ts`
   - Move from inline to dedicated file
   - Export: `partCreateSchema`, `partUpdateSchema`, `partFilterSchema`

4. **Move quote request schemas** (1 hour)
   - File: `src/lib/validation/schemas/quote.schema.ts`
   - Move from inline definitions
   - Export: `quoteRequestSchema`, `updateQuoteRequestSchema`

5. **Create barrel export** (15 min)
   - File: `src/lib/validation/index.ts`
   - Export all schemas from one place
   ```typescript
   export * from './schemas/base.schema';
   export * from './schemas/part.schema';
   export * from './schemas/quote.schema';
   ```

6. **Update API routes** (3 hours)
   - Replace inline schemas with imports
   - Example:
     ```typescript
     // Before
     const partSchema = z.object({...});
     
     // After
     import { partCreateSchema } from '@/lib/validation';
     ```
   - Update all routes using schemas

**Acceptance Criteria:**
- [ ] All validation schemas in `src/lib/validation/schemas/`
- [ ] Base schemas created for common patterns
- [ ] Barrel export for clean imports
- [ ] API routes updated to import schemas
- [ ] No inline validation schemas remaining
- [ ] Type-safe validation results

---

### Task B: Custom Error Classes (1-2 days)

**Objective:** Replace generic errors with typed error classes for better error handling

**Current Problem:**
- Generic `Error` objects in API routes
- No standardized error response format
- Inconsistent status codes

**Steps:**

1. **Create error classes** (1 hour)
   - File: `src/lib/errors.ts`
   ```typescript
   export class AppError extends Error {
     constructor(
       public message: string,
       public statusCode: number,
       public code: string,
       public details?: any
     ) {
       super(message);
       this.name = this.constructor.name;
     }
   }
   
   export class ValidationError extends AppError {
     constructor(message: string, details?: any) {
       super(message, 400, 'VALIDATION_ERROR', details);
     }
   }
   
   export class NotFoundError extends AppError {
     constructor(message: string, code?: string) {
       super(message, 404, code || 'NOT_FOUND');
     }
   }
   
   export class UnauthorizedError extends AppError {
     constructor(message: string = 'Unauthorized') {
       super(message, 401, 'UNAUTHORIZED');
     }
   }
   
   export class ConflictError extends AppError {
     constructor(message: string, code?: string) {
       super(message, 409, code || 'CONFLICT');
     }
   }
   ```

2. **Create error handler utility** (2 hours)
   - File: `src/lib/error-handler.ts`
   - Consistent error response format:
   ```typescript
   export function handleApiError(error: unknown) {
     if (error instanceof AppError) {
       return Response.json(
         {
           success: false,
           error: {
             code: error.code,
             message: error.message,
             details: error.details,
           }
         },
         { status: error.statusCode }
       );
     }
     
     // Zod validation errors
     if (error instanceof z.ZodError) {
       return Response.json(
         {
           success: false,
           error: {
             code: 'VALIDATION_ERROR',
             message: 'Validation failed',
             details: error.errors,
           }
         },
         { status: 400 }
       );
     }
     
     // Generic errors
     console.error('Unexpected error:', error);
     return Response.json(
       {
         success: false,
         error: {
           code: 'INTERNAL_ERROR',
           message: 'An unexpected error occurred',
         }
       },
       { status: 500 }
     );
   }
   ```

3. **Update API routes** (4 hours)
   - Replace generic errors with custom classes
   - Use `handleApiError` for consistent responses
   - Example:
   ```typescript
   // Before
   if (!product) {
     return Response.json({ error: 'Not found' }, { status: 404 });
   }
   
   // After
   if (!product) {
     throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
   }
   
   // Catch block
   } catch (error) {
     return handleApiError(error);
   }
   ```

**Acceptance Criteria:**
- [ ] Error classes created in `src/lib/errors.ts`
- [ ] Error handler utility in `src/lib/error-handler.ts`
- [ ] All API routes use custom error classes
- [ ] Consistent error response format across all routes
- [ ] Proper HTTP status codes for each error type

---

### Things to Defer/Skip

❌ **Service Layer Architecture** - NOT needed for showcase site  
- No OrderService, InventoryService, PriceService (not e-commerce)
- No Repository pattern (direct Prisma calls are simpler)
- No DI container (over-engineering)
- No Use Cases (too complex for showcase CRUD)

❌ **Storybook Setup** - NOT valuable  
- Only 18 components, already consistent
- Design already working well
- Overhead not worth it

❌ **Design Tokens in separate file** - NOT needed  
- `tailwind.config.ts` already serves this purpose
- Brand colors already centralized
- No duplication issues

❌ **Headless Components** - NOT needed  
- Current components are simple enough
- No need for logic/UI separation

❌ **Complex Error Logging** - NOT needed  
- `console.error` is sufficient for showcase site
- No external logging service required

---

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Proper interface definitions
- Generic types where appropriate

### Validation
- All schemas in dedicated files
- Use Zod for type-safe validation
- Reusable base schemas
- Clear error messages

### Error Handling
- Use custom error classes
- Consistent error response format
- Appropriate HTTP status codes
- Log errors with context

---

## File Structure After Implementation

```
src/
  lib/
    validation/
      schemas/
        base.schema.ts      # Common reusable schemas
        part.schema.ts      # Part validation
        quote.schema.ts     # Quote request validation
      index.ts              # Barrel exports
    errors.ts               # Custom error classes
    error-handler.ts        # Error handling utility
  app/api/                  # API routes use schemas
```

---

## Success Metrics

### Code Organization
- ✅ No duplicate validation schemas
- ✅ Consistent error handling across all routes
- ✅ Type-safe validation with Zod
- ✅ Clear, maintainable code structure

### Maintainability
- Faster API route development
- Easier to update validation rules
- Consistent error responses
- Better error debugging

---

## Dependencies

None - uses existing dependencies:
- `zod` (already installed)
- TypeScript (already configured)

---

## Files to Create

### Validation
- `src/lib/validation/schemas/base.schema.ts`
- `src/lib/validation/schemas/part.schema.ts`
- `src/lib/validation/schemas/quote.schema.ts`
- `src/lib/validation/index.ts`

### Error Handling
- `src/lib/errors.ts`
- `src/lib/error-handler.ts`

**Total: 6 new files**

---

## Testing Checklist

- [ ] Validation schemas tested with valid data
- [ ] Validation schemas tested with invalid data
- [ ] Error classes throw correct status codes
- [ ] Error handler formats responses correctly
- [ ] All API routes use new schemas
- [ ] All API routes use error handler
- [ ] No regression in existing functionality

---

## Next Phase

After completing Phase 17.4, proceed to:
- **Phase 17.5: Critical Features** (if applicable to showcase site)

---

**Last Updated:** November 1, 2025  
**Status:** Simplified for showcase site - ready when needed
