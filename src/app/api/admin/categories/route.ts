import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin, checkPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCategorySchema, generateCategorySlug } from '@/lib/validations/category';

/**
 * GET /api/admin/categories
 * Get all categories with product counts
 */
export async function GET() {
  try {
    // Verify admin authentication
    const user = await checkPermission('categories.view');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all categories with product count
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { parts: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
      categories, // Keep for backward compatibility
    });

  } catch (error) {
    console.error('Get categories error:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await checkPermission('categories.create');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = createCategorySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Auto-generate slug if not provided
    let slug = data.slug || generateCategorySlug(data.name);

    // Check slug uniqueness and append number if exists
    let slugExists = await prisma.category.findUnique({
      where: { slug },
    });

    let counter = 2;
    const baseSlug = slug;
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await prisma.category.findUnique({
        where: { slug },
      });
      counter++;
    }

    // Create category (convert empty strings to null)
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description && data.description.trim() !== '' ? data.description : null,
        image: data.image && data.image.trim() !== '' ? data.image : null,
      },
      include: {
        _count: {
          select: { parts: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      category,
    }, { status: 201 });

  } catch (error) {
    console.error('Create category error:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'A category with this name or slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
