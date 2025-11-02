import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    await requireAdmin();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    // Fetch top viewed products with view counts
    const topProducts = await prisma.part.findMany({
      where: {
        published: true, // Only show published products
        views: {
          gt: 0, // Only show products with at least 1 view
        },
      },
      orderBy: {
        views: 'desc',
      },
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            productViews: true, // Count of detailed view records
          },
        },
      },
    });

    // Transform data for frontend
    const products = topProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      partNumber: product.partNumber,
      image: product.images[0] || null,
      views: product.views,
      detailedViews: product._count.productViews,
      category: product.category,
      featured: product.featured,
      published: product.published,
      createdAt: product.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error: unknown) {
    console.error('Error fetching top viewed products:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch top viewed products' },
      { status: 500 }
    );
  }
}
