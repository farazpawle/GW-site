import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/collections/[id]/products
 * Get products that match the collection's filter rules or manual selection
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get query parameters for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");

    // Fetch collection
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        manualProducts: {
          select: { 
            id: true,
            partId: true,
            position: true,
          },
          orderBy: {
            position: 'asc',
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

    let products;
    let total;

    // Manual mode: Return manually selected products
    if (collection.useManual) {
      total = collection.manualProducts.length;

      // Get products respecting the manual position order
      const skip = (page - 1) * limit;
      const manualProductsPage = collection.manualProducts.slice(skip, skip + limit);
      
      const partIds = manualProductsPage.map((cp: { partId: string }) => cp.partId);

      products = await prisma.part.findMany({
        where: {
          id: {
            in: partIds,
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Sort products by manual position
      const productMap = new Map(products.map((p: { id: string }) => [p.id, p]));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products = partIds.map((id: string) => productMap.get(id)).filter(Boolean) as any[];
    } else {
      // Automatic mode: Apply filter rules
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filterRules = collection.filterRules as any;

      if (!filterRules) {
        return NextResponse.json(
          { error: "Collection has no filter rules" },
          { status: 400 }
        );
      }

      // Build where clause from filter rules
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      // Category filter
      if (filterRules.categoryIds && filterRules.categoryIds.length > 0) {
        where.categoryId = {
          in: filterRules.categoryIds,
        };
      }

      // Brand filter
      if (filterRules.brands && filterRules.brands.length > 0) {
        where.brand = {
          in: filterRules.brands,
        };
      }

      // Tags filter (array contains)
      if (filterRules.tags && filterRules.tags.length > 0) {
        where.tags = {
          hasSome: filterRules.tags,
        };
      }

      // Origin filter
      if (filterRules.origins && filterRules.origins.length > 0) {
        where.origin = {
          in: filterRules.origins,
        };
      }

      // Difficulty filter
      if (filterRules.difficulties && filterRules.difficulties.length > 0) {
        where.difficulty = {
          in: filterRules.difficulties,
        };
      }

      // Price range filter
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
      products = await prisma.part.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      collectionInfo: {
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        useManual: collection.useManual,
        sortBy: collection.sortBy,
        layout: collection.layout,
      },
    });
  } catch (error) {
    console.error("Error fetching collection products:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection products" },
      { status: 500 }
    );
  }
}
