# Console Errors Log

## Error #3: Prisma Decimal Serialization Error (Oct 6, 2025) ✅ FIXED

**Error Message:**
```
Server  Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.
  {price: Decimal, comparePrice: Decimal, ...}

TypeError: product.price.toFixed is not a function
```

**Root Cause:**
- Prisma uses `Decimal` type for price fields to maintain precision
- `Decimal` objects cannot be serialized to Client Components
- `Decimal` objects don't have JavaScript number methods like `.toFixed()`

**Location:**
- Server Components passing product data to Client Components
- API routes returning product data with Decimal fields

**Solution:**
Convert all Prisma `Decimal` objects to plain JavaScript numbers before:
1. Passing to Client Components from Server Components
2. Returning from API routes

**Files Fixed:**
1. `src/app/admin/page.tsx` - Dashboard recent products
2. `src/app/admin/parts/page.tsx` - Product list page
3. `src/app/api/admin/parts/route.ts` - GET and POST endpoints
4. `src/app/api/admin/parts/[id]/route.ts` - GET and PUT endpoints

**Implementation:**
```typescript
// Convert Decimal to number
const serializedPart = {
  ...part,
  price: Number(part.price),
  comparePrice: part.comparePrice ? Number(part.comparePrice) : null,
};
```

**Status:** ✅ Fixed - All Decimal conversions implemented

**Testing:**
- ✅ Create new product - no errors
- ✅ View product list - prices display correctly
- ✅ Edit product - form loads correctly
- ✅ Dashboard recent products - no console errors

---

C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:25630 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
clerk.browser.js:16  Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview
warnOnce @ clerk.browser.js:16
C:\Users\src\client\dev\hot-reloader\app\hot-reloader-app.tsx:278 [Fast Refresh] rebuilding
C:\Users\src\client\dev\hot-reloader\app\hot-reloader-app.tsx:278 [Fast Refresh] rebuilding
C:\Users\rosto\OneDrive\src\client\dev\report-hmr-latency.ts:26 [Fast Refresh] done in 198ms
C:\Users\rosto\OneDrive\src\client\dev\report-hmr-latency.ts:26 [Fast Refresh] done in 368ms
C:\Users\src\client\dev\hot-reloader\app\hot-reloader-app.tsx:278 [Fast Refresh] rebuilding
C:\Users\src\client\dev\hot-reloader\app\hot-reloader-app.tsx:278 [Fast Refresh] rebuilding
C:\Users\rosto\OneDrive\src\client\dev\report-hmr-latency.ts:26 [Fast Refresh] done in 169ms
C:\Users\rosto\OneDrive\src\client\dev\report-hmr-latency.ts:26 [Fast Refresh] done in 323ms
C:\Users\src\client\dev\hot-reloader\app\hot-reloader-app.tsx:278 [Fast Refresh] rebuilding
C:\Users\rosto\OneDrive\src\client\dev\report-hmr-latency.ts:26 [Fast Refresh] done in 789ms
parts/new:1 [Intervention] Images loaded lazily and replaced with placeholders. Load events are deferred. See https://go.microsoft.com/fwlink/?linkid=2048113
C:\Users\src\client\dev\hot-reloader\app\hot-reloader-app.tsx:278 [Fast Refresh] rebuilding
C:\Users\rosto\OneDrive\src\client\dev\report-hmr-latency.ts:26 [Fast Refresh] done in 636ms
C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-server-dom-webpack\cjs\react-server-dom-webpack-client.browser.development.js:3423   Server   ⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000". See https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase
react_stack_bottom_frame @ C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-server-dom-webpack\cjs\react-server-dom-webpack-client.browser.development.js:3423
C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\next-devtools\userspace\app\errors\intercept-console-error.js:62   Server  Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.
  {id: ..., name: ..., slug: ..., description: ..., shortDesc: ..., partNumber: ..., price: Decimal, comparePrice: ..., inStock: ..., stockQuantity: ..., images: ..., specifications: ..., compatibility: ..., categoryId: ..., featured: ..., createdAt: ..., updatedAt: ..., category: ...}
                                                                                            ^^^^^^^
error @ C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\next-devtools\userspace\app\errors\intercept-console-error.js:62
C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\next-devtools\userspace\app\errors\intercept-console-error.js:62   Server  Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.
  {id: ..., name: ..., slug: ..., description: ..., shortDesc: ..., partNumber: ..., price: ..., comparePrice: Decimal, inStock: ..., stockQuantity: ..., images: ..., specifications: ..., compatibility: ..., categoryId: ..., featured: ..., createdAt: ..., updatedAt: ..., category: ...}
                                                                                                               ^^^^^^^
error @ C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\next-devtools\userspace\app\errors\intercept-console-error.js:62
C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\next-devtools\userspace\app\errors\intercept-console-error.js:62   Server  Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.
  {id: ..., name: ..., slug: ..., description: ..., shortDesc: ..., partNumber: ..., price: Decimal, comparePrice: ..., inStock: ..., stockQuantity: ..., images: ..., specifications: ..., compatibility: ..., categoryId: ..., featured: ..., createdAt: ..., updatedAt: ..., category: ...}
                                                                                            ^^^^^^^
error @ C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\next-devtools\userspace\app\errors\intercept-console-error.js:62
C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\next-devtools\userspace\app\errors\intercept-console-error.js:62   Server  Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.
  {id: ..., name: ..., slug: ..., description: ..., shortDesc: ..., partNumber: ..., price: ..., comparePrice: Decimal, inStock: ..., stockQuantity: ..., images: ..., specifications: ..., compatibility: ..., categoryId: ..., featured: ..., createdAt: ..., updatedAt: ..., category: ...}
                                                                                                               ^^^^^^^
error @ C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\next-devtools\userspace\app\errors\intercept-console-error.js:62
C:\Users\rosto\OneDrive\src\client\react-client-callbacks\error-boundary-callbacks.ts:90  TypeError: product.price.toFixed is not a function
    at eval (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\src\components\admin\parts\ProductTable.tsx:311:77)
    at Array.map (<anonymous>)
    at ProductTable (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\src\components\admin\parts\ProductTable.tsx:270:25)
    at Object.react_stack_bottom_frame (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:23583:1)
    at renderWithHooks (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:6792:1)
    at updateFunctionComponent (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:9246:1)
    at beginWork (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:10806:1)
    at runWithFiberInDEV (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:871:1)
    at performUnitOfWork (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:15726:1)
    at workLoopSync (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:15546:39)
    at renderRootSync (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:15526:1)
    at performWorkOnRoot (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:15033:1)
    at performWorkOnRootViaSchedulerTask (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:16815:1)
    at MessagePort.performWorkUntilDeadline (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\scheduler\cjs\scheduler.development.js:45:1)

The above error occurred in the <ProductTable> component. It was handled by the <ErrorBoundaryHandler> error boundary.
onCaughtError @ C:\Users\rosto\OneDrive\src\client\react-client-callbacks\error-boundary-callbacks.ts:90
C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\next-devtools\userspace\app\errors\intercept-console-error.js:62  Application Error: TypeError: product.price.toFixed is not a function
    at eval (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\src\components\admin\parts\ProductTable.tsx:311:77)
    at Array.map (<anonymous>)
    at ProductTable (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\src\components\admin\parts\ProductTable.tsx:270:25)
    at Object.react_stack_bottom_frame (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:23583:1)
    at renderWithHooks (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:6792:1)
    at updateFunctionComponent (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:9246:1)
    at beginWork (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:10806:1)
    at runWithFiberInDEV (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:871:1)
    at performUnitOfWork (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:15726:1)
    at workLoopSync (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:15546:39)
    at renderRootSync (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:15526:1)
    at performWorkOnRoot (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:15033:1)
    at performWorkOnRootViaSchedulerTask (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:16815:1)
    at MessagePort.performWorkUntilDeadline (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\scheduler\cjs\scheduler.development.js:45:1)
error @ C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\next-devtools\userspace\app\errors\intercept-console-error.js:62
C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\next-devtools\userspace\app\errors\intercept-console-error.js:62  Application Error: TypeError: product.price.toFixed is not a function
    at eval (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\src\components\admin\parts\ProductTable.tsx:311:77)
    at Array.map (<anonymous>)
    at ProductTable (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\src\components\admin\parts\ProductTable.tsx:270:25)
    at Object.react_stack_bottom_frame (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:23583:1)
    at renderWithHooks (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:6792:1)
    at updateFunctionComponent (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:9246:1)
    at beginWork (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:10806:1)
    at runWithFiberInDEV (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:871:1)
    at performUnitOfWork (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:15726:1)
    at workLoopSync (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:15546:39)
    at renderRootSync (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:15526:1)
    at performWorkOnRoot (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:15033:1)
    at performWorkOnRootViaSchedulerTask (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\react-dom\cjs\react-dom-client.development.js:16815:1)
    at MessagePort.performWorkUntilDeadline (C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\compiled\scheduler\cjs\scheduler.development.js:45:1)
error @ C:\Users\rosto\OneDrive\Desktop\GW site\garrit-wulf-clone\node_modules\next\dist\next-devtools\userspace\app\errors\intercept-console-error.js:62
