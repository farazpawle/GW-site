/**
 * Product Preview API
 * POST /api/admin/collections/preview
 * 
 * Preview products that match given filter rules
 * Used when creating/editing collections to see what products will be included
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildProductWhereClause, getCollectionSortOrder, CollectionSortBy } from '@/lib/product-filters';
import { collectionFilterRulesSchema } from '@/lib/validations/collection';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { filterRules, page = 1, pageSize = 12, sortBy = 'created_desc' } = body;

    // Validate filter rules
    let validatedFilters;
    try {
      validatedFilters = collectionFilterRulesSchema.parse(filterRules);
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid filter rules',
            details: validationError.issues,
          },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // Build Prisma where clause from filter rules
    const where = buildProductWhereClause(validatedFilters);

    // Always ensure only published products
    where.published = true;

    // Get sort order
    const orderBy = getCollectionSortOrder(sortBy as CollectionSortBy);

    // Fetch products with pagination
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
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.part.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          partNumber: product.partNumber,
          slug: product.slug,
          price: product.price.toString(),
          comparePrice: product.comparePrice?.toString(),
          images: product.images,
          brand: product.brand,
          origin: product.origin,
          tags: product.tags,
          featured: product.featured,
          category: product.category,
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error('Error previewing products:', error);

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
        error: 'Failed to preview products',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
