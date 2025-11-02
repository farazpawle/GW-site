import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/users/[userId]
 * 
 * Get details for a single user by ID
 * 
 * @param userId - The Clerk user ID
 * @returns User details including all fields
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Ensure user is an admin
    await requireAdmin();

    // Get userId from params (Next.js 15 async params pattern)
    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Return 404 if user not found
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
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
