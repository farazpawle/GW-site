import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { collectionSchema } from "@/lib/validations/collection";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/**
 * GET /api/admin/collections
 * List all collections with pagination and filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const published = searchParams.get("published"); // "true", "false", or null (all)
    const useManual = searchParams.get("useManual"); // "true", "false", or null (all)

    // Build where clause with proper typing
    const where: Prisma.CollectionWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (published !== null) {
      where.published = published === "true";
    }

    if (useManual !== null) {
      where.useManual = useManual === "true";
    }

    // Get total count
    const total = await prisma.collection.count({ where });

    // Get paginated collections
    const collections = await prisma.collection.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            manualProducts: true,
          },
        },
      },
    });

    return NextResponse.json({
      collections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/collections
 * Create a new collection
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = collectionSchema.parse(body);

    // Check for duplicate slug
    const existingCollection = await prisma.collection.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingCollection) {
      return NextResponse.json(
        { error: "A collection with this slug already exists" },
        { status: 409 }
      );
    }

    // If manual mode, validate that all product IDs exist
    if (validatedData.useManual && validatedData.manualProductIds) {
      const productCount = await prisma.part.count({
        where: {
          id: {
            in: validatedData.manualProductIds,
          },
        },
      });

      if (productCount !== validatedData.manualProductIds.length) {
        return NextResponse.json(
          { error: "Some product IDs do not exist" },
          { status: 400 }
        );
      }
    }

    // Create collection with proper typing
    const collection = await prisma.collection.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        filterRules: validatedData.filterRules as Prisma.InputJsonValue,
        useManual: validatedData.useManual,
        layout: validatedData.layout,
        sortBy: validatedData.sortBy,
        itemsPerPage: validatedData.itemsPerPage,
        metaTitle: validatedData.metaTitle || null,
        metaDesc: validatedData.metaDescription || null,
        published: validatedData.published,
        publishedAt: validatedData.published ? new Date() : null,
        // Connect manual products if in manual mode
        ...(validatedData.useManual && validatedData.manualProductIds
          ? {
              manualProducts: {
                create: validatedData.manualProductIds.map((partId, index) => ({
                  partId,
                  position: index,
                })),
              },
            }
          : {}),
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}
