import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ============================================================================
// PUBLIC ROUTES (no authentication required)
// ============================================================================

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/products',
  '/products/:path*',
  '/search',
  '/search/:path*',
  '/privacy',
  '/terms',
  '/pages/:path*', // Dynamic pages (admin preview route)
  '/:slug', // Dynamic pages (public clean URLs)
  '/api/webhooks/clerk', // Clerk webhook must be public
  '/api/public/:path*', // Public API endpoints
  '/api/search/:path*', // Search API endpoints must be public
  '/api/categories', // Categories list for search filters
  '/api/menu-items', // Menu items for navigation
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// ============================================================================
// ADMIN ROUTE PERMISSIONS MAPPING
// ============================================================================

/**
 * Map admin routes to required permissions
 * 
 * NOTE: Permission checking is done at the page/API level, not in middleware.
 * This is because middleware runs on Edge Runtime which doesn't support Prisma.
 * 
 * Implementation:
 * - Admin pages: Use requirePermission() from src/lib/auth.ts
 * - API routes: Use requirePermission() from src/lib/rbac/guards.ts
 * 
 * This mapping is kept for reference and future use.
 */
const ADMIN_ROUTE_PERMISSIONS: Record<string, string> = {
  // Dashboard
  '/admin': 'products.view', // Default permission for admin dashboard

  // Products
  '/admin/products': 'products.view',
  '/admin/products/new': 'products.create',

  // Categories
  '/admin/categories': 'categories.view',
  '/admin/categories/new': 'categories.create',

  // Pages (CMS)
  '/admin/pages': 'pages.view',
  '/admin/pages/new': 'pages.create',

  // Menu Management
  '/admin/menu': 'menu.view',

  // Media Library
  '/admin/media': 'media.view',

  // User Management
  '/admin/users': 'users.view',

  // Settings
  '/admin/settings': 'settings.view',

  // Messages
  '/admin/messages': 'messages.view',

  // Collections
  '/admin/collections': 'collections.view',
  '/admin/collections/new': 'collections.create',
};

/**
 * Get required permission for an admin route
 * Supports wildcard matching (e.g., /admin/products/123 matches /admin/products)
 */
function getRequiredPermission(pathname: string): string | null {
  // Exact match
  if (ADMIN_ROUTE_PERMISSIONS[pathname]) {
    return ADMIN_ROUTE_PERMISSIONS[pathname];
  }

  // Check for wildcard matches (e.g., /admin/products/123 -> /admin/products)
  for (const [route, permission] of Object.entries(ADMIN_ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route + '/')) {
      return permission;
    }
  }

  // Default: If it's an admin route but not mapped, require products.view (basic access)
  if (pathname.startsWith('/admin')) {
    return 'products.view';
  }

  return null;
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Protect all non-public routes with Clerk authentication
  await auth.protect();

  // Note: RBAC permission checking is handled at the page/API level
  // Middleware on Edge Runtime cannot use Prisma Client directly
  // Each admin page uses requirePermission() from src/lib/auth.ts
  // Each API route uses requirePermission() from src/lib/rbac/guards.ts

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
