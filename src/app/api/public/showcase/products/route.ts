import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isEcommerceEnabled } from '@/lib/settings';
import { Prisma } from '@prisma/client';

/**
 * Public Product List API - Mode-Aware
 * 
 * Returns published products with filtering, search, sorting, and pagination.
 * Conditionally includes pricing based on e-commerce mode.
 * 
 * Query Parameters:
 * - search: string (search in name/description)
 * - category: string (category slug)
 * - tags: string[] (comma-separated)
 * - brand: string
 * - origin: string
 * - difficulty: string (Easy, Moderate, Professional, Advanced)
 * - application: string[] (comma-separated)
 * - featured: boolean
 * - sort: string (name-asc, name-desc, price-asc, price-desc, newest, oldest, popular)
 * - page: number (default: 1)
 * - limit: number (default: 12, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check e-commerce mode
    const ecommerceEnabled = await isEcommerceEnabled();
    const mode = ecommerceEnabled ? 'ecommerce' : 'showcase';

    // Parse query parameters
    const search = searchParams.get('search') || undefined;
    const categorySlug = searchParams.get('category') || undefined;
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').map(t => t.trim()).filter(Boolean) : undefined;
    const brand = searchParams.get('brand') || undefined;
    const origin = searchParams.get('origin') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const applicationParam = searchParams.get('application');
    const application = applicationParam ? applicationParam.split(',').map(a => a.trim()).filter(Boolean) : undefined;
    const featuredParam = searchParams.get('featured');
    const featured = featuredParam === 'true' ? true : featuredParam === 'false' ? false : undefined;
    const sort = searchParams.get('sort') || 'showcaseOrder-asc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    // Build where clause
    const where: Prisma.PartWhereInput = {
      published: true,
    };

    // Search filter (name and description)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    // Tags filter (at least one tag matches)
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    // Brand filter
    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    // Origin filter
    if (origin) {
      where.origin = { contains: origin, mode: 'insensitive' };
    }

    // Difficulty filter
    if (difficulty) {
      where.difficulty = difficulty;
    }

    // Application filter (at least one application matches)
    if (application && application.length > 0) {
      where.application = {
        hasSome: application,
      };
    }

    // Featured filter
    if (featured !== undefined) {
      where.featured = featured;
    }

    // Determine sorting
    let orderBy: Prisma.PartOrderByWithRelationInput = {};
    switch (sort) {
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'name-desc':
        orderBy = { name: 'desc' };
        break;
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { publishedAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { publishedAt: 'asc' };
        break;
      case 'popular':
        orderBy = { views: 'desc' };
        break;
      case 'showcaseOrder-asc':
      default:
        orderBy = { showcaseOrder: 'asc' };
        break;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch products with category relation
    const [products, totalCount] = await Promise.all([
      prisma.part.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.part.count({ where }),
    ]);

    // Serialize products and apply mode-aware logic
    const serializedProducts = products.map((product) => {
      const baseProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        image: product.images[0] || '',
        categoryId: product.categoryId,
        category: product.category,
        featured: product.featured,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        published: product.published,
        publishedAt: product.publishedAt,
        views: product.views,
        showcaseOrder: product.showcaseOrder,
        tags: product.tags,
        brand: product.brand,
        origin: product.origin,
        certifications: product.certifications,
        warranty: product.warranty,
        difficulty: product.difficulty,
        application: product.application,
        videoUrl: product.videoUrl,
        pdfUrl: product.pdfUrl,
      };

      // Include pricing only in e-commerce mode
      if (ecommerceEnabled) {
        return {
          ...baseProduct,
          price: product.price.toNumber(),
          comparePrice: product.comparePrice?.toNumber() || null,
          inStock: product.inStock,
          stockQuantity: product.stockQuantity,
        };
      }

      return baseProduct;
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      mode,
      data: serializedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}
