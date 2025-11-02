import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes (accessible without authentication)
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

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
