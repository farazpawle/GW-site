import { prisma } from '@/lib/prisma';
import { User, UserRole } from '@prisma/client';
import { isSuperAdmin, getRoleLevel } from '@/lib/admin/auth';

/**
 * Validation result for role change operations
 */
export interface RoleChangeValidation {
  allowed: boolean;
  error?: string;
}

/**
 * Validates whether a user's role can be changed
 * 
 * @param currentUser - The user making the change
 * @param targetUserId - ID of the user whose role is being changed
 * @param newRole - The new role to assign
 * @returns Validation result indicating if the change is allowed
 * 
 * Security Rules:
 * 1. Users cannot demote themselves (ADMIN to VIEWER, SUPER_ADMIN to ADMIN/VIEWER)
 * 2. Cannot remove admin/super admin role from the last one in the system
 * 3. Only SUPER_ADMIN can promote users to ADMIN or SUPER_ADMIN
 * 4. Only SUPER_ADMIN can modify other SUPER_ADMIN users
 * 5. Regular ADMIN can only manage VIEWER users
 */
export async function validateRoleChange(
  currentUser: User,
  targetUserId: string,
  newRole: UserRole
): Promise<RoleChangeValidation> {
  // Fetch target user to check current role
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true }
  });

  if (!targetUser) {
    return {
      allowed: false,
      error: 'Target user not found'
    };
  }

  // Rule 1: Prevent self-demotion
  if (currentUser.id === targetUserId) {
    const currentLevel = getRoleLevel(currentUser.role);
    const newLevel = getRoleLevel(newRole);
    
    if (newLevel < currentLevel) {
      return {
        allowed: false,
        error: 'Cannot demote yourself. Another admin must change your role.'
      };
    }
  }

  // Rule 3: Only SUPER_ADMIN can promote to ADMIN or SUPER_ADMIN
  if ((newRole === 'ADMIN' || newRole === 'SUPER_ADMIN') && !isSuperAdmin(currentUser)) {
    return {
      allowed: false,
      error: 'Only super admins can create or promote users to admin roles'
    };
  }

  // Rule 4: Only SUPER_ADMIN can modify other SUPER_ADMIN users
  if (targetUser.role === 'SUPER_ADMIN' && !isSuperAdmin(currentUser)) {
    return {
      allowed: false,
      error: 'Only super admins can modify other super admin users'
    };
  }

  // Rule 5: Regular ADMIN can only manage VIEWER users
  if (currentUser.role === 'ADMIN' && targetUser.role !== 'VIEWER' && currentUser.id !== targetUserId) {
    return {
      allowed: false,
      error: 'Regular admins can only modify viewer users'
    };
  }

  // Rule 2: Last admin/super admin protection
  if (targetUser.role === 'ADMIN' && newRole !== 'ADMIN') {
    // Check if this is the last admin
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    if (adminCount === 1) {
      return {
        allowed: false,
        error: 'Cannot remove the last admin. At least one admin must remain in the system.'
      };
    }
  }

  // Last SUPER_ADMIN protection
  if (targetUser.role === 'SUPER_ADMIN' && newRole !== 'SUPER_ADMIN') {
    const superAdminCount = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' }
    });

    if (superAdminCount === 1) {
      return {
        allowed: false,
        error: 'Cannot remove the last super admin. At least one super admin must remain in the system.'
      };
    }
  }

  return { allowed: true };
}

/**
 * Updates a user's role in the database
 * 
 * @param userId - ID of the user to update
 * @param newRole - The new role to assign
 * @returns The updated user object
 * 
 * Note: This function does NOT perform validation. 
 * Always call validateRoleChange() first to ensure the operation is allowed.
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<User> {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { 
      role: newRole,
      updatedAt: new Date() // Explicitly update the timestamp
    }
  });

  return updatedUser;
}

/**
 * Validates and updates a user's role in a single transaction
 * 
 * @param currentUser - The user making the change
 * @param targetUserId - ID of the user whose role is being changed
 * @param newRole - The new role to assign
 * @returns The updated user object or throws an error if validation fails
 */
export async function changeUserRole(
  currentUser: User,
  targetUserId: string,
  newRole: UserRole
): Promise<User> {
  // Validate the change
  const validation = await validateRoleChange(currentUser, targetUserId, newRole);
  
  if (!validation.allowed) {
    throw new Error(validation.error || 'Role change not allowed');
  }

  // Perform the update
  return await updateUserRole(targetUserId, newRole);
}
