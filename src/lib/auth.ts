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
 * Require admin role to access a route (for Server Components and Pages)
 * Redirects to sign-in page if user is not authenticated
 * Redirects to homepage if user is authenticated but not an admin
 * Accepts both ADMIN and SUPER_ADMIN roles
 * @returns User object with ADMIN or SUPER_ADMIN role
 */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();

  console.log('🔍 [requireAdmin] Current user:', user?.id, 'Role:', user?.role);

  if (!user) {
    console.log('❌ [requireAdmin] No user found - redirecting to sign-in page');
    redirect('/sign-in?redirect_url=/admin');
  }

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    console.log('❌ [requireAdmin] User role not authorized:', user.role, '- redirecting to homepage');
    redirect('/');
  }

  console.log('✅ [requireAdmin] Admin access granted');
  return user;
}

/**
 * Check if current user is admin (for API routes)
 * Returns null if not authenticated or not an admin
 * Use this in API routes where redirect() doesn't work
 * @returns User object if admin, null otherwise
 */
export async function checkAdmin(): Promise<User | null> {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return user;
}
