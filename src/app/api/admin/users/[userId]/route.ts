import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireCanManageUser } from '@/lib/rbac';

/**
 * GET /api/admin/users/[userId]
 * 
 * Get details for a single user by ID
 * RBAC: Requires ability to manage the target user (role hierarchy check)
 * 
 * @param userId - The Clerk user ID
 * @returns User details including all fields
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Get userId from params (Next.js 15 async params pattern)
    const { userId } = await context.params;

    // RBAC: Check if current user can manage target user
    const result = await requireCanManageUser(userId);
    if (result instanceof NextResponse) return result;
    
    const { targetUser } = result;

    // Fetch full user data from database with all fields
    const fullUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!fullUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user details (already verified access via requireCanManageUser)
    return NextResponse.json({
      success: true,
      data: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        createdAt: fullUser.createdAt,
        updatedAt: fullUser.updatedAt,
        roleLevel: (fullUser as any).roleLevel || 10,
        permissions: (fullUser as any).permissions || [],
      }
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user details' 
      },
      { status: 500 }
    );
  }
}
