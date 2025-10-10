import { requireAdmin } from '@/lib/auth';
import { ReactNode } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Protect all admin routes - redirects non-admin users to homepage
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex h-screen">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main content area with top bar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Admin Top Bar */}
          <AdminTopBar />
          
          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
