import { Suspense } from 'react';
import HomepageCMSManager from '@/components/admin/HomepageCMSManager';

export const metadata = {
  title: 'Homepage CMS | Admin',
  description: 'Manage homepage sections',
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg animate-pulse" />
      <div className="h-24 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg animate-pulse" />
      <div className="h-24 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg animate-pulse" />
      <div className="h-24 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg animate-pulse" />
    </div>
  );
}

export default function HomepageCMSPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Homepage CMS</h1>
        <p className="text-gray-400">
          Manage your homepage sections - edit content, toggle visibility, and reorder sections via drag & drop
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <HomepageCMSManager />
      </Suspense>
    </div>
  );
}
