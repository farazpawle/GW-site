import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { validateRoleChange, updateUserRole } from '@/lib/admin/role-management';
import { isSuperAdmin } from '@/lib/admin/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

/**
 * POST /api/admin/users/bulk-role
 * 
 * Update multiple users' roles at once
 * 
 * Body:
 * - userIds: Array of user IDs to update
 * - newRole: ADMIN or VIEWER
 * 
 * @returns Count of successfully updated users
 */
export async function POST(req: NextRequest) {
  try {
    // Ensure user is an admin
    const currentUser = await requireAdmin();

    // Parse request body
    const body = await req.json();
    const { userIds, newRole } = body;

    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'userIds must be a non-empty array' },
        { status: 400 }
      );
    }

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
        { success: false, error: 'Only super admins can promote users to admin roles' },
        { status: 403 }
      );
    }

    // Fetch all target users to filter out SUPER_ADMIN users
    const targetUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, role: true, email: true }
    });

    // Filter out SUPER_ADMIN users from bulk operations
    const superAdminUsers = targetUsers.filter(u => u.role === 'SUPER_ADMIN');
    const processableUserIds = targetUsers
      .filter(u => u.role !== 'SUPER_ADMIN')
      .map(u => u.id);

    // Check if current user is in the selection
    const currentUserInSelection = processableUserIds.includes(currentUser.id);
    if (currentUserInSelection && newRole === 'VIEWER') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot remove your own admin privileges. Please deselect yourself and try again.' 
        },
        { status: 403 }
      );
    }

    // Process each user with validation
    const results = {
      successful: [] as string[],
      failed: [] as { userId: string; reason: string }[],
      skipped: superAdminUsers.map(u => ({ userId: u.id, email: u.email, reason: 'Super admin users cannot be modified via bulk operations' }))
    };

    for (const userId of processableUserIds) {
      try {
        // Validate role change for this user
        const validation = await validateRoleChange(
          currentUser,
          userId,
          newRole as UserRole
        );

        if (!validation.allowed) {
          results.failed.push({
            userId,
            reason: validation.error || 'Validation failed'
          });
          continue;
        }

        // Update the user's role
        await updateUserRole(userId, newRole as UserRole);
        results.successful.push(userId);

      } catch (error) {
        results.failed.push({
          userId,
          reason: error instanceof Error ? error.message : 'Update failed'
        });
      }
    }

    // Log the bulk operation
    const logLevel = (newRole === 'ADMIN' || newRole === 'SUPER_ADMIN') ? 'CRITICAL' : 'INFO';
    console.log(`[${logLevel}] Bulk role change performed by ${currentUser.email}:`, {
      action: 'BULK_ROLE_CHANGE',
      performedBy: currentUser.id,
      performedByRole: currentUser.role,
      newRole,
      totalRequested: userIds.length,
      successful: results.successful.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
      isSuperAdminAction: isSuperAdmin(currentUser),
      timestamp: new Date().toISOString()
    });

    // Construct response message
    let message = `Successfully updated ${results.successful.length} of ${userIds.length} users`;
    if (results.skipped.length > 0) {
      message += `. ${results.skipped.length} super admin user(s) were skipped.`;
    }

    return NextResponse.json({
      success: true,
      message,
      data: {
        updated: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
        failures: results.failed,
        skippedUsers: results.skipped
      }
    });

  } catch (error) {
    console.error('Error in bulk role update:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to perform bulk role update' 
      },
      { status: 500 }
    );
  }
}
