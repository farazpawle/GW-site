/**
 * Filter Options API
 * GET /api/admin/collections/filter-options
 * 
 * Returns all available filter options from the database for building collection filters
 * - Unique tags from products
 * - Unique brands from products
 * - All categories
 * - Unique origins from products
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Require admin authentication
    await requireAdmin();

    // Fetch all published products to extract unique values
    const products = await prisma.part.findMany({
      where: { published: true },
      select: {
        brand: true,
        origin: true,
        tags: true,
      },
    });

    // Extract unique brands (filter out null/empty)
    const brandsSet = new Set<string>();
    products.forEach((product: { brand: string | null }) => {
      if (product.brand && product.brand.trim()) {
        brandsSet.add(product.brand.trim());
      }
    });
    const brands = Array.from(brandsSet).sort();

    // Extract unique origins (filter out null/empty)
    const originsSet = new Set<string>();
    products.forEach((product: { origin: string | null }) => {
      if (product.origin && product.origin.trim()) {
        originsSet.add(product.origin.trim());
      }
    });
    const origins = Array.from(originsSet).sort();

    // Flatten and deduplicate tags
    const tagsSet = new Set<string>();
    products.forEach((product: { tags: string[] }) => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag: string) => {
          if (tag && tag.trim()) {
            tagsSet.add(tag.trim());
          }
        });
      }
    });
    const tags = Array.from(tagsSet).sort();

    // Fetch all categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        categories,
        brands,
        origins,
        tags,
      },
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);

    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please sign in as an admin.',
        },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch filter options',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
