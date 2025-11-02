import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { collectionSchema } from "@/lib/validations/collection";
import { ZodError } from "zod";

/**
 * GET /api/admin/collections/[id]
 * Get a single collection by ID
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

    // Fetch collection
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        manualProducts: {
          include: {
            part: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          take: 10, // Only fetch first 10 for preview
          orderBy: {
            position: 'asc',
          },
        },
        _count: {
          select: {
            manualProducts: true,
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

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/collections/[id]
 * Update a collection
 */
export async function PUT(
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

    // Check if collection exists
    const existingCollection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = collectionSchema.parse(body);

    // Check for duplicate slug (excluding current collection)
    if (validatedData.slug !== existingCollection.slug) {
      const duplicateSlug = await prisma.collection.findUnique({
        where: { slug: validatedData.slug },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          { error: "A collection with this slug already exists" },
          { status: 409 }
        );
      }
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

    // Update collection
    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filterRules: validatedData.filterRules as any,
        useManual: validatedData.useManual,
        layout: validatedData.layout,
        sortBy: validatedData.sortBy,
        itemsPerPage: validatedData.itemsPerPage,
        metaTitle: validatedData.metaTitle || null,
        metaDesc: validatedData.metaDescription || null,
        published: validatedData.published,
        publishedAt:
          validatedData.published && !existingCollection.publishedAt
            ? new Date()
            : existingCollection.publishedAt,
        // Update manual products if in manual mode
        manualProducts: validatedData.useManual && validatedData.manualProductIds
          ? {
              deleteMany: {}, // Clear existing
              create: validatedData.manualProductIds.map((partId, index) => ({
                partId,
                position: index,
              })),
            }
          : {
              deleteMany: {}, // Clear if switching to automatic mode
            },
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/collections/[id]
 * Delete a collection
 */
export async function DELETE(
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

    // Check if collection exists
    const existingCollection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Delete collection (Prisma will handle disconnecting relations)
    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
