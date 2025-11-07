import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/revalidate
 * Revalidate a specific path to update cached content
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Path is required' },
        { status: 400 }
      );
    }

    // Revalidate the path
    revalidatePath(path);

    return NextResponse.json({
      success: true,
      message: `Path ${path} revalidated successfully`,
      revalidatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error revalidating path:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revalidate path' },
      { status: 500 }
    );
  }
}
