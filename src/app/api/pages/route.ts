import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/pages
 * Public endpoint to fetch all published pages (for dropdown selections, footer links, etc.)
 */
export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      where: {
        published: true
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: {
        title: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      pages
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}
