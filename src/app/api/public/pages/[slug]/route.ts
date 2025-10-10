import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    
    // Fetch page data
    const pageData = await prisma.page.findFirst({
      where: {
        slug,
        published: true,
      },
    });

    if (!pageData) {
      return NextResponse.json(
        { error: 'Page not found or not published' },
        { status: 404 }
      );
    }

    const itemsPerPage = pageData.itemsPerPage || 24;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupValues = pageData.groupValues as any;

    // Build product query based on group type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { published: true };

    switch (pageData.groupType) {
      case 'category':
        if (groupValues?.categoryIds?.length) {
          where.categoryId = { in: groupValues.categoryIds };
        }
        break;

      case 'tag':
        if (groupValues?.tags?.length) {
          where.tags = { hasSome: groupValues.tags };
        }
        break;

      case 'brand':
        if (groupValues?.brands?.length) {
          where.brand = { in: groupValues.brands };
        }
        break;

      case 'origin':
        if (groupValues?.origins?.length) {
          where.origin = { in: groupValues.origins };
        }
        break;

      case 'collection':
        if (groupValues?.collectionId) {
          // Fetch collection products
          const collection = await prisma.collection.findUnique({
            where: { id: groupValues.collectionId },
            include: {
              manualProducts: {
                select: { partId: true },
              },
            },
          });

          if (collection) {
            if (collection.useManual) {
              // Manual collection
              where.id = { in: collection.manualProducts.map((mp) => mp.partId) };
            } else {
              // Automatic collection with filters
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const filterRules = collection.filterRules as any;
              if (filterRules?.categoryIds?.length) {
                where.categoryId = { in: filterRules.categoryIds };
              }
              if (filterRules?.brands?.length) {
                where.brand = { in: filterRules.brands };
              }
              if (filterRules?.tags?.length) {
                where.tags = { hasSome: filterRules.tags };
              }
              if (filterRules?.minPrice !== undefined) {
                where.price = { ...where.price, gte: filterRules.minPrice };
              }
              if (filterRules?.maxPrice !== undefined) {
                where.price = { ...where.price, lte: filterRules.maxPrice };
              }
              if (filterRules?.inStock) {
                where.stockQuantity = { gt: 0 };
              }
              if (filterRules?.featured) {
                where.featured = true;
              }
            }
          }
        }
        break;

      case 'all':
      default:
        // No additional filters for "all" type
        break;
    }

    // Apply additional filters from groupValues
    if (groupValues?.brands?.length && pageData.groupType !== 'brand') {
      where.brand = { in: groupValues.brands };
    }
    if (groupValues?.origins?.length && pageData.groupType !== 'origin') {
      where.origin = { in: groupValues.origins };
    }
    if (groupValues?.minPrice !== undefined) {
      where.price = { ...where.price, gte: groupValues.minPrice };
    }
    if (groupValues?.maxPrice !== undefined) {
      where.price = { ...where.price, lte: groupValues.maxPrice };
    }
    if (groupValues?.inStock) {
      where.stockQuantity = { gt: 0 };
    }
    if (groupValues?.featured) {
      where.featured = true;
    }

    // Determine sort order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortMap: Record<string, any> = {
      createdAt: { createdAt: 'desc' },
      updatedAt: { updatedAt: 'desc' },
      name: { name: 'asc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      popular: { viewCount: 'desc' },
    };
    const orderBy = sortMap[pageData.sortBy || 'createdAt'] || { createdAt: 'desc' };

    // Fetch products and total count
    const [products, total] = await Promise.all([
      prisma.part.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
      }),
      prisma.part.count({ where }),
    ]);

    // Convert Decimal types to numbers for JSON serialization
    const serializedProducts = products.map(product => ({
      ...product,
      price: product.price ? Number(product.price) : 0,
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    }));

    return NextResponse.json({
      page: {
        id: pageData.id,
        title: pageData.title,
        slug: pageData.slug,
        description: pageData.description,
        groupType: pageData.groupType,
        layout: pageData.layout,
        metaTitle: pageData.metaTitle,
        metaDescription: pageData.metaDesc,
      },
      products: serializedProducts,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / itemsPerPage),
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}
