import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateMenuItemSchema } from "@/lib/validations/menu";
import { ZodError } from "zod";

/**
 * GET /api/admin/menu-items/[id]
 * Get a single menu item by ID
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

    // Fetch menu item
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
          },
        },
        parent: {
          select: {
            id: true,
            label: true,
          },
        },
        children: {
          select: {
            id: true,
            label: true,
            position: true,
            visible: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu item" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/menu-items/[id]
 * Update a menu item
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

    // Check if menu item exists
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existingMenuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    console.log('=== UPDATE MENU ITEM DEBUG ===');
    console.log('Raw body:', JSON.stringify(body, null, 2));
    
    const validatedData = updateMenuItemSchema.parse(body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));
    console.log('pageId value:', validatedData.pageId);
    console.log('pageId type:', typeof validatedData.pageId);
    console.log('externalUrl value:', validatedData.externalUrl);
    console.log('externalUrl type:', typeof validatedData.externalUrl);

    // Validate parent exists if parentId is provided
    if (validatedData.parentId !== undefined) {
      if (validatedData.parentId) {
        // Check parent exists
        const parentExists = await prisma.menuItem.findUnique({
          where: { id: validatedData.parentId },
        });

        if (!parentExists) {
          return NextResponse.json(
            { error: "Parent menu item not found" },
            { status: 404 }
          );
        }

        // Prevent circular reference (item cannot be its own parent or descendant)
        if (validatedData.parentId === id) {
          return NextResponse.json(
            { error: "Menu item cannot be its own parent" },
            { status: 400 }
          );
        }

        // Check if new parent is a descendant of this item
        const isDescendant = async (itemId: string, potentialDescendantId: string): Promise<boolean> => {
          const children = await prisma.menuItem.findMany({
            where: { parentId: itemId },
            select: { id: true },
          });

          for (const child of children) {
            if (child.id === potentialDescendantId) {
              return true;
            }
            if (await isDescendant(child.id, potentialDescendantId)) {
              return true;
            }
          }
          return false;
        };

        if (await isDescendant(id, validatedData.parentId)) {
          return NextResponse.json(
            { error: "Cannot set a descendant as parent (would create circular reference)" },
            { status: 400 }
          );
        }
      }
    }

    // Validate page exists if pageId is provided
    if (validatedData.pageId !== undefined && validatedData.pageId) {
      const pageExists = await prisma.page.findUnique({
        where: { id: validatedData.pageId },
      });

      if (!pageExists) {
        return NextResponse.json(
          { error: "Page not found" },
          { status: 404 }
        );
      }
    }

    // Update menu item
    const updateData = {
      ...(validatedData.label !== undefined && { label: validatedData.label }),
      ...(validatedData.position !== undefined && { position: validatedData.position }),
      ...(validatedData.visible !== undefined && { visible: validatedData.visible }),
      ...(validatedData.openNewTab !== undefined && { openNewTab: validatedData.openNewTab }),
      ...(validatedData.parentId !== undefined && { parentId: validatedData.parentId || null }),
      ...(validatedData.pageId !== undefined && { pageId: validatedData.pageId || null }),
      ...(validatedData.externalUrl !== undefined && { externalUrl: validatedData.externalUrl || null }),
    };
    
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
          },
        },
        parent: {
          select: {
            id: true,
            label: true,
          },
        },
      },
    });
    
    console.log('Updated menu item:', JSON.stringify(updatedMenuItem, null, 2));
    console.log('=== END DEBUG ===');

    return NextResponse.json(updatedMenuItem);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/menu-items/[id]
 * Delete a menu item (CASCADE: also deletes all children)
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

    // Check if menu item exists
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        children: {
          select: { id: true },
        },
      },
    });

    if (!existingMenuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    // Check if menu item is permanent (cannot be deleted)
    if (existingMenuItem.isPermanent) {
      return NextResponse.json(
        { 
          error: "Cannot delete permanent menu item",
          details: `The "${existingMenuItem.label}" menu item is a system item and cannot be deleted.`
        },
        { status: 403 }
      );
    }

    // Recursive function to delete all descendants
    const deleteWithDescendants = async (itemId: string): Promise<void> => {
      // Find all direct children
      const children = await prisma.menuItem.findMany({
        where: { parentId: itemId },
        select: { id: true },
      });

      // Recursively delete each child and their descendants
      for (const child of children) {
        await deleteWithDescendants(child.id);
      }

      // Delete the item itself
      await prisma.menuItem.delete({
        where: { id: itemId },
      });
    };

    // Delete menu item and all descendants
    await deleteWithDescendants(id);

    return NextResponse.json({
      message: "Menu item deleted successfully",
      deletedCount: 1 + existingMenuItem.children.length, // This is approximate, actual count may be higher with nested children
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
