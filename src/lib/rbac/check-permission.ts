/**
 * Permission Checking Functions
 * 
 * Core logic for validating user permissions and role hierarchy.
 * Import these functions wherever you need to check permissions.
 */

import { UserRole } from '@prisma/client';
import { ROLE_LEVELS, ROLE_PERMISSIONS } from './permissions';

// ============================================================================
// TYPES
// ============================================================================

/**
 * User object with RBAC fields
 */
export interface RBACUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  roleLevel: number;
  permissions: string[];
}

// ============================================================================
// PERMISSION MATCHING
// ============================================================================

/**
 * Check if a permission matches a pattern (with wildcard support)
 * @example
 * matchesPermission('products.view', 'products.*') => true
 * matchesPermission('products.view', 'products.view') => true
 * matchesPermission('products.edit', 'products.view') => false
 */
function matchesPermission(userPermission: string, requiredPermission: string): boolean {
  // Exact match
  if (userPermission === requiredPermission) {
    return true;
  }

  // Wildcard match (e.g., user has "products.*", checking for "products.view")
  if (userPermission.endsWith('.*')) {
    const resource = userPermission.slice(0, -2); // Remove ".*"
    return requiredPermission.startsWith(resource + '.');
  }

  return false;
}

// ============================================================================
// CORE PERMISSION CHECKS
// ============================================================================

/**
 * Check if user has a specific permission
 * Supports wildcard permissions (e.g., "products.*")
 * 
 * @param user - User object with permissions array
 * @param requiredPermission - Permission string to check (e.g., "products.view")
 * @returns true if user has the permission (exact or via wildcard)
 * 
 * @example
 * hasPermission(user, 'products.view')
 * hasPermission(user, 'users.manage_roles')
 * 
 * IMPORTANT: Only SUPER_ADMIN bypasses permission checks.
 * All other roles (including ADMIN) must have explicit permissions.
 */
export function hasPermission(user: RBACUser | null, requiredPermission: string): boolean {
  if (!user) return false;

  // ONLY SUPER_ADMIN bypasses all permission checks
  // All other roles (ADMIN, STAFF, CONTENT_EDITOR, VIEWER) must have explicit permissions
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  // If user has no permissions array, use default role permissions as fallback
  const userPermissions = user.permissions.length > 0 
    ? user.permissions 
    : ROLE_PERMISSIONS[user.role] || [];

  // Check if user has the exact permission or a wildcard that covers it
  return userPermissions.some((userPerm) => matchesPermission(userPerm, requiredPermission));
}

/**
 * Check if user has ANY of the specified permissions
 * 
 * @param user - User object
 * @param requiredPermissions - Array of permission strings
 * @returns true if user has at least one of the permissions
 * 
 * @example
 * hasAnyPermission(user, ['products.view', 'products.edit'])
 */
export function hasAnyPermission(user: RBACUser | null, requiredPermissions: string[]): boolean {
  if (!user) return false;

  return requiredPermissions.some((permission) => hasPermission(user, permission));
}

/**
 * Check if user has ALL of the specified permissions
 * 
 * @param user - User object
 * @param requiredPermissions - Array of permission strings
 * @returns true if user has all permissions
 * 
 * @example
 * hasAllPermissions(user, ['products.view', 'products.edit'])
 */
export function hasAllPermissions(user: RBACUser | null, requiredPermissions: string[]): boolean {
  if (!user) return false;

  return requiredPermissions.every((permission) => hasPermission(user, permission));
}

// ============================================================================
// ROLE HIERARCHY CHECKS
// ============================================================================

/**
 * Get the numeric level for a role
 * 
 * @param role - UserRole enum value
 * @returns Numeric level (higher = more privileged)
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_LEVELS[role] || ROLE_LEVELS.VIEWER;
}

/**
 * Check if user meets minimum role level requirement
 * 
 * @param user - User object
 * @param minimumLevel - Minimum required level
 * @returns true if user's role level >= minimumLevel
 * 
 * @example
 * hasMinimumRoleLevel(user, ROLE_LEVELS.STAFF) // true for STAFF, MANAGER, SUPER_ADMIN
 */
export function hasMinimumRoleLevel(user: RBACUser | null, minimumLevel: number): boolean {
  if (!user) return false;

  return user.roleLevel >= minimumLevel;
}

/**
 * Check if current user can manage a target user (role hierarchy enforcement)
 * Rule: Lower role levels CANNOT see or manage higher role levels
 * 
 * @param currentUser - User performing the action
 * @param targetUser - User being managed
 * @returns true if currentUser can manage targetUser
 * 
 * @example
 * // STAFF (level 20) trying to manage MANAGER (level 50) => false
 * // MANAGER (level 50) trying to manage STAFF (level 20) => true
 * // SUPER_ADMIN (level 100) can manage anyone => true
 */
export function canManageUser(
  currentUser: RBACUser | null,
  targetUser: RBACUser | { role: UserRole; roleLevel: number }
): boolean {
  if (!currentUser) return false;

  // Super admins can manage anyone
  if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') {
    return true;
  }

  // Cannot manage users at same or higher level
  return currentUser.roleLevel > targetUser.roleLevel;
}

/**
 * Check if user can assign a specific role
 * Rule: Users can only assign roles lower than their own
 * 
 * @param user - User trying to assign a role
 * @param roleToAssign - Role they want to assign
 * @returns true if user can assign this role
 * 
 * @example
 * // MANAGER (level 50) trying to assign SUPER_ADMIN (level 100) => false
 * // MANAGER (level 50) trying to assign STAFF (level 20) => true
 */
export function canAssignRole(user: RBACUser | null, roleToAssign: UserRole): boolean {
  if (!user) return false;

  // Super admins can assign any role
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return true;
  }

  // Users can only assign roles lower than their own
  const targetRoleLevel = getRoleLevel(roleToAssign);
  return user.roleLevel > targetRoleLevel;
}

// ============================================================================
// PERMISSION CALCULATION
// ============================================================================

/**
 * Get the effective permissions for a user
 * (combines default role permissions with custom permissions)
 * 
 * @param user - User object
 * @returns Array of all effective permissions
 */
export function getEffectivePermissions(user: RBACUser | null): string[] {
  if (!user) return [];

  // Super admins have all permissions
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return ['*']; // Represents all permissions
  }

  // Combine role default permissions with user's custom permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  const userPermissions = user.permissions || [];

  // Merge and deduplicate
  const allPermissions = [...new Set([...rolePermissions, ...userPermissions])];
  
  return allPermissions;
}

/**
 * Check if user has a minimum role
 * 
 * @param user - User object
 * @param minimumRole - Minimum required role
 * @returns true if user's role level >= minimum role level
 * 
 * @example
 * hasMinimumRole(user, 'STAFF') // true for STAFF, MANAGER, SUPER_ADMIN
 */
export function hasMinimumRole(user: RBACUser | null, minimumRole: UserRole): boolean {
  if (!user) return false;

  const minimumLevel = getRoleLevel(minimumRole);
  return user.roleLevel >= minimumLevel;
}

// ============================================================================
// CONVENIENCE CHECKS
// ============================================================================

/**
 * Check if user is a Super Admin
 */
export function isSuperAdmin(user: RBACUser | null): boolean {
  if (!user) return false;
  return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
}

/**
 * Check if user is STAFF or higher (STAFF, ADMIN, SUPER_ADMIN)
 */
export function isManager(user: RBACUser | null): boolean {
  if (!user) return false;
  return user.roleLevel >= ROLE_LEVELS.STAFF;
}

/**
 * Check if user is Staff or higher
 */
export function isStaff(user: RBACUser | null): boolean {
  if (!user) return false;
  return user.roleLevel >= ROLE_LEVELS.STAFF;
}

/**
 * Filter a list of users to only show those the current user can manage
 * (implements "lower role cannot see upper role" rule)
 * 
 * @param currentUser - User performing the query
 * @param users - List of all users
 * @returns Filtered list of users currentUser can see/manage
 */
export function filterManageableUsers<T extends { role: UserRole; roleLevel: number }>(
  currentUser: RBACUser | null,
  users: T[]
): T[] {
  if (!currentUser) return [];

  // Super admins can see everyone
  if (isSuperAdmin(currentUser)) {
    return users;
  }

  // Filter to only users with lower role level
  return users.filter((user) => user.roleLevel < currentUser.roleLevel);
}
