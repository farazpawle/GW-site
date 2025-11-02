import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';
import PagesListClient from '@/components/admin/pages/PagesListClient';
import { Loader2 } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  groupType: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isPermanent: boolean;
  _count: {
    menuItems: number;
  };
}

// Server-side data fetching function
async function getPages(): Promise<Page[]> {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { menuItems: true }
      }
    }
  });

  // Serialize dates to strings for client component
  return pages.map(page => ({
    ...page,
    publishedAt: page.publishedAt?.toISOString() || null,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  })) as unknown as Page[];
}

// Loading component
function PagesListLoading() {
  return (
    <div className="flex flex-col justify-center items-center h-64 bg-gray-900 rounded-lg">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
      <p className="text-gray-400">Loading pages...</p>
    </div>
  );
}

// Main Server Component
export default async function PagesListPage() {
  // Authentication check
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch data on the server
  const pages = await getPages();

  return (
    <div className="px-8 py-6">
      <AdminHeader 
        pageTitle="Pages" 
        description="Manage custom pages with product groups"
      />

      <Suspense fallback={<PagesListLoading />}>
        <PagesListClient initialPages={pages} />
      </Suspense>
    </div>
  );
}
