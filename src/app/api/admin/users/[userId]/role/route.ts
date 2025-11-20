/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/rbac/guards';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { ROLE_LEVELS, getDefaultPermissions } from '@/lib/rbac/permissions';
import { logRBACChange } from '@/lib/rbac/audit';

/**
 * PATCH /api/admin/users/[userId]/role
 * 
 * Update a user's role with RBAC validation (Super Admin only)
 * 
 * Body:
 * - role: SUPER_ADMIN | MANAGER | STAFF | CONTENT_EDITOR | VIEWER
 * 
 * @returns Updated user with new role, roleLevel, and permissions
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Only super admins can change roles
    const currentUserOrError = await requireSuperAdmin();
    if (currentUserOrError instanceof NextResponse) {
      return currentUserOrError;
    }

    // Get userId from params (Next.js 15 async params pattern)
    const { userId: targetUserId } = await context.params;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { role } = body;

    // Validate role
    if (!role || typeof role !== 'string') {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'CONTENT_EDITOR', 'VIEWER'];
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent changing own role
    if (targetUser.id === currentUserOrError.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 403 }
      );
    }

    // Get new role level and default permissions
    const newRoleLevel = ROLE_LEVELS[role as keyof typeof ROLE_LEVELS] || 10;
    const defaultPermissions = getDefaultPermissions(role as UserRole);
    
    // Store old values for audit log
    const oldRole = targetUser.role;
    const oldPermissions = (targetUser as any).permissions || [];

    // Update user role, roleLevel, and reset permissions to defaults
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: role as UserRole,
        roleLevel: newRoleLevel,
        permissions: defaultPermissions,
      } as any, // Type assertion due to Prisma types not refreshed
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    
    // Log role change
    await logRBACChange({
      actorId: currentUserOrError.id,
      actorEmail: currentUserOrError.email,
      targetId: targetUserId,
      targetEmail: targetUser.email,
      action: 'ROLE_CHANGE',
      oldValue: { role: oldRole, roleLevel: ROLE_LEVELS[oldRole] || 10, permissions: oldPermissions },
      newValue: { role, roleLevel: newRoleLevel, permissions: defaultPermissions },
    });

    return NextResponse.json({
      message: 'Role updated successfully',
      user: {
        ...updatedUser,
        roleLevel: newRoleLevel,
        permissions: defaultPermissions,
      },
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}
