import { User, UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

// Re-export client-safe utilities
export { getRoleLevel, isSuperAdmin, hasRolePermission } from './role-utils';

/**
 * Require SUPER_ADMIN role to access a route
 * Redirects to /admin if user is not authenticated or not a super admin
 * 
 * @param isApiRoute - If true, throws error instead of redirecting (for API routes)
 * @returns User object with SUPER_ADMIN role
 * @throws Error if not authorized (in API routes)
 */
export async function requireSuperAdmin(isApiRoute = false): Promise<User> {
  const user = await getCurrentUser();

  if (!user || user.role !== ('SUPER_ADMIN' as UserRole)) {
    if (isApiRoute) {
      throw new Error('Unauthorized: SUPER_ADMIN role required');
    }
    redirect('/admin');
  }

  return user;
}
