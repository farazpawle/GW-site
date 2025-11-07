/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import { getProductCardSettings } from '@/lib/settings';

export async function GET() {
  try {
    // Check authentication
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch product card display settings
    const settings = await getProductCardSettings();

    console.log('🔍 Display Settings:', settings);

    // Build dynamic WHERE conditions based on enabled display settings
    const conditions: any[] = [
      { published: false }, // Unpublished products
      { images: { isEmpty: true } }, // Products with no images
      { description: null }, // Products with no description
      { shortDesc: null }, // Products with no short description
    ];

    // Add conditions for enabled display fields that are missing values
    if (settings.showPrice) {
      conditions.push({ price: 0 }); // Price is 0 or not set
    }
    if (settings.showBrand) {
      conditions.push({ brand: null }); // Brand is missing
    }
    if (settings.showOrigin) {
      conditions.push({ origin: null }); // Country of origin is missing
    }

    console.log('🔍 Query Conditions:', JSON.stringify(conditions, null, 2));

    // Fetch products that need attention
    const products = await prisma.part.findMany({
      where: {
        OR: conditions,
      },
      orderBy: {
        updatedAt: 'desc',
      },
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

    console.log(`📊 Found ${products.length} products with issues`);

    // Transform and categorize issues
    const productsWithIssues = products.map((product) => {
      const issues: string[] = [];

      // Existing checks
      if (!product.published) issues.push('unpublished');
      if (product.images.length === 0) issues.push('no_images');
      if (!product.description) issues.push('no_description');
      if (!product.shortDesc) issues.push('no_short_desc');

      // New checks based on enabled display settings
      if (settings.showPrice && product.price.toNumber() === 0) {
        issues.push('missing_price');
      }
      if (settings.showBrand && !product.brand) {
        issues.push('missing_brand');
      }
      if (settings.showOrigin && !product.origin) {
        issues.push('missing_origin');
      }

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

    console.log(`✅ Returning ${productsWithIssues.length} products with issues`);
    console.log('First 3 products:', productsWithIssues.slice(0, 3).map(p => ({
      name: p.name,
      issues: p.issues,
      issueCount: p.issueCount
    })));

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
