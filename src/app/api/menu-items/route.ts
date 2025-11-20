import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/menu-items
 * Public endpoint to fetch visible menu items for navigation
 */
export async function GET() {
  try {
    // For public access, only show visible items
    const where = {
      visible: true,
    };

    // Fetch menu items with their relationships
    const menuItems = await prisma.menuItem.findMany({
      where,
      select: {
        id: true,
        label: true,
        position: true,
        visible: true,
        openNewTab: true,
        parentId: true,
        pageId: true,
        externalUrl: true,
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    // Filter out menu items linked to unpublished pages
    const publishedMenuItems = menuItems.filter(
      (item) => !item.page || item.page.published
    );

    // Build hierarchical tree structure
    type MenuItemWithChildren = typeof publishedMenuItems[number] & {
      children: MenuItemWithChildren[];
    };

    const buildTree = (
      items: typeof publishedMenuItems,
      parentId: string | null = null
    ): MenuItemWithChildren[] => {
      return items
        .filter((item) => item.parentId === parentId)
        .map((item) => ({
          ...item,
          children: buildTree(items, item.id),
        }));
    };

    const tree = buildTree(publishedMenuItems);

    return NextResponse.json({
      menuItems: tree,
      total: publishedMenuItems.length,
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}
