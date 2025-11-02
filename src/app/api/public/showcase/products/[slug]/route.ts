import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isEcommerceEnabled } from '@/lib/settings';
import type { Part } from '@prisma/client';

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

    // Fetch product by slug with category relation and cross-reference data
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
        crossReferences: {
          include: {
            referencedPart: {
              select: {
                id: true,
                name: true,
                slug: true,
                brand: true,
                price: true,
                comparePrice: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        oemPartNumbers: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        vehicleCompatibility: {
          orderBy: [
            { make: 'asc' },
            { model: 'asc' },
            { yearStart: 'desc' },
          ],
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

    // Serialize cross-references with price conversion for referencedPart
    const serializedCrossReferences = (product.crossReferences || []).map((ref) => ({
      id: ref.id,
      referenceType: ref.referenceType,
      brandName: ref.brandName,
      partNumber: ref.partNumber,
      referencedPartId: ref.referencedPartId,
      notes: ref.notes,
      createdAt: ref.createdAt,
      referencedPart: ref.referencedPart ? {
        id: ref.referencedPart.id,
        name: ref.referencedPart.name,
        slug: ref.referencedPart.slug,
        brand: ref.referencedPart.brand,
        price: ecommerceEnabled ? ref.referencedPart.price.toNumber() : null,
        comparePrice: ecommerceEnabled && ref.referencedPart.comparePrice
          ? ref.referencedPart.comparePrice.toNumber()
          : null,
      } : null,
    }));

    // Serialize OEM part numbers
    const serializedOEMNumbers = (product.oemPartNumbers || []).map((oem) => ({
      id: oem.id,
      manufacturer: oem.manufacturer,
      oemPartNumber: oem.oemPartNumber,
      notes: oem.notes,
      createdAt: oem.createdAt,
    }));

    // Serialize vehicle compatibility
    const serializedVehicleCompatibility = (product.vehicleCompatibility || []).map((compat) => ({
      id: compat.id,
      make: compat.make,
      model: compat.model,
      yearStart: compat.yearStart,
      yearEnd: compat.yearEnd,
      engine: compat.engine,
      trim: compat.trim,
      position: compat.position,
      notes: compat.notes,
      createdAt: compat.createdAt,
    }));

    // Serialize product and apply mode-aware logic
    const defaultImage = '/images/placeholder-product.svg';
    const baseProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      partNumber: product.partNumber,
      sku: product.sku,
      image: product.images && product.images.length > 0 ? product.images[0] : defaultImage,
      images: product.images && product.images.length > 0 ? product.images : [defaultImage], // Include full images array for gallery
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
      application: product.application,
      pdfUrl: product.pdfUrl,
      crossReferences: serializedCrossReferences,
      oemPartNumbers: serializedOEMNumbers,
      vehicleCompatibility: serializedVehicleCompatibility,
    };

    // Include pricing and inventory only in e-commerce mode
    let serializedProduct;
    if (ecommerceEnabled) {
      serializedProduct = {
        ...baseProduct,
        price: product.price.toNumber(),
        comparePrice: product.comparePrice?.toNumber() || null,
        inStock: (product as any).inStock,
        stockQuantity: (product as any).stockQuantity,
      };
    } else {
      serializedProduct = baseProduct;
    }

    // Fetch related products
    // Priority: 1) Manually selected relatedProductIds, 2) Fallback to same category
    let relatedProducts = [];
    
    // Access relatedProductIds field (new field may not be in TS cache yet)
    const productRelatedIds = (product as typeof product & { relatedProductIds: string[] }).relatedProductIds;
    
    if (productRelatedIds && productRelatedIds.length > 0) {
      // Use manually selected related products
      relatedProducts = await prisma.part.findMany({
        where: {
          id: {
            in: productRelatedIds,
          },
          published: true, // Only show published products
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
    } else {
      // Fallback: same category, published, exclude current product
      relatedProducts = await prisma.part.findMany({
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
    }

    // Serialize related products with mode-aware logic
    const serializedRelatedProducts = relatedProducts.map((relatedProduct) => {
      const baseRelated = {
        id: relatedProduct.id,
        name: relatedProduct.name,
        slug: relatedProduct.slug,
        description: relatedProduct.description,
        image: relatedProduct.images && relatedProduct.images.length > 0 
          ? relatedProduct.images[0] 
          : defaultImage,
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
        application: relatedProduct.application,
        pdfUrl: relatedProduct.pdfUrl,
      };

      // Include pricing and inventory only in e-commerce mode
      if (ecommerceEnabled) {
        return {
          ...baseRelated,
          price: relatedProduct.price.toNumber(),
          comparePrice: relatedProduct.comparePrice?.toNumber() || null,
          inStock: (relatedProduct as any).inStock,
          stockQuantity: (relatedProduct as any).stockQuantity,
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
