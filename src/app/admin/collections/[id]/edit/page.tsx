'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import CollectionForm from '@/components/admin/collections/CollectionForm';
import { Loader2 } from 'lucide-react';

export default function EditCollectionPage() {
  const params = useParams();
  const id = params?.id as string;
  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/collections/${id}`)
        .then(r => r.json())
        .then(data => {
          setCollection(data);
          setIsLoading(false);
        })
        .catch(() => {
          alert('Failed to load collection');
          setIsLoading(false);
        });
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!collection) {
    return <div className="p-8 text-gray-100">Collection not found</div>;
  }

  return (
    <div className="p-8">
      <AdminHeader 
        pageTitle="Edit Collection" 
        description="Update collection settings and product selection"
      />
      <div className="mt-6">
        <CollectionForm initialData={collection} collectionId={id} />
      </div>
    </div>
  );
}
