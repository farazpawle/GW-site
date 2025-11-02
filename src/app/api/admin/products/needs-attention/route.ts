import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    // Check authentication
    await requireAdmin();

    // Fetch products that need attention
    const products = await prisma.part.findMany({
      where: {
        OR: [
          { published: false }, // Unpublished products
          { images: { isEmpty: true } }, // Products with no images
          { description: null }, // Products with no description
          { shortDesc: null }, // Products with no short description
        ],
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Transform and categorize issues
    const productsWithIssues = products.map((product) => {
      const issues: string[] = [];

      if (!product.published) issues.push('unpublished');
      if (product.images.length === 0) issues.push('no_images');
      if (!product.description) issues.push('no_description');
      if (!product.shortDesc) issues.push('no_short_desc');

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        partNumber: product.partNumber,
        image: product.images[0] || null,
        category: product.category,
        issues,
        issueCount: issues.length,
        published: product.published,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      };
    });

    // Sort by issue count (most issues first)
    productsWithIssues.sort((a, b) => b.issueCount - a.issueCount);

    return NextResponse.json({
      success: true,
      data: productsWithIssues,
      totalCount: productsWithIssues.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching products needing attention:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch products needing attention' },
      { status: 500 }
    );
  }
}
