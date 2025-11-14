import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Disable caching for this API route
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);

    // Fetch page data
    const pageData = await prisma.page.findFirst({
      where: {
        slug,
        published: true,
      },
    });

    if (!pageData) {
      return NextResponse.json(
        { error: "Page not found or not published" },
        { status: 404 },
      );
    }

    // If it's a static page, return just the page data with content
    if (pageData.pageType === "static") {
      return NextResponse.json({
        page: {
          id: pageData.id,
          title: pageData.title,
          slug: pageData.slug,
          description: pageData.description,
          pageType: pageData.pageType,
          content: pageData.content,
          metaTitle: pageData.metaTitle,
          metaDescription: pageData.metaDesc,
        },
      });
    }

    const itemsPerPage = pageData.itemsPerPage || 24;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupValues = pageData.groupValues as any;
    const featuredOnly = groupValues?.featuredOnly === true;

    // Build product query based on group type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { published: true };

    // Apply filters based on groupType and groupValues
    switch (pageData.groupType) {
      case "category":
        if (groupValues?.categoryIds?.length > 0) {
          where.categoryId = { in: groupValues.categoryIds };
        }
        break;

      case "tag":
        if (groupValues?.tags?.length > 0) {
          where.tags = { hasSome: groupValues.tags };
        }
        break;

      case "brand":
        if (groupValues?.brands?.length > 0) {
          where.brand = { in: groupValues.brands };
        }
        break;

      case "origin":
        if (groupValues?.origins?.length > 0) {
          where.origin = { in: groupValues.origins };
        }
        break;

      case "collection":
        if (groupValues?.collectionId) {
          const collection = await prisma.collection.findUnique({
            where: { id: groupValues.collectionId },
            include: {
              manualProducts: {
                select: { partId: true },
              },
            },
          });

          if (collection) {
            if (collection.useManual) {
              where.id = {
                in: collection.manualProducts.map((mp) => mp.partId),
              };
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const filterRules = collection.filterRules as any;
              if (filterRules?.categoryIds?.length) {
                where.categoryId = { in: filterRules.categoryIds };
              }
              if (filterRules?.brands?.length) {
                where.brand = { in: filterRules.brands };
              }
              if (filterRules?.tags?.length) {
                where.tags = { hasSome: filterRules.tags };
              }
              if (filterRules?.minPrice !== undefined) {
                where.price = { ...where.price, gte: filterRules.minPrice };
              }
              if (filterRules?.maxPrice !== undefined) {
                where.price = { ...where.price, lte: filterRules.maxPrice };
              }
              if (filterRules?.inStock) {
                where.stockQuantity = { gt: 0 };
              }
            }
          }
        }
        break;

      case "all":
      default:
        // No additional filters - show all published products
        break;
    }

    // Apply additional optional filters from groupValues (if specified)
    if (groupValues?.minPrice !== undefined) {
      where.price = { ...where.price, gte: groupValues.minPrice };
    }
    if (groupValues?.maxPrice !== undefined) {
      where.price = { ...where.price, lte: groupValues.maxPrice };
    }
    if (groupValues?.inStock === true) {
      where.stockQuantity = { gt: 0 };
    }
    if (featuredOnly) {
      where.featured = true;
    }

    // Determine sort order based on page settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortMap: Record<string, any> = {
      name: { name: "asc" },
      price: { price: "asc" },
      newest: { createdAt: "desc" },
    };
    const orderBy = sortMap[pageData.sortBy || "name"] || { name: "asc" };

    // Fetch products and total count
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
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
      }),
      prisma.part.count({ where }),
    ]);

    // Convert Decimal types to numbers for JSON serialization
    const serializedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      partNumber: product.partNumber,
      sku: product.sku,
      description: product.description,
      price: product.price ? Number(product.price) : 0,
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      images: product.images,
      image: product.images[0] || "",
      brand: product.brand,
      origin: product.origin,
      tags: product.tags,
      category: product.category,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
    }));

    // Debug logging - REMOVE AFTER VERIFICATION
    if (serializedProducts.length > 0) {
      console.log("🔧 Pages API Debug - First product:", {
        name: serializedProducts[0].name,
        partNumber: serializedProducts[0].partNumber,
        sku: serializedProducts[0].sku,
        brand: serializedProducts[0].brand,
        origin: serializedProducts[0].origin,
        category: serializedProducts[0].category,
        hasAllFields: !!(
          serializedProducts[0].partNumber &&
          serializedProducts[0].brand &&
          serializedProducts[0].category
        ),
      });
    }

    return NextResponse.json({
      page: {
        id: pageData.id,
        title: pageData.title,
        slug: pageData.slug,
        description: pageData.description,
        pageType: pageData.pageType,
        groupType: pageData.groupType,
        layout: pageData.layout,
        metaTitle: pageData.metaTitle,
        metaDescription: pageData.metaDesc,
      },
      products: serializedProducts,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / itemsPerPage),
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 },
    );
  }
}
