import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/search/suggestions
 * Fast autocomplete suggestions API for search bar
 * 
 * Query Parameters:
 * - q: search query string (minimum 2 characters)
 * 
 * Returns:
 * - products: top 5 matching products (id, name, partNumber, slug, image)
 * - categories: top 3 matching categories (id, name, slug)
 * 
 * Performance Target: <200ms
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    // Require minimum 2 characters for suggestions
    if (query.trim().length < 2) {
      return NextResponse.json({
        products: [],
        categories: [],
      });
    }
    
    // Execute both queries in parallel for speed
    const [products, categories] = await Promise.all([
      // Search products by name or part number
      prisma.part.findMany({
        where: {
          AND: [
            { published: true },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { partNumber: { contains: query, mode: 'insensitive' } },
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          partNumber: true,
          slug: true,
          images: true,
          price: true,
        },
        orderBy: [
          { featured: 'desc' }, // Featured products first
          { name: 'asc' },
        ],
        take: 5, // Limit to top 5 results
      }),
      
      // Search categories by name
      prisma.category.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          name: 'asc',
        },
        take: 3, // Limit to top 3 results
      }),
    ]);
    
    // Serialize product data (convert Decimal to Number, get first image)
    const serializedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      partNumber: product.partNumber,
      slug: product.slug,
      image: product.images[0] || null,
      price: Number(product.price),
    }));
    
    return NextResponse.json({
      products: serializedProducts,
      categories,
    });
  } catch (error) {
    console.error('Search suggestions API error:', error);
    
    // Return empty results on error (fail gracefully)
    return NextResponse.json({
      products: [],
      categories: [],
    });
  }
}
