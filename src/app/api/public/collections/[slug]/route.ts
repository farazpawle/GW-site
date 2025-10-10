import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/public/collections/[slug]
 * Get a published collection with its products for public viewing
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    // Find the collection
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        manualProducts: {
          include: {
            part: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Check if published
    if (!collection.published) {
      return NextResponse.json(
        { error: "Collection not available" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let products: any[] = [];
    let total = 0;

    if (collection.useManual) {
      // Manual mode: Get products from junction table
      const skip = (page - 1) * limit;
      const manualProducts = collection.manualProducts.slice(skip, skip + limit);
      
      products = manualProducts.map((mp) => ({
        id: mp.part.id,
        name: mp.part.name,
        slug: mp.part.slug,
        description: mp.part.description,
        images: mp.part.images,
        image: mp.part.images[0] || null,
        price: mp.part.price.toNumber(),
        comparePrice: mp.part.comparePrice?.toNumber() || null,
        brand: mp.part.brand,
        tags: mp.part.tags,
        inStock: mp.part.inStock,
        category: mp.part.category,
      }));

      total = collection.manualProducts.length;
    } else {
      // Automatic mode: Apply filter rules
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filterRules = collection.filterRules as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        published: true,
      };

      if (filterRules) {
        // Category filter
        if (filterRules.categoryIds && filterRules.categoryIds.length > 0) {
          where.categoryId = { in: filterRules.categoryIds };
        }

        // Brand filter
        if (filterRules.brands && filterRules.brands.length > 0) {
          where.brand = { in: filterRules.brands };
        }

        // Tags filter
        if (filterRules.tags && filterRules.tags.length > 0) {
          where.tags = { hasSome: filterRules.tags };
        }

        // Origin filter
        if (filterRules.origins && filterRules.origins.length > 0) {
          where.origin = { in: filterRules.origins };
        }

        // Difficulty filter
        if (filterRules.difficulties && filterRules.difficulties.length > 0) {
          where.difficulty = { in: filterRules.difficulties };
        }

        // Price range
        if (filterRules.minPrice !== undefined || filterRules.maxPrice !== undefined) {
          where.price = {};
          if (filterRules.minPrice !== undefined) {
            where.price.gte = filterRules.minPrice;
          }
          if (filterRules.maxPrice !== undefined) {
            where.price.lte = filterRules.maxPrice;
          }
        }

        // Stock filter
        if (filterRules.inStock !== undefined) {
          where.inStock = filterRules.inStock;
        }

        // Featured filter
        if (filterRules.featured !== undefined) {
          where.featured = filterRules.featured;
        }
      }

      // Get total count
      total = await prisma.part.count({ where });

      // Build sort order
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let orderBy: any = {};
      switch (collection.sortBy) {
        case "name":
          orderBy = { name: "asc" };
          break;
        case "price":
          orderBy = { price: "asc" };
          break;
        case "featured":
          orderBy = { featured: "desc" };
          break;
        case "createdAt":
        default:
          orderBy = { createdAt: "desc" };
          break;
      }

      // Fetch products
      const parts = await prisma.part.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
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

      products = parts.map((part) => ({
        id: part.id,
        name: part.name,
        slug: part.slug,
        description: part.description,
        images: part.images,
        image: part.images[0] || null,
        price: part.price.toNumber(),
        comparePrice: part.comparePrice?.toNumber() || null,
        brand: part.brand,
        tags: part.tags,
        inStock: part.inStock,
        category: part.category,
      }));
    }

    return NextResponse.json({
      collection: {
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        published: collection.published,
      },
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching public collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    );
  }
}
