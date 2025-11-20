/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRBACUser } from '@/lib/rbac/guards';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { logRBACChange } from '@/lib/rbac/audit';
import { hasPermission, canManageUser, type RBACUser } from '@/lib/rbac/check-permission';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Get current user
    const currentUser = await getCurrentRBACUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if current user has permission to edit permissions
    if (!hasPermission(currentUser, PERMISSIONS.USERS_EDIT_PERMISSIONS)) {
      return NextResponse.json(
        { 
          error: 'Forbidden', 
          message: 'Missing required permission: users.edit_permissions' 
        },
        { status: 403 }
      );
    }
    
    // Fetch target user
    const targetUserRaw = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUserRaw) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Target user not found' },
        { status: 404 }
      );
    }

    const targetUser: RBACUser = {
      id: targetUserRaw.id,
      email: targetUserRaw.email,
      name: targetUserRaw.name,
      role: targetUserRaw.role,
      roleLevel: (targetUserRaw as any).roleLevel || 10,
      permissions: (targetUserRaw as any).permissions || [],
    };
    
    // Check if current user can manage target user (hierarchy check)
    if (!canManageUser(currentUser, targetUser)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Cannot manage users at same or higher role level',
        },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { permissions } = body;
    
    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Permissions must be an array' },
        { status: 400 }
      );
    }
    
    // Validate all permissions are valid
    const validPermissionValues = Object.values(PERMISSIONS);
    const invalidPermissions = permissions.filter(
      perm => !validPermissionValues.includes(perm) && !perm.endsWith('.*')
    );
    
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid permissions', 
          invalidPermissions 
        },
        { status: 400 }
      );
    }
    
    // Store old permissions for audit log
    const oldPermissions = (targetUser as any).permissions || [];
    
    // Update user permissions
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: permissions,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        roleLevel: true,
        permissions: true,
        createdAt: true,
      },
    });
    
    // Log permission change
    await logRBACChange({
      actorId: currentUser.id,
      actorEmail: currentUser.email,
      targetId: userId,
      targetEmail: targetUser.email,
      action: 'PERMISSION_CHANGE',
      oldValue: { permissions: oldPermissions },
      newValue: { permissions },
    });
    
    return NextResponse.json({
      message: 'Permissions updated successfully',
      user: {
        ...updatedUser,
        roleLevel: (updatedUser as any).roleLevel || 10,
        permissions: (updatedUser as any).permissions || [],
      },
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update permissions' },
      { status: 500 }
    );
  }
}
