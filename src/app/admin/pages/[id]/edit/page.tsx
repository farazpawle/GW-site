'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import PageForm from '@/components/admin/pages/PageForm';
import { Loader2 } from 'lucide-react';

export default function EditPagePage() {
  const params = useParams();
  const id = params?.id as string;
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/pages/${id}`)
        .then(r => r.json())
        .then(data => {
          setPage(data);
          setIsLoading(false);
        })
        .catch(() => {
          alert('Failed to load page');
          setIsLoading(false);
        });
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!page) {
    return <div className="p-8">Page not found</div>;
  }

  return (
    <div className="p-8">
      <AdminHeader 
        pageTitle="Edit Page" 
        description="Update page settings and product groups"
      />
      <div className="mt-6">
        <PageForm initialData={page} pageId={id} />
      </div>
    </div>
  );
}
