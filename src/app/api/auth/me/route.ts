import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ROLE_PERMISSIONS } from '@/lib/rbac/permissions';
import { User } from '@prisma/client';

/**
 * GET /api/auth/me
 * Get current authenticated user with their role and permissions
 * Returns custom permissions if set, otherwise falls back to role defaults
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Type assertion: Prisma returns full User model but TS doesn't recognize it
    const userWithPermissions = user as User & { permissions: string[] };

    // Use custom permissions if set, otherwise fall back to role defaults
    const permissions = userWithPermissions.permissions && userWithPermissions.permissions.length > 0
      ? userWithPermissions.permissions
      : ROLE_PERMISSIONS[user.role];

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: permissions,
      }
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
