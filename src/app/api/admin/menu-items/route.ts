import { checkPermission } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMenuItemSchema } from "@/lib/validations/menu";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/**
 * GET /api/admin/menu-items
 * List all menu items with hierarchical tree structure
 */
export async function GET(req: NextRequest) {
  try {
    // Check permission
    const user = await checkPermission('menu.view');
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Missing permission: menu.view" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const includeHidden = searchParams.get("includeHidden") === "true";
    const parentId = searchParams.get("parentId"); // Filter by parent (null = top-level)
    const flat = searchParams.get("flat") === "true"; // Return flat list instead of tree

    // Build where clause with proper typing
    const where: Prisma.MenuItemWhereInput = {};
    
    if (!includeHidden) {
      where.visible = true;
    }

    // If parentId is explicitly set, filter by it
    if (parentId !== null && searchParams.has("parentId")) {
      where.parentId = parentId || null;
    }

    // Fetch menu items
  // Optimized query - only fetch required fields
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
    orderBy: {
      position: "asc",
    },
  });    // If flat list requested, return as-is
    if (flat) {
      return NextResponse.json({
        menuItems,
        total: menuItems.length,
      });
    }

    // Build hierarchical tree structure
    type MenuItemWithChildren = typeof menuItems[number] & { children: MenuItemWithChildren[] };
    
    const buildTree = (items: typeof menuItems, parentId: string | null = null): MenuItemWithChildren[] => {
      return items
        .filter((item) => item.parentId === parentId)
        .map((item) => ({
          ...item,
          children: buildTree(items, item.id),
        }));
    };

    const tree = buildTree(menuItems);

    return NextResponse.json({
      menuItems: tree,
      total: menuItems.length,
      totalTopLevel: tree.length,
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/menu-items
 * Create a new menu item
 */
export async function POST(req: NextRequest) {
  try {
    // Check permission
    const user = await checkPermission('menu.create');
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Missing permission: menu.create" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createMenuItemSchema.parse(body);

    // Validate parent exists if parentId is provided
    if (validatedData.parentId) {
      const parentExists = await prisma.menuItem.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentExists) {
        return NextResponse.json(
          { error: "Parent menu item not found" },
          { status: 404 }
        );
      }
    }

    // Validate page exists if pageId is provided
    if (validatedData.pageId) {
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

    // Create menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        label: validatedData.label,
        position: validatedData.position,
        visible: validatedData.visible,
        openNewTab: validatedData.openNewTab,
        parentId: validatedData.parentId || null,
        pageId: validatedData.pageId || null,
        externalUrl: validatedData.externalUrl || null,
      },
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

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
