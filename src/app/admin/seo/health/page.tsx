'use client';

import { Suspense } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import SEOHealthDashboard from '@/components/admin/seo/SEOHealthDashboard';
import { Loader2 } from 'lucide-react';

export default function SEOHealthPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminHeader 
        pageTitle="SEO Health" 
        description="Monitor and optimize your website's SEO performance"
      />
      
      <div className="container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-maroon" />
            </div>
          }
        >
          <SEOHealthDashboard />
        </Suspense>
      </div>
    </div>
  );
}
