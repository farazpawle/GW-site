import { requireAdmin } from '@/lib/auth';
import { ReactNode } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Protect all admin routes - redirects non-admin users to homepage
  await requireAdmin();

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
