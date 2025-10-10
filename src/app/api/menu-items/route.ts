import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/menu-items - Public endpoint for website navigation
export async function GET() {
  try {
    // Fetch only visible menu items, ordered by position
    const menuItems = await prisma.menuItem.findMany({
      where: {
        visible: true,
        parentId: null, // Only top-level items for main navigation
      },
      orderBy: {
        position: 'asc',
      },
      include: {
        page: {
          select: {
            slug: true,
            title: true,
          },
        },
        children: {
          where: {
            visible: true,
          },
          orderBy: {
            position: 'asc',
          },
          include: {
            page: {
              select: {
                slug: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Transform menu items to navigation format
    const navigationItems = menuItems.map((item) => {
      // Build href based on link type
      let href = '#';
      if (item.pageId && item.page) {
        // Special handling: map 'all-products' page to '/products' route
        if (item.page.slug === 'all-products') {
          href = '/products';
        } else {
          // All other pages use /pages/ prefix
          href = `/pages/${item.page.slug}`;
        }
      } else if (item.externalUrl) {
        href = item.externalUrl;
      }

      return {
        id: item.id,
        label: item.label,
        href,
        openNewTab: item.openNewTab,
        children: item.children.map((child) => {
          // Build child href based on link type
          let childHref = '#';
          if (child.pageId && child.page) {
            // Special handling for children as well
            if (child.page.slug === 'all-products') {
              childHref = '/products';
            } else {
              // All other pages use /pages/ prefix
              childHref = `/pages/${child.page.slug}`;
            }
          } else if (child.externalUrl) {
            childHref = child.externalUrl;
          }

          return {
            id: child.id,
            label: child.label,
            href: childHref,
            openNewTab: child.openNewTab,
          };
        }),
      };
    });

    return NextResponse.json({ menuItems: navigationItems });
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}
