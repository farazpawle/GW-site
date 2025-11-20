/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ROLE_PERMISSIONS } from '@/lib/rbac/permissions';

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser || !clerkUser.emailAddresses?.[0]) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const email = clerkUser.emailAddresses[0].emailAddress;
    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Use custom permissions if set, otherwise fall back to role defaults
    const userPermissions = (user as any).permissions || [];
    const permissions = userPermissions.length > 0
      ? userPermissions
      : ROLE_PERMISSIONS[user.role];

    // Return full user object with all RBAC fields
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roleLevel: (user as any).roleLevel || 10,
        permissions: permissions,
      }
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
