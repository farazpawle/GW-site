# Phase 17.8: Development Workflow & Testing

**Status:** Planning  
**Priority:** Medium  
**Start Date:** Week 10  
**Estimated Duration:** 2 weeks  
**Parent Phase:** Phase 17 - Comprehensive System Improvements  
**Prerequisites:** Phase 17.1 (Security) completed

---

## Overview

This sub-phase establishes robust development workflows, comprehensive testing infrastructure, CI/CD pipeline, and API documentation. These improvements will increase code quality, reduce bugs, and streamline the development process.

---

## Problems Being Addressed

1. Minimal test coverage
2. Incomplete Docker configuration
3. Missing API documentation
4. No clear branching/versioning strategy
5. No automated deployment pipeline
6. Inconsistent code quality
7. Manual testing processes
8. No performance budgets enforced

---

## Implementation Tasks

### Task 1: Testing Infrastructure Setup (Days 1-4)

**Objective:** Establish comprehensive testing framework

**Steps:**

1. **Configure Jest for Unit Tests (Day 1)**
   - Already configured, verify setup
   - File: `jest.config.ts`
   - Update configuration:
     ```typescript
     export default {
       preset: 'ts-jest',
       testEnvironment: 'node',
       coverageDirectory: 'coverage',
       collectCoverageFrom: [
         'src/**/*.{js,jsx,ts,tsx}',
         '!src/**/*.d.ts',
         '!src/**/*.stories.tsx',
         '!src/**/*.test.tsx',
       ],
       coverageThreshold: {
         global: {
           branches: 80,
           functions: 80,
           lines: 80,
           statements: 80,
         },
       },
       moduleNameMapper: {
         '^@/(.*)$': '<rootDir>/src/$1',
       },
     };
     ```

2. **Set Up React Testing Library (Day 1)**
   - Install if needed:
     ```
     npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
     ```
   - Update jest.setup.ts:
     ```typescript
     import '@testing-library/jest-dom';
     ```

3. **Create Test Utilities (Day 1-2)**
   - File: `__tests__/utils/test-utils.tsx`
   ```typescript
   import { render, RenderOptions } from '@testing-library/react';
   import { ReactElement } from 'react';
   
   // Add providers (Theme, Auth, etc.)
   const AllTheProviders = ({ children }) => {
     return (
       <ThemeProvider>
         <SessionProvider>
           {children}
         </SessionProvider>
       </ThemeProvider>
     );
   };
   
   const customRender = (
     ui: ReactElement,
     options?: Omit<RenderOptions, 'wrapper'>,
   ) => render(ui, { wrapper: AllTheProviders, ...options });
   
   export * from '@testing-library/react';
   export { customRender as render };
   ```
   
   - File: `__tests__/utils/mock-data.ts`
   - Common test data factories

4. **Write Service Tests (Day 2-3)**
   - Test all services from Phase 17.2, 17.4, 17.5
   - Examples:
     - `__tests__/services/PriceService.test.ts`
     - `__tests__/services/InventoryService.test.ts`
     - `__tests__/services/CartService.test.ts`
   - Aim for 90%+ coverage on services
   - Mock Prisma with jest-mock-extended

5. **Write Component Tests (Day 3)**
   - Test critical UI components
   - Examples:
     - `__tests__/components/Button.test.tsx`
     - `__tests__/components/CartIcon.test.tsx`
     - `__tests__/components/ProductCard.test.tsx`
   - Test:
     - Rendering
     - User interactions
     - Props handling
     - Conditional rendering

6. **Set Up Integration Tests (Day 3-4)**
   - Test API routes
   - File: `__tests__/integration/api/products.test.ts`
   - Use supertest:
     ```
     npm install -D supertest @types/supertest
     ```
   - Example:
     ```typescript
     import request from 'supertest';
     
     describe('GET /api/products', () => {
       it('returns products list', async () => {
         const res = await request(app)
           .get('/api/products')
           .expect(200);
         
         expect(res.body.data).toBeInstanceOf(Array);
         expect(res.body.pagination).toBeDefined();
       });
     });
     ```

7. **Configure Test Database (Day 4)**
   - Separate test database
   - File: `.env.test`
   - Reset database before each test suite
   - Seed test data
   - File: `__tests__/setup/test-db.ts`

**Acceptance Criteria:**
- [ ] Jest configured with coverage thresholds
- [ ] React Testing Library set up
- [ ] Test utilities created
- [ ] Service tests written (90%+ coverage)
- [ ] Component tests written (key components)
- [ ] Integration tests for API routes
- [ ] Test database configured
- [ ] All tests passing

---

### Task 2: End-to-End Testing with Playwright (Days 5-7)

**Objective:** Implement E2E tests for critical user flows

**Steps:**

1. **Install Playwright (Day 5)**
   ```
   npm install -D @playwright/test
   npx playwright install
   ```
   - File: `playwright.config.ts`
   ```typescript
   export default defineConfig({
     testDir: './e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: 'html',
     use: {
       baseURL: 'http://localhost:3000',
       trace: 'on-first-retry',
       screenshot: 'only-on-failure',
     },
     projects: [
       { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
       { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
       { name: 'webkit', use: { ...devices['Desktop Safari'] } },
       { name: 'mobile', use: { ...devices['iPhone 13'] } },
     ],
     webServer: {
       command: 'npm run dev',
       url: 'http://localhost:3000',
       reuseExistingServer: !process.env.CI,
     },
   });
   ```

2. **Create E2E Test Helpers (Day 5)**
   - File: `e2e/helpers/auth.ts`
   - Login helper
   - Session management
   - Test user creation

3. **Write Critical Path Tests (Day 5-6)**
   
   **Test 1: Product Browsing**
   - File: `e2e/product-browsing.spec.ts`
   - Navigate to products page
   - Filter by category
   - Sort products
   - View product details
   
   **Test 2: Search Flow**
   - File: `e2e/search.spec.ts`
   - Search for product
   - Verify results
   - Click result
   - Verify product page
   
   **Test 3: Cart Operations**
   - File: `e2e/cart.spec.ts`
   - Add product to cart
   - Update quantity
   - Remove item
   - Verify cart total
   
   **Test 4: Checkout (if implemented)**
   - File: `e2e/checkout.spec.ts`
   - Complete checkout flow
   - Fill shipping info
   - Select payment method
   - Place order
   
   **Test 5: User Authentication**
   - File: `e2e/auth.spec.ts`
   - Register new user
   - Login
   - Logout
   - Password reset flow
   
   **Test 6: Product Review**
   - File: `e2e/review.spec.ts`
   - Login
   - Navigate to product
   - Write review
   - Submit review
   - Verify review appears

4. **Mobile E2E Tests (Day 6-7)**
   - Repeat critical tests on mobile viewport
   - Test touch interactions
   - Test mobile navigation
   - Verify responsive layouts

5. **Visual Regression Tests (Day 7)**
   - Screenshot comparison
   - Configure visual testing
   - Key pages to test:
     - Home page
     - Product listing
     - Product detail
     - Cart page
     - Checkout flow

**Acceptance Criteria:**
- [ ] Playwright configured
- [ ] E2E test helpers created
- [ ] Critical user flows tested
- [ ] Mobile tests passing
- [ ] Visual regression tests set up
- [ ] Tests run in CI
- [ ] Test reports generated

---

### Task 3: CI/CD Pipeline (Days 8-10)

**Objective:** Automate testing, building, and deployment

**Steps:**

1. **Set Up GitHub Actions (Day 8)**
   - File: `.github/workflows/ci.yml`
   ```yaml
   name: CI
   
   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main, develop]
   
   jobs:
     lint:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - run: npm run lint
   
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - run: npm run test:coverage
         - uses: codecov/codecov-action@v3
   
     e2e:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - run: npx playwright install --with-deps
         - run: npm run test:e2e
         - uses: actions/upload-artifact@v3
           if: always()
           with:
             name: playwright-report
             path: playwright-report/
   
     build:
       runs-on: ubuntu-latest
       needs: [lint, test]
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - run: npm run build
   ```

2. **Set Up Deployment Workflow (Day 8-9)**
   - File: `.github/workflows/deploy.yml`
   ```yaml
   name: Deploy
   
   on:
     push:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - run: npm run build
         - name: Deploy to Vercel
           uses: amondnet/vercel-action@v20
           with:
             vercel-token: ${{ secrets.VERCEL_TOKEN }}
             vercel-org-id: ${{ secrets.ORG_ID }}
             vercel-project-id: ${{ secrets.PROJECT_ID }}
             vercel-args: '--prod'
   ```

3. **Branch Protection Rules (Day 9)**
   - Require PR reviews
   - Require status checks:
     - Lint must pass
     - Tests must pass
     - Build must succeed
   - No direct pushes to main
   - Require linear history

4. **Environment Management (Day 9)**
   - Development environment (auto-deploy from develop)
   - Staging environment (auto-deploy from staging)
   - Production environment (manual approve from main)
   - Configure environment secrets

5. **Deployment Notifications (Day 9-10)**
   - Slack/Discord notifications
   - Email on deployment failure
   - Success notifications

6. **Rollback Strategy (Day 10)**
   - Document rollback procedure
   - Keep 3 previous versions
   - Quick rollback script
   - File: `scripts/rollback.sh`

7. **Performance Budgets in CI (Day 10)**
   - Lighthouse CI
   - Fail build if budgets exceeded
   - File: `lighthouserc.js`
   ```javascript
   module.exports = {
     ci: {
       collect: {
         url: ['http://localhost:3000/'],
         numberOfRuns: 3,
       },
       assert: {
         assertions: {
           'categories:performance': ['error', {minScore: 0.9}],
           'categories:accessibility': ['error', {minScore: 0.9}],
           'categories:seo': ['error', {minScore: 0.9}],
         },
       },
       upload: {
         target: 'temporary-public-storage',
       },
     },
   };
   ```

**Acceptance Criteria:**
- [ ] CI pipeline configured
- [ ] All tests run on PR
- [ ] Build verification on PR
- [ ] Auto-deploy to staging
- [ ] Manual deploy to production
- [ ] Branch protection enabled
- [ ] Performance budgets enforced
- [ ] Rollback procedure documented

---

### Task 4: API Documentation (Days 11-12)

**Objective:** Generate comprehensive API documentation

**Steps:**

1. **Install Swagger/OpenAPI Tools (Day 11)**
   ```
   npm install swagger-jsdoc swagger-ui-express
   npm install -D @types/swagger-jsdoc @types/swagger-ui-express
   ```

2. **Configure Swagger (Day 11)**
   - File: `src/lib/swagger.ts`
   ```typescript
   import swaggerJsdoc from 'swagger-jsdoc';
   
   const options = {
     definition: {
       openapi: '3.0.0',
       info: {
         title: 'Your API Documentation',
         version: '1.0.0',
         description: 'API documentation for the e-commerce platform',
       },
       servers: [
         {
           url: 'http://localhost:3000',
           description: 'Development server',
         },
         {
           url: 'https://yourdomain.com',
           description: 'Production server',
         },
       ],
     },
     apis: ['./src/app/api/**/*.ts'],
   };
   
   export const swaggerSpec = swaggerJsdoc(options);
   ```

3. **Document API Routes (Day 11-12)**
   - Add JSDoc comments to all routes
   - Example:
     ```typescript
     /**
      * @swagger
      * /api/products:
      *   get:
      *     summary: Get all products
      *     tags: [Products]
      *     parameters:
      *       - in: query
      *         name: page
      *         schema:
      *           type: integer
      *         description: Page number
      *       - in: query
      *         name: limit
      *         schema:
      *           type: integer
      *         description: Items per page
      *     responses:
      *       200:
      *         description: List of products
      *         content:
      *           application/json:
      *             schema:
      *               type: object
      *               properties:
      *                 data:
      *                   type: array
      *                   items:
      *                     $ref: '#/components/schemas/Product'
      *                 pagination:
      *                   $ref: '#/components/schemas/Pagination'
      */
     ```

4. **Create Swagger UI Page (Day 12)**
   - File: `src/app/api/docs/route.ts`
   - Serve Swagger UI
   - Protect with authentication in production

5. **Document Request/Response Schemas (Day 12)**
   - Define schemas for all entities
   - Document validation rules
   - Example responses
   - Error responses

6. **Generate Postman Collection (Day 12)**
   - Export OpenAPI spec
   - Import into Postman
   - Share with team

**Acceptance Criteria:**
- [ ] Swagger configured
- [ ] All API routes documented
- [ ] Schemas defined
- [ ] Swagger UI accessible
- [ ] Request/response examples included
- [ ] Postman collection generated

---

### Task 5: Git Workflow & Code Quality (Days 13-14)

**Objective:** Establish consistent development workflow

**Steps:**

1. **Git Flow Setup (Day 13)**
   - Branches:
     - `main` - Production
     - `staging` - Pre-production
     - `develop` - Development
     - `feature/*` - New features
     - `bugfix/*` - Bug fixes
     - `hotfix/*` - Production hotfixes
   - Document in README

2. **Commit Message Convention (Day 13)**
   - Use Conventional Commits
   - Install commitlint:
     ```
     npm install -D @commitlint/cli @commitlint/config-conventional
     ```
   - File: `.commitlintrc.json`
   ```json
   {
     "extends": ["@commitlint/config-conventional"],
     "rules": {
       "type-enum": [
         2,
         "always",
         [
           "feat",
           "fix",
           "docs",
           "style",
           "refactor",
           "test",
           "chore"
         ]
       ]
     }
   }
   ```

3. **Pre-commit Hooks (Day 13)**
   - Install Husky:
     ```
     npm install -D husky lint-staged
     npx husky install
     ```
   - File: `.husky/pre-commit`
   ```bash
   #!/bin/sh
   . "$(dirname "$0")/_/husky.sh"
   
   npx lint-staged
   ```
   - File: `.lintstagedrc.json`
   ```json
   {
     "*.{js,jsx,ts,tsx}": [
       "eslint --fix",
       "prettier --write"
     ],
     "*.{json,md}": [
       "prettier --write"
     ]
   }
   ```

4. **PR Template (Day 13-14)**
   - File: `.github/PULL_REQUEST_TEMPLATE.md`
   ```markdown
   ## Description
   <!-- Describe your changes -->
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Checklist
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No TypeScript errors
   - [ ] No ESLint errors
   - [ ] Tested locally
   
   ## Screenshots (if applicable)
   
   ## Related Issues
   Closes #
   ```

5. **Code Review Guidelines (Day 14)**
   - Document in `docs/code-review-guide.md`
   - Review checklist
   - Best practices
   - Common pitfalls

6. **Versioning Strategy (Day 14)**
   - Semantic versioning (SemVer)
   - Automated changelog generation
   - Release process documentation
   - File: `docs/release-process.md`

**Acceptance Criteria:**
- [ ] Git flow documented
- [ ] Commit conventions enforced
- [ ] Pre-commit hooks configured
- [ ] PR template created
- [ ] Code review guidelines documented
- [ ] Versioning strategy defined
- [ ] Release process documented

---

## Docker Configuration Completion

### Development Docker Setup
- File: `docker-compose.dev.yml`
- Services:
  - Next.js app (hot reload)
  - PostgreSQL
  - Redis
  - MinIO (S3-compatible storage)
- Volume mounting for development
- Environment variable management

### Production Docker Setup
- File: `Dockerfile` (multi-stage build)
- Optimized image size
- Security best practices
- Health checks
- File: `docker-compose.prod.yml`

---

## Success Metrics

### Testing
- Unit test coverage: > 80%
- Integration test coverage: > 70%
- E2E tests for all critical paths
- Zero flaky tests
- Test execution time < 5 minutes

### CI/CD
- Build success rate: > 95%
- Deployment frequency: Daily to staging
- Failed deployment rollback time: < 5 minutes
- Zero downtime deployments

### Code Quality
- Zero TypeScript errors
- Zero ESLint errors
- 100% commit message compliance
- PR review time < 24 hours

### Documentation
- 100% API routes documented
- All public functions documented
- Architecture diagrams created
- Onboarding time reduced by 50%

---

## Dependencies

### Testing
- Jest, React Testing Library
- Playwright
- Supertest
- jest-mock-extended

### CI/CD
- GitHub Actions
- Vercel (or deployment platform)
- Lighthouse CI

### Documentation
- Swagger/OpenAPI
- swagger-jsdoc
- swagger-ui-express

### Code Quality
- Husky
- lint-staged
- commitlint

---

## Files to Create

### Testing
- `__tests__/utils/test-utils.tsx`
- `__tests__/utils/mock-data.ts`
- `__tests__/services/**/*.test.ts`
- `__tests__/components/**/*.test.tsx`
- `__tests__/integration/**/*.test.ts`
- `e2e/**/*.spec.ts`
- `playwright.config.ts`

### CI/CD
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `lighthouserc.js`
- `scripts/rollback.sh`

### Documentation
- `src/lib/swagger.ts`
- `docs/code-review-guide.md`
- `docs/release-process.md`
- `docs/api-documentation.md`

### Configuration
- `.commitlintrc.json`
- `.lintstagedrc.json`
- `.husky/pre-commit`

---

## Testing Checklist

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Coverage thresholds met
- [ ] CI pipeline runs successfully
- [ ] Deployments work
- [ ] API docs accessible
- [ ] Pre-commit hooks work
- [ ] PR template functional

---

## Next Phase

After completing Phase 17.8, proceed to:
- **Phase 17.9: Configuration & Monitoring**

---

**Last Updated:** November 1, 2025  
**Status:** Ready for implementation
