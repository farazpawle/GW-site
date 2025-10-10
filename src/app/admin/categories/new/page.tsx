'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import CategoryForm from '@/components/admin/categories/CategoryForm';
import { type CategoryFormData } from '@/lib/validations/category';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create category');
      }

      // Success - show alert and redirect
      alert('Category created successfully!');
      router.push('/admin/categories');
    } catch (err) {
      console.error('Create category error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminHeader
        pageTitle="Add Category"
        description="Create a new product category"
      />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Link>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800/50 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <CategoryForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
