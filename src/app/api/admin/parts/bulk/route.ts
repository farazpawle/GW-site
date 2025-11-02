import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bulkOperationSchema } from '@/lib/validations/product';
import { deleteFile, extractKeyFromUrl, BUCKETS } from '@/lib/minio';
import { Prisma } from '@prisma/client';

/**
 * POST /api/admin/parts/bulk
 * Handle bulk operations on products
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    // Validate request body
    const validatedData = bulkOperationSchema.parse(body);
    const { ids, operation, data } = validatedData;

    switch (operation) {
      case 'delete': {
        // Fetch all products to get image URLs
        const products = await prisma.part.findMany({
          where: { id: { in: ids } },
          select: { id: true, images: true },
        });

        // Delete all images from MinIO
        const imageDeletePromises: Promise<void>[] = [];
        products.forEach((product) => {
          product.images.forEach((imageUrl) => {
            imageDeletePromises.push(
              (async () => {
                try {
                  const key = extractKeyFromUrl(imageUrl);
                  await deleteFile(BUCKETS.PRODUCT_IMAGES, key);
                } catch (error) {
                  console.error(`Failed to delete image ${imageUrl}:`, error);
                  // Continue even if image deletion fails
                }
              })()
            );
          });
        });

        await Promise.allSettled(imageDeletePromises);

        // Delete products from database
        const result = await prisma.part.deleteMany({
          where: { id: { in: ids } },
        });

        return NextResponse.json({
          success: true,
          message: `Successfully deleted ${result.count} product(s)`,
          count: result.count,
        });
      }

      case 'updateStock': {
        if (!data || data.inStock === undefined) {
          return NextResponse.json(
            { success: false, error: 'Stock status (inStock) is required for updateStock operation' },
            { status: 400 }
          );
        }

        const result = await prisma.part.updateMany({
          where: { id: { in: ids } },
          data: { inStock: data.inStock },
        });

        return NextResponse.json({
          success: true,
          message: `Successfully updated stock status for ${result.count} product(s)`,
          count: result.count,
        });
      }

      case 'updateFeatured': {
        if (!data || data.featured === undefined) {
          return NextResponse.json(
            { success: false, error: 'Featured status is required for updateFeatured operation' },
            { status: 400 }
          );
        }

        const result = await prisma.part.updateMany({
          where: { id: { in: ids } },
          data: { featured: data.featured },
        });

        return NextResponse.json({
          success: true,
          message: `Successfully updated featured status for ${result.count} product(s)`,
          count: result.count,
        });
      }

      case 'updatePublished': {
        if (!data || data.published === undefined) {
          return NextResponse.json(
            { success: false, error: 'Published status is required for updatePublished operation' },
            { status: 400 }
          );
        }

        const updateData: Prisma.PartUpdateManyMutationInput = { published: data.published };
        
        // If publishing, set publishedAt to now; if unpublishing, set to null
        if (data.published) {
          updateData.publishedAt = new Date();
        } else {
          updateData.publishedAt = null;
        }

        const result = await prisma.part.updateMany({
          where: { id: { in: ids } },
          data: updateData,
        });

        return NextResponse.json({
          success: true,
          message: `Successfully ${data.published ? 'published' : 'unpublished'} ${result.count} product(s)`,
          count: result.count,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in bulk operation:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
