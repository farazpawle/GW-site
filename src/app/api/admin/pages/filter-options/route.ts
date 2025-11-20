import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/pages/filter-options
 * Returns all available filter options for creating dynamic pages
 * - Categories (id, name)
 * - Tags (unique list)
 * - Brands (unique list)
 * - Origins (unique list)
 * - Collections (id, name)
 */
export async function GET() {
  try {
    // Fetch all categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Fetch all collections
    const collections = await prisma.collection.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get unique tags from all products
    const partsWithTags = await prisma.part.findMany({
      where: {
        tags: {
          isEmpty: false,
        },
      },
      select: {
        tags: true,
      },
    });

    const allTags = new Set<string>();
    partsWithTags.forEach((part) => {
      part.tags.forEach((tag) => allTags.add(tag));
    });
    const tags = Array.from(allTags).sort();

    // Get unique brands from all products
    const partsWithBrands = await prisma.part.findMany({
      where: {
        brand: {
          not: null,
        },
      },
      select: {
        brand: true,
      },
      distinct: ['brand'],
    });
    const brands = partsWithBrands
      .map((p) => p.brand)
      .filter((b): b is string => b !== null)
      .sort();

    // Get unique origins from all products
    const partsWithOrigins = await prisma.part.findMany({
      where: {
        origin: {
          not: null,
        },
      },
      select: {
        origin: true,
      },
      distinct: ['origin'],
    });
    const origins = partsWithOrigins
      .map((p) => p.origin)
      .filter((o): o is string => o !== null)
      .sort();

    return NextResponse.json({
      categories,
      collections,
      tags,
      brands,
      origins,
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}
