import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateCategorySchema, generateCategorySlug } from '@/lib/validations/category';

/**
 * GET /api/admin/categories/[id]
 * Get a single category by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { parts: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/categories/[id]
 * Update an existing category
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = updateCategorySchema.safeParse({ ...body, id });
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

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // If slug is being updated, check uniqueness (excluding current category)
    if (data.slug && data.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'A category with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // If name changed and slug not provided, regenerate slug
    let slug = data.slug;
    if (data.name && data.name !== existingCategory.name && !data.slug) {
      slug = generateCategorySlug(data.name);
      
      // Check uniqueness of generated slug
      const slugExists = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        // Append number suffix if collision
        let counter = 2;
        const baseSlug = slug;
        while (slugExists) {
          slug = `${baseSlug}-${counter}`;
          const exists = await prisma.category.findFirst({
            where: {
              slug,
              id: { not: id },
            },
          });
          if (!exists) break;
          counter++;
        }
      }
    }

    // Update category (convert empty strings to null)
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: data.name ?? existingCategory.name,
        slug: slug ?? existingCategory.slug,
        description: data.description !== undefined 
          ? (data.description && data.description.trim() !== '' ? data.description : null)
          : existingCategory.description,
        image: data.image !== undefined 
          ? (data.image && data.image.trim() !== '' ? data.image : null)
          : existingCategory.image,
      },
      include: {
        _count: {
          select: { parts: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      category: updatedCategory,
    });

  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a category (with safety check for products)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // CRITICAL SAFETY CHECK: Count products in this category
    const productCount = await prisma.part.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category with ${productCount} product${productCount > 1 ? 's' : ''}. Please reassign or delete the products first.`,
          productCount,
        },
        { status: 400 }
      );
    }

    // Delete category (only if no products)
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
