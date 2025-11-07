import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';
import MenuItemsClient from '@/components/admin/menu-items/MenuItemsClient';
import { Loader2 } from 'lucide-react';

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic';

interface SearchParams {
  includeHidden?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

interface MenuItem {
  id: string;
  label: string;
  position: number;
  visible: boolean;
  openNewTab: boolean;
  parentId: string | null;
  pageId: string | null;
  externalUrl: string | null;
  isPermanent: boolean;
  page?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  parent?: {
    id: string;
    label: string;
  } | null;
  children: MenuItem[];
}

// Server-side data fetching function
async function getMenuItems(includeHidden: boolean = true): Promise<MenuItem[]> {
  const where: { visible?: boolean } = {};
  
  if (!includeHidden) {
    where.visible = true;
  }

  const menuItems = await prisma.menuItem.findMany({
    where,
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
          position: 'asc',
        },
      },
    },
    orderBy: {
      position: 'asc',
    },
  });

  // Build hierarchical tree structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildTree = (items: any[], parentId: string | null = null): MenuItem[] => {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: buildTree(items, item.id),
      }));
  };

  return buildTree(menuItems);
}

// Loading component
function MenuItemsLoading() {
  return (
    <div className="flex flex-col justify-center items-center h-64 bg-gray-900 rounded-xl">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
      <p className="text-gray-400">Loading menu structure...</p>
    </div>
  );
}

// Main Server Component
export default async function MenuItemsPage({ searchParams }: PageProps) {
  // Authentication check
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Parse query parameters
  const params = await searchParams;
  const includeHidden = params.includeHidden !== 'false';

  // Fetch data on the server
  const menuItems = await getMenuItems(includeHidden);

  return (
    <div className="px-8 py-6">
      <AdminHeader
        pageTitle="Menu Items"
        description="Manage navigation menu structure with drag-and-drop ordering"
      />

      <div className="mt-6">
        <Suspense fallback={<MenuItemsLoading />}>
          <MenuItemsClient 
            initialMenuItems={menuItems} 
            initialIncludeHidden={includeHidden}
          />
        </Suspense>
      </div>
    </div>
  );
}
