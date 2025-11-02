import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get optional tracking data from request body
    const body = await request.json().catch(() => ({}));
    const { userId, ipAddress, userAgent } = body;

    // Increment view counter on Part model
    const updatedPart = await prisma.part.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        id: true,
        views: true,
      },
    });

    // Optionally create detailed ProductView record for analytics
    if (userId || ipAddress) {
      await prisma.productView.create({
        data: {
          partId: id,
          userId,
          ipAddress,
          userAgent,
        },
      });
    }

    return NextResponse.json({
      success: true,
      views: updatedPart.views,
    });
  } catch (error: unknown) {
    console.error('Error tracking product view:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
