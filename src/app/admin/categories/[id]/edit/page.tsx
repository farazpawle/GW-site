'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import CategoryForm from '@/components/admin/categories/CategoryForm';
import type { CategoryFormData } from '@/lib/validations/category';
import Toast from '@/components/ui/Toast';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [categoryData, setCategoryData] = useState<Partial<CategoryFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Fetch category data on mount
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/admin/categories/${categoryId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          if (response.status === 404) {
            setNotFound(true);
          } else {
            throw new Error(result.error || 'Failed to fetch category');
          }
          return;
        }

        setCategoryData(result.category);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch category');
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const handleSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update category');
      }

      setSuccess(true);

      // Show success message briefly, then redirect
      setTimeout(() => {
        router.push('/admin/categories');
        router.refresh();
      }, 1000);

    } catch (err) {
      console.error('Error updating category:', err);
      setError(err instanceof Error ? err.message : 'Failed to update category');
      setIsSubmitting(false);
    }
  };

  // UI STATE 1: Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <AdminHeader
          pageTitle="Edit Category"
          description="Loading category data..."
        />
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#6e0000] animate-spin" />
            <span className="ml-3 text-gray-400">Loading category...</span>
          </div>
        </div>
      </div>
    );
  }

  // UI STATE 2: Not Found
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <AdminHeader
          pageTitle="Edit Category"
          description="Category not found"
        />
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Category Not Found</h2>
            <p className="text-gray-400 mb-6">
              The category you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#6e0000] text-white rounded-lg hover:bg-[#8b0000] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // UI STATE 3: Error
  if (error && !categoryData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <AdminHeader
          pageTitle="Edit Category"
          description="Error loading category"
        />
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Category</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[#6e0000] text-white rounded-lg hover:bg-[#8b0000] transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/admin/categories"
                className="px-6 py-3 bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
              >
                Back to Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UI STATE 4 & 5: Loaded (with form) or Submitting
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Toast Notifications */}
      <Toast
        message="Category updated successfully! Redirecting..."
        type="success"
        show={success}
        onClose={() => setSuccess(false)}
        duration={1000}
      />
      <Toast
        message={error || 'Failed to update category'}
        type="error"
        show={!!error && !success}
        onClose={() => setError(null)}
        duration={5000}
      />

      <AdminHeader
        pageTitle="Edit Category"
        description={categoryData?.name || 'Update category information'}
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

        {/* Form Container */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          {categoryData && (
            <CategoryForm
              initialData={categoryData}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
