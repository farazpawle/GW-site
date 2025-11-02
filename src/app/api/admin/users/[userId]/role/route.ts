import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { validateRoleChange, updateUserRole } from '@/lib/admin/role-management';
import { isSuperAdmin } from '@/lib/admin/auth';
import { UserRole } from '@prisma/client';

/**
 * POST /api/admin/users/[userId]/role
 * 
 * Update a user's role with security validation
 * 
 * Body:
 * - newRole: ADMIN or VIEWER
 * - note (optional): Reason for the change
 * 
 * @returns Success message or validation error
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Ensure user is an admin
    const currentUser = await requireAdmin();

    // Get userId from params (Next.js 15 async params pattern)
    const { userId: targetUserId } = await context.params;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { newRole, note } = body;

    // Validate newRole
    if (!newRole || (newRole !== 'ADMIN' && newRole !== 'VIEWER' && newRole !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be SUPER_ADMIN, ADMIN, or VIEWER.' },
        { status: 400 }
      );
    }

    // Super Admin Authorization Check
    // Only super admins can promote users to ADMIN or SUPER_ADMIN roles
    if ((newRole === 'ADMIN' || newRole === 'SUPER_ADMIN') && !isSuperAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Only super admins can create or modify admin users' },
        { status: 403 }
      );
    }

    // Validate the role change (security checks)
    const validation = await validateRoleChange(
      currentUser,
      targetUserId,
      newRole as UserRole
    );

    if (!validation.allowed) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 403 }
      );
    }

    // Update the user's role
    const updatedUser = await updateUserRole(targetUserId, newRole as UserRole);

    // Audit log for role changes (especially important for super admin actions)
    const logLevel = (newRole === 'SUPER_ADMIN' || newRole === 'ADMIN') ? 'CRITICAL' : 'INFO';
    console.log(`[${logLevel}] Role changed for user ${targetUserId}:`, {
      action: 'ROLE_CHANGE',
      changedBy: currentUser.id,
      changedByEmail: currentUser.email,
      changedByRole: currentUser.role,
      targetUserId,
      targetUserEmail: updatedUser.email,
      oldRole: 'N/A', // Could be fetched before update if needed
      newRole,
      isSuperAdminAction: isSuperAdmin(currentUser),
      note: note || 'No note provided',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        userId: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        newRole: updatedUser.role
      }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update user role' 
      },
      { status: 500 }
    );
  }
}
