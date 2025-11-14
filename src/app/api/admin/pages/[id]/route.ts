import { NextRequest, NextResponse } from "next/server";
import { checkPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pageSchema, PageGroupValues } from "@/lib/validations/page";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

const normalizeGroupValues = (groupValues?: PageGroupValues) => {
  if (!groupValues) {
    return { featuredOnly: false } satisfies PageGroupValues;
  }

  return {
    ...groupValues,
    featuredOnly: groupValues.featuredOnly ?? false,
  } satisfies PageGroupValues;
};

/**
 * GET /api/admin/pages/[id]
 * Get a single page by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check permission
    const user = await checkPermission("pages.view");
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Missing permission: pages.view" },
        { status: 403 },
      );
    }

    // Get page ID from params
    const { id } = await params;

    // Fetch page
    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        menuItems: {
          select: {
            id: true,
            label: true,
            position: true,
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/pages/[id]
 * Update a page
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check permission
    const user = await checkPermission("pages.edit");
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Missing permission: pages.edit" },
        { status: 403 },
      );
    }

    // Get page ID from params
    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = pageSchema.parse(body);

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id },
    });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check for duplicate slug (if slug changed)
    if (validatedData.slug !== existingPage.slug) {
      const duplicateSlug = await prisma.page.findUnique({
        where: { slug: validatedData.slug },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          { error: "A page with this slug already exists" },
          { status: 409 },
        );
      }
    }

    // Update page (handle both static and dynamic types)
    let updatedPage;
    if (validatedData.pageType === "static") {
      updatedPage = await prisma.page.update({
        where: { id },
        data: {
          title: validatedData.title,
          slug: validatedData.slug,
          description: validatedData.description,
          pageType: "static",
          content: validatedData.content,
          // Clear dynamic page fields
          groupType: null,
          groupValues: Prisma.JsonNull,
          metaTitle: validatedData.metaTitle,
          metaDesc: validatedData.metaDesc,
          published: validatedData.published,
          publishedAt:
            validatedData.published && !existingPage.published
              ? new Date()
              : existingPage.publishedAt,
        },
      });
    } else {
      const groupValues = normalizeGroupValues(validatedData.groupValues);
      updatedPage = await prisma.page.update({
        where: { id },
        data: {
          title: validatedData.title,
          slug: validatedData.slug,
          description: validatedData.description,
          pageType: "dynamic",
          groupType: validatedData.groupType,
          groupValues,
          layout: validatedData.layout,
          sortBy: validatedData.sortBy,
          itemsPerPage: validatedData.itemsPerPage,
          // Clear static page field
          content: null,
          metaTitle: validatedData.metaTitle,
          metaDesc: validatedData.metaDesc,
          published: validatedData.published,
          publishedAt:
            validatedData.published && !existingPage.published
              ? new Date()
              : existingPage.publishedAt,
        },
      });
    }

    return NextResponse.json(updatedPage);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/pages/[id]
 * Delete a page
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check permission
    const user = await checkPermission("pages.delete");
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Missing permission: pages.delete" },
        { status: 403 },
      );
    }

    // Get page ID from params
    const { id } = await params;

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check if page is permanent (cannot be deleted)
    if (existingPage.isPermanent) {
      return NextResponse.json(
        {
          error: "Cannot delete permanent page",
          details: `The "${existingPage.title}" page is a system page and cannot be deleted.`,
        },
        { status: 403 },
      );
    }

    // Check if page is linked to menu items
    if (existingPage._count.menuItems > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete page that is linked to menu items",
          details: `This page is linked to ${existingPage._count.menuItems} menu item(s). Please remove or update the menu items first.`,
        },
        { status: 409 },
      );
    }

    // Delete page
    await prisma.page.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Page deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 },
    );
  }
}
