/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/search
 * Main search API endpoint with filtering, pagination, and analytics
 * 
 * Query Parameters:
 * - q: search query string
 * - page: page number (default: 1)
 * - categoryId: filter by category ID(s) - can be array
 * - brand: filter by brand(s) - can be array
 * - minPrice: minimum price filter
 * - maxPrice: maximum price filter
 * - tags: filter by tags - can be array
 * - sort: sort order (relevance, price-asc, price-desc, name-asc, name-desc, newest)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get current user ID from Clerk (if authenticated)
    console.log('🔍 [Search API] Starting search request...');
    const { userId } = await auth();
    console.log('🔍 [Search API] Clerk userId:', userId || 'null (not logged in)');
    
    // Extract and normalize query parameters
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sort = searchParams.get('sort') || 'relevance';
    
    // Extract array parameters (can be comma-separated or multiple params)
    const categoryIds = searchParams.getAll('categoryId').flatMap(id => id.split(','));
    const brands = searchParams.getAll('brand').flatMap(b => b.split(','));
    const tags = searchParams.getAll('tags').flatMap(t => t.split(','));
    
    // Extract price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    // Pagination settings
    const itemsPerPage = 12;
    const skip = (page - 1) * itemsPerPage;
    
    // Build search WHERE clause
    const whereConditions: Prisma.PartWhereInput[] = [];
    
    // Always filter by published products
    whereConditions.push({ published: true });
    
    // Search query across multiple fields (OR conditions)
    if (query.trim()) {
      whereConditions.push({
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { partNumber: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { shortDesc: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } },
          { compatibility: { hasSome: [query] } },
        ],
      });
    }
    
    // Category filter
    if (categoryIds.length > 0 && categoryIds[0] !== '') {
      whereConditions.push({ categoryId: { in: categoryIds } });
    }
    
    // Brand filter
    if (brands.length > 0 && brands[0] !== '') {
      whereConditions.push({ brand: { in: brands } });
    }
    
    // Tags filter
    if (tags.length > 0 && tags[0] !== '') {
      whereConditions.push({ tags: { hasSome: tags } });
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      const priceFilter: Prisma.DecimalFilter = {};
      if (minPrice) priceFilter.gte = new Prisma.Decimal(minPrice);
      if (maxPrice) priceFilter.lte = new Prisma.Decimal(maxPrice);
      whereConditions.push({ price: priceFilter });
    }
    
    // Combine all conditions with AND
    const where: Prisma.PartWhereInput = {
      AND: whereConditions,
    };
    
    // Determine sort order
    let orderBy: Prisma.PartOrderByWithRelationInput | Prisma.PartOrderByWithRelationInput[] = {};
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'name-desc':
        orderBy = { name: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        // Relevance: featured first, then by name
        orderBy = [{ featured: 'desc' }, { name: 'asc' }];
    }
    
    // Execute queries in parallel
    const [products, totalCount] = await Promise.all([
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
        take: itemsPerPage,
        skip,
      }),
      prisma.part.count({ where }),
    ]);
    
    // Serialize Decimal fields to numbers for JSON response
    const serializedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    }));
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    // Log search query to database (fire and forget - don't await)
    if (query.trim()) {
      console.log('🔍 [Search API] Logging search - User ID:', userId || 'null', 'Query:', query.trim());
      
      // Only include actual filters (non-empty values)
      const appliedFilters: Record<string, any> = {};
      if (categoryIds.length > 0 && categoryIds[0] !== '') appliedFilters.categoryIds = categoryIds;
      if (brands.length > 0 && brands[0] !== '') appliedFilters.brands = brands;
      if (tags.length > 0 && tags[0] !== '') appliedFilters.tags = tags;
      if (minPrice) appliedFilters.minPrice = minPrice;
      if (maxPrice) appliedFilters.maxPrice = maxPrice;
      if (sort && sort !== 'relevance') appliedFilters.sort = sort;
      
      // Log to SearchQuery table
      prisma.searchQuery
        .create({
          data: {
            query: query.trim(),
            filters: Object.keys(appliedFilters).length > 0 ? appliedFilters : undefined,
            resultsCount: totalCount,
            userId: userId || null,
          },
        })
        .then(() => {
          console.log('✅ [Search API] Search query logged successfully with userId:', userId || 'null');
        })
        .catch((error) => {
          console.error('❌ [Search API] Failed to log search query:', error);
        });
      
      // Update SearchAnalytics (upsert to increment count)
      prisma.searchAnalytics
        .upsert({
          where: { term: query.trim().toLowerCase() },
          update: {
            count: { increment: 1 },
            lastSearched: new Date(),
          },
          create: {
            term: query.trim().toLowerCase(),
            count: 1,
            lastSearched: new Date(),
          },
        })
        .catch((error) => {
          console.error('Failed to update search analytics:', error);
        });
    }
    
    // Return response
    return NextResponse.json({
      results: serializedProducts,
      metadata: {
        totalCount,
        currentPage: page,
        totalPages,
        itemsPerPage,
        query,
        appliedFilters: {
          categoryIds: categoryIds.filter(id => id !== ''),
          brands: brands.filter(b => b !== ''),
          tags: tags.filter(t => t !== ''),
          minPrice,
          maxPrice,
          sort,
        },
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
