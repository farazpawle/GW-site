import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ROLE_PERMISSIONS } from '@/lib/rbac/permissions';
import { User } from '@prisma/client';

/**
 * GET /api/auth/me
 * Get current authenticated user with their role and permissions
 * Returns custom permissions if set, otherwise falls back to role defaults
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    console.log('🔍 [/api/auth/me] User from getCurrentUser:', user?.email, user?.role);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Type assertion: Prisma returns full User model but TS doesn't recognize it
    const userWithPermissions = user as User & { permissions: string[]; roleLevel: number };

    console.log('🔍 [/api/auth/me] User permissions array:', userWithPermissions.permissions);
    console.log('🔍 [/api/auth/me] User roleLevel:', userWithPermissions.roleLevel);

    // Use custom permissions if set, otherwise fall back to role defaults
    const permissions = userWithPermissions.permissions && userWithPermissions.permissions.length > 0
      ? userWithPermissions.permissions
      : ROLE_PERMISSIONS[user.role];

    console.log('🔍 [/api/auth/me] Final permissions being returned:', permissions);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        roleLevel: userWithPermissions.roleLevel || 10,
        permissions: permissions,
      }
    });
  } catch (error) {
    console.error('❌ [/api/auth/me] Error fetching current user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
