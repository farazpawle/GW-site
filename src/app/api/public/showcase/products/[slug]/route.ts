import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isEcommerceEnabled } from '@/lib/settings';

/**
 * Public Product Detail API - Mode-Aware
 * 
 * Returns a single product by slug with view tracking.
 * Conditionally includes pricing based on e-commerce mode.
 * Includes related products from the same category.
 * 
 * Path Parameter:
 * - slug: string (product slug)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check e-commerce mode
    const ecommerceEnabled = await isEcommerceEnabled();
    const mode = ecommerceEnabled ? 'ecommerce' : 'showcase';

    // Fetch product by slug with category relation
    const product = await prisma.part.findUnique({
      where: {
        slug,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Check if product exists and is published
    if (!product || !product.published) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.part.update({
      where: { id: product.id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // Serialize product and apply mode-aware logic
    const baseProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      image: product.images[0] || '',
      images: product.images, // Include full images array for gallery
      categoryId: product.categoryId,
      category: product.category,
      featured: product.featured,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      published: product.published,
      publishedAt: product.publishedAt,
      views: product.views + 1, // Include the incremented view count
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
    let serializedProduct;
    if (ecommerceEnabled) {
      serializedProduct = {
        ...baseProduct,
        price: product.price.toNumber(),
        comparePrice: product.comparePrice?.toNumber() || null,
        inStock: product.inStock,
        stockQuantity: product.stockQuantity,
      };
    } else {
      serializedProduct = baseProduct;
    }

    // Fetch related products (same category, published, exclude current product)
    const relatedProducts = await prisma.part.findMany({
      where: {
        categoryId: product.categoryId,
        published: true,
        id: {
          not: product.id,
        },
      },
      orderBy: {
        showcaseOrder: 'asc',
      },
      take: 4,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Serialize related products with mode-aware logic
    const serializedRelatedProducts = relatedProducts.map((relatedProduct) => {
      const baseRelated = {
        id: relatedProduct.id,
        name: relatedProduct.name,
        slug: relatedProduct.slug,
        description: relatedProduct.description,
        image: relatedProduct.images[0] || '',
        categoryId: relatedProduct.categoryId,
        category: relatedProduct.category,
        featured: relatedProduct.featured,
        createdAt: relatedProduct.createdAt,
        updatedAt: relatedProduct.updatedAt,
        published: relatedProduct.published,
        publishedAt: relatedProduct.publishedAt,
        views: relatedProduct.views,
        showcaseOrder: relatedProduct.showcaseOrder,
        tags: relatedProduct.tags,
        brand: relatedProduct.brand,
        origin: relatedProduct.origin,
        certifications: relatedProduct.certifications,
        warranty: relatedProduct.warranty,
        difficulty: relatedProduct.difficulty,
        application: relatedProduct.application,
        videoUrl: relatedProduct.videoUrl,
        pdfUrl: relatedProduct.pdfUrl,
      };

      // Include pricing only in e-commerce mode
      if (ecommerceEnabled) {
        return {
          ...baseRelated,
          price: relatedProduct.price.toNumber(),
          comparePrice: relatedProduct.comparePrice?.toNumber() || null,
          inStock: relatedProduct.inStock,
          stockQuantity: relatedProduct.stockQuantity,
        };
      }

      return baseRelated;
    });

    return NextResponse.json({
      success: true,
      mode,
      data: serializedProduct,
      relatedProducts: serializedRelatedProducts,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
      },
      { status: 500 }
    );
  }
}
