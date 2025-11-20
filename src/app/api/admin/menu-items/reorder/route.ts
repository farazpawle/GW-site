import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { menuReorderSchema } from "@/lib/validations/menu";
import { ZodError } from "zod";

/**
 * PATCH /api/admin/menu-items/reorder
 * Bulk update menu item positions (for drag-and-drop reordering)
 */
export async function PATCH(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = menuReorderSchema.parse(body);

    // Validate all menu items exist
    const menuItemIds = validatedData.items.map((item) => item.id);
    const existingMenuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: menuItemIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingMenuItems.length !== menuItemIds.length) {
      const foundIds = existingMenuItems.map((item) => item.id);
      const missingIds = menuItemIds.filter((id) => !foundIds.includes(id));
      
      return NextResponse.json(
        { 
          error: "Some menu items not found",
          missingIds,
        },
        { status: 404 }
      );
    }

    // Update positions in a transaction (atomic operation)
    await prisma.$transaction(
      validatedData.items.map((item) =>
        prisma.menuItem.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    // Fetch updated menu items to return
    const updatedMenuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: menuItemIds,
        },
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        parent: {
          select: {
            id: true,
            label: true,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json({
      message: "Menu items reordered successfully",
      updatedCount: updatedMenuItems.length,
      menuItems: updatedMenuItems,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error reordering menu items:", error);
    return NextResponse.json(
      { error: "Failed to reorder menu items" },
      { status: 500 }
    );
  }
}
