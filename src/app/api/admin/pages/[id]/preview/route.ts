import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/pages/[id]/preview
 * Preview products that will appear on this page based on groupValues
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate admin user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get page ID from params
    const { id } = await params;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Fetch page
    const pageData = await prisma.page.findUnique({
      where: { id }
    });

    if (!pageData) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Parse groupValues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupValues = pageData.groupValues as any;
    
    // Build Prisma where clause based on groupType
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { published: true };

    switch (pageData.groupType) {
      case 'category':
        if (groupValues.categoryIds && groupValues.categoryIds.length > 0) {
          where.categoryId = { in: groupValues.categoryIds };
        }
        break;

      case 'tag':
        if (groupValues.tags && groupValues.tags.length > 0) {
          where.tags = { hasSome: groupValues.tags };
        }
        break;

      case 'collection':
        if (groupValues.collectionId) {
          // Fetch collection and apply its filters
          const collection = await prisma.collection.findUnique({
            where: { id: groupValues.collectionId }
          });

          if (collection) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filterRules = collection.filterRules as any;
            
            // Apply collection filters
            if (filterRules.categoryIds?.length) {
              where.categoryId = { in: filterRules.categoryIds };
            }
            if (filterRules.brands?.length) {
              where.brand = { in: filterRules.brands };
            }
            if (filterRules.tags?.length) {
              where.tags = { hasSome: filterRules.tags };
            }
            if (filterRules.origins?.length) {
              where.origin = { in: filterRules.origins };
            }
            if (filterRules.inStock) {
              where.stockQuantity = { gt: 0 };
            }
            if (filterRules.featured !== undefined) {
              where.featured = filterRules.featured;
            }
            if (filterRules.minPrice) {
              where.price = { ...where.price, gte: filterRules.minPrice };
            }
            if (filterRules.maxPrice) {
              where.price = { ...where.price, lte: filterRules.maxPrice };
            }
          }
        }
        break;

      case 'all':
        // No additional filters - show all published products
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid group type' },
          { status: 400 }
        );
    }

    // Apply additional filters from groupValues
    if (groupValues.brands?.length) {
      where.brand = { in: groupValues.brands };
    }
    if (groupValues.origins?.length) {
      where.origin = { in: groupValues.origins };
    }
    if (groupValues.minPrice !== undefined) {
      where.price = { ...where.price, gte: groupValues.minPrice };
    }
    if (groupValues.maxPrice !== undefined) {
      where.price = { ...where.price, lte: groupValues.maxPrice };
    }
    if (groupValues.inStock) {
      where.stockQuantity = { gt: 0 };
    }

    // Determine sort order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { name: 'asc' };
    switch (pageData.sortBy) {
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'price':
        orderBy = { price: 'asc' };
        break;
      case 'createdAt':
        orderBy = { createdAt: 'desc' };
        break;
      case 'featured':
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.part.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.part.count({ where })
    ]);

    return NextResponse.json({
      page: pageData,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error previewing page products:', error);
    return NextResponse.json(
      { error: 'Failed to preview page products' },
      { status: 500 }
    );
  }
}
