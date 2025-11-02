import { User, UserRole } from '@prisma/client';

/**
 * Client-safe role utility functions
 * These functions can be used in both Server and Client Components
 * as they don't depend on server-only modules
 */

/**
 * Get numeric level for role hierarchy comparison
 * Higher number = higher authority
 * 
 * @param role - The user role to evaluate
 * @returns Numeric level: SUPER_ADMIN=3, ADMIN=2, VIEWER=1
 */
export function getRoleLevel(role: UserRole): number {
  switch (role) {
    case 'SUPER_ADMIN':
      return 3;
    case 'ADMIN':
      return 2;
    case 'VIEWER':
      return 1;
    default:
      return 0;
  }
}

/**
 * Check if a user has SUPER_ADMIN role
 * 
 * @param user - The user to check (can be null)
 * @returns true if user is a super admin, false otherwise
 */
export function isSuperAdmin(user: User | null): boolean {
  return user?.role === ('SUPER_ADMIN' as UserRole);
}

/**
 * Check if a user has permission for a minimum required role
 * Uses role hierarchy: SUPER_ADMIN > ADMIN > VIEWER
 * 
 * @param user - The user to check (can be null)
 * @param minRole - The minimum role required
 * @returns true if user has sufficient permissions, false otherwise
 * 
 * @example
 * // Check if user can perform admin actions
 * if (hasRolePermission(user, 'ADMIN')) {
 *   // User is ADMIN or SUPER_ADMIN
 * }
 */
export function hasRolePermission(user: User | null, minRole: UserRole): boolean {
  if (!user) return false;
  
  const userLevel = getRoleLevel(user.role);
  const requiredLevel = getRoleLevel(minRole);
  
  return userLevel >= requiredLevel;
}
