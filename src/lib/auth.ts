/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';
import { User } from '@prisma/client';

/**
 * Get the current authenticated user from the database
 * With automatic sync fallback: If user exists in Clerk but not in DB, auto-create them
 * This ensures the system works even if webhooks fail
 * @returns User object if authenticated and exists in DB, null otherwise
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { userId } = await auth();
    
    console.log('🔍 [getCurrentUser] Clerk userId:', userId);

    if (!userId) {
      console.log('❌ [getCurrentUser] No userId from Clerk');
      return null;
    }

    // Try to find user in database
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    console.log('🔍 [getCurrentUser] Database user found:', user ? `${user.email} (${user.role})` : 'null');

    // AUTO-SYNC FALLBACK: If user not in DB but authenticated in Clerk, create them
    if (!user) {
      console.log('⚠️  [getCurrentUser] User authenticated in Clerk but not in database. Auto-syncing...');
      
      try {
        // Get full user info from Clerk
        const clerkUser = await currentUser();
        
        if (!clerkUser) {
          console.error('❌ [getCurrentUser] Could not fetch Clerk user details');
          return null;
        }

        // Get primary email
        const primaryEmail = clerkUser.emailAddresses.find(
          (email) => email.id === clerkUser.primaryEmailAddressId
        );

        if (!primaryEmail) {
          console.error('❌ [getCurrentUser] No primary email found for Clerk user');
          return null;
        }

        // Create user in database with default VIEWER role
        user = await prisma.user.create({
          data: {
            id: userId,
            email: primaryEmail.emailAddress,
            name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
            role: 'VIEWER', // Default role - admins must be promoted manually
          },
        });

        console.log('✅ [getCurrentUser] User auto-synced to database:', user.email, '(', user.role, ')');
        console.log('ℹ️  [getCurrentUser] To promote to admin, run: npx tsx scripts/setup-super-admin.ts --email=' + user.email);
        
      } catch (syncError) {
        console.error('❌ [getCurrentUser] Failed to auto-sync user:', syncError);
        return null;
      }
    }

    return user;
  } catch (error) {
    console.error('❌ [getCurrentUser] Error fetching current user:', error);
    return null;
  }
}

/**
 * Require admin panel access (for Server Components and Pages)
 * Redirects to sign-in page if user is not authenticated
 * Redirects to homepage if user is VIEWER role (read-only)
 * Allows SUPER_ADMIN, ADMIN, STAFF, and CONTENT_EDITOR roles
 * @returns User object with access to admin panel
 */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();

  console.log('🔍 [requireAdmin] Current user:', user?.id, 'Role:', user?.role);

  if (!user) {
    console.log('❌ [requireAdmin] No user found - redirecting to sign-in page');
    redirect('/sign-in?redirect_url=/admin');
  }

  // Block VIEWER role from admin panel access
  if (user.role === 'VIEWER') {
    console.log('❌ [requireAdmin] VIEWER role blocked - redirecting to homepage');
    redirect('/');
  }

  console.log('✅ [requireAdmin] Admin access granted');
  return user;
}

/**
 * Check if current user has admin panel access (for API routes)
 * Returns null if not authenticated or is VIEWER role
 * Use this in API routes where redirect() doesn't work
 * Allows SUPER_ADMIN, ADMIN, STAFF, and CONTENT_EDITOR roles
 * @returns User object if has admin access, null otherwise
 */
export async function checkAdmin(): Promise<User | null> {
  const user = await getCurrentUser();

  // Block if not authenticated or is VIEWER role
  if (!user || user.role === 'VIEWER') {
    return null;
  }

  return user;
}

// ============================================================================
// RBAC PERMISSION HELPERS (For Server Components)
// ============================================================================

/**
 * Require specific permission to access a page (for Server Components)
 * Redirects to sign-in if not authenticated
 * Redirects to homepage if missing permission
 * 
 * @param requiredPermission - Permission string (e.g., "products.view")
 * @returns User object with RBAC fields
 * 
 * @example
 * export default async function ProductsPage() {
 *   const user = await requirePermission('products.view');
 *   // User is authorized
 * }
 */
export async function requirePermission(requiredPermission: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin');
  }

  // Import permission check dynamically to avoid circular dependencies
  const { hasPermission } = await import('./rbac/check-permission');
  
  const rbacUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    roleLevel: (user as any).roleLevel || 10,
    permissions: (user as any).permissions || [],
  };

  if (!hasPermission(rbacUser, requiredPermission)) {
    console.log('❌ [requirePermission] Missing permission:', requiredPermission);
    redirect('/?error=forbidden');
  }

  return user;
}

/**
 * Require ANY of the specified permissions (OR logic)
 * 
 * @param requiredPermissions - Array of permission strings
 * @returns User object
 * 
 * @example
 * const user = await requireAnyPermission(['products.view', 'products.edit']);
 */
export async function requireAnyPermission(requiredPermissions: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin');
  }

  const { hasAnyPermission } = await import('./rbac/check-permission');
  
  const rbacUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    roleLevel: (user as any).roleLevel || 10,
    permissions: (user as any).permissions || [],
  };

  if (!hasAnyPermission(rbacUser, requiredPermissions)) {
    console.log('❌ [requireAnyPermission] Missing permissions:', requiredPermissions);
    redirect('/?error=forbidden');
  }

  return user;
}

/**
 * Check if current user has a specific permission
 * Returns user if authorized, null otherwise (no redirect)
 * 
 * @param requiredPermission - Permission string
 * @returns User object if authorized, null otherwise
 * 
 * @example
 * const user = await checkPermission('products.edit');
 * if (!user) {
 *   return <div>Access Denied</div>;
 * }
 */
export async function checkPermission(requiredPermission: string): Promise<User | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { hasPermission } = await import('./rbac/check-permission');
  
  const rbacUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    roleLevel: (user as any).roleLevel || 10,
    permissions: (user as any).permissions || [],
  };

  if (!hasPermission(rbacUser, requiredPermission)) {
    return null;
  }

  return user;
}
