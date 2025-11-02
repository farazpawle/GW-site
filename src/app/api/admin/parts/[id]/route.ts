import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateProductSchema, generateSlug } from '@/lib/validations/product';
import { deleteFile, extractKeyFromUrl } from '@/lib/minio';
import { DEFAULT_IMAGES } from '@/lib/default-images';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/parts/[id]
 * Get a single product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const part = await prisma.part.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!part) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Convert Decimal objects to plain numbers
    const serializedPart = {
      ...part,
      price: Number(part.price),
      comparePrice: part.comparePrice ? Number(part.comparePrice) : null,
      compareAtPrice: part.compareAtPrice ? Number(part.compareAtPrice) : null,
    };

    return NextResponse.json({
      success: true,
      data: serializedPart,
    });

  } catch (error) {
    console.error('Error fetching part:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/parts/[id]
 * Update an existing product
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
    const validatedData = updateProductSchema.parse({ ...body, id });

    // Check if product exists
    const existingPart = await prisma.part.findUnique({
      where: { id },
    });

    if (!existingPart) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check for duplicate part number (excluding current product)
    if (validatedData.partNumber) {
      const duplicatePart = await prisma.part.findFirst({
        where: {
          partNumber: validatedData.partNumber,
          NOT: { id },
        },
      });

      if (duplicatePart) {
        return NextResponse.json(
          { success: false, error: 'A product with this part number already exists' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate SKU (excluding current product)
    if (validatedData.sku) {
      const duplicateSku = await prisma.part.findFirst({
        where: {
          sku: validatedData.sku,
          NOT: { id },
        },
      });

      if (duplicateSku) {
        return NextResponse.json(
          { success: false, error: 'A product with this SKU already exists' },
          { status: 409 }
        );
      }
    }

    // Generate new slug if name changed
    let slug = existingPart.slug;
    if (validatedData.name && validatedData.name !== existingPart.name) {
      slug = generateSlug(validatedData.name);

      // Check for duplicate slug (excluding current product)
      const existingSlug = await prisma.part.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      // If slug exists, append random suffix
      if (existingSlug) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
      }
    }

    // Prepare update data (remove id and transform categoryId)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, categoryId, ...updateData } = validatedData;

    // Ensure images array has at least the default image if empty
    // This creates a fluent chain: Form submits empty array → API inserts default → DB stores default → Frontend displays from DB
    const images = updateData.images !== undefined
      ? (updateData.images && updateData.images.length > 0
          ? updateData.images
          : [DEFAULT_IMAGES.PRODUCT])
      : undefined;

    // Handle publishedAt auto-setting
    // If published is changing from false to true, set publishedAt to current time
    const publishedAtUpdate: { publishedAt?: Date | null } = {};
    if (updateData.published !== undefined) {
      if (updateData.published && !existingPart.published) {
        // Product is being published for the first time
        publishedAtUpdate.publishedAt = new Date();
      } else if (!updateData.published) {
        // Product is being unpublished, clear publishedAt
        publishedAtUpdate.publishedAt = null;
      }
    }

    // Transform categoryId to category relation if present
    const categoryUpdate = categoryId !== undefined 
      ? { category: { connect: { id: categoryId } } }
      : {};

    // Update product with all validated fields including inventory
    const part = await prisma.part.update({
      where: { id },
      data: {
        ...updateData,
        ...publishedAtUpdate,
        ...categoryUpdate,
        images,
        slug,
        specifications: updateData.specifications !== undefined 
          ? updateData.specifications || Prisma.JsonNull
          : undefined,
      },
      include: { category: true },
    });

    // Convert Decimal objects to plain numbers
    const serializedPart = {
      ...part,
      price: Number(part.price),
      comparePrice: part.comparePrice ? Number(part.comparePrice) : null,
      compareAtPrice: part.compareAtPrice ? Number(part.compareAtPrice) : null,
    };

    return NextResponse.json({
      success: true,
      data: serializedPart,
    });

  } catch (error) {
    console.error('Error updating part:', error);

    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      const zodError = error as { issues?: Array<{ path: string[]; message: string }> };
      const errorMessages = zodError.issues?.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errorMessages || 'Invalid data' },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error occurred' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/parts/[id]
 * Delete a product and its images from MinIO
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Fetch product to get image URLs
    const part = await prisma.part.findUnique({
      where: { id },
    });

    if (!part) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete images from MinIO
    const imageDeletePromises = part.images.map(async (imageUrl) => {
      try {
        const key = extractKeyFromUrl(imageUrl);
        await deleteFile(key);
      } catch (error) {
        console.error(`Failed to delete image ${imageUrl}:`, error);
        // Continue even if image deletion fails
      }
    });

    await Promise.allSettled(imageDeletePromises);

    // Delete product from database (cascade deletes orderItems)
    await prisma.part.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting part:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
