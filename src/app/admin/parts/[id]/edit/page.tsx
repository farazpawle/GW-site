'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductForm from '@/components/admin/parts/ProductForm';
import { Loader2 } from 'lucide-react';

// Type for form submission - matches ProductForm's internal type
type ProductFormData = {
  name: string;
  partNumber: string;
  description?: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number | null;
  categoryId: string;
  stockQuantity: number;
  inStock: boolean;
  images: string[];
  specifications?: Record<string, unknown> | null;
  compatibility: string[];
  featured: boolean;
  published?: boolean;
  showcaseOrder?: number;
  tags?: string[];
  brand?: string | null;
  origin?: string | null;
  certifications?: string[];
  warranty?: string | null;
  difficulty?: 'Easy' | 'Moderate' | 'Professional' | 'Advanced' | null;
  application?: string[];
  videoUrl?: string | null;
  pdfUrl?: string | null;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [productData, setProductData] = useState<(Partial<ProductFormData> & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Fetch product data on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/parts/${productId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          if (response.status === 404) {
            setNotFound(true);
          } else {
            throw new Error(result.error || 'Failed to fetch product');
          }
          return;
        }

        setProductData(result.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/parts/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update product');
      }

      setSuccess(true);

      // Show success message briefly, then redirect
      setTimeout(() => {
        router.push('/admin/parts');
        router.refresh();
      }, 1000);

    } catch (err) {
      console.error('Error updating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product');
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <AdminHeader
          pageTitle="Edit Product"
          description="Loading product data..."
        />
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand-maroon animate-spin" />
            <span className="ml-3 text-gray-400">Loading product...</span>
          </div>
        </div>
      </div>
    );
  }

  // 404 state
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <AdminHeader
          pageTitle="Product Not Found"
        />
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
            <p className="text-gray-400 mb-6">
              The product you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <button
              onClick={() => router.push('/admin/parts')}
              className="px-6 py-3 bg-brand-maroon text-white rounded-lg hover:bg-brand-red transition-colors"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !productData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <AdminHeader
          pageTitle="Error"
        />
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Product</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-brand-maroon text-white rounded-lg hover:bg-brand-red transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/admin/parts')}
                className="px-6 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminHeader
        pageTitle="Edit Product"
        description={productData?.name ? `Editing: ${productData.name}` : 'Update product information'}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-green-400 font-medium">
                Product updated successfully! Redirecting...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <div>
                <p className="text-red-400 font-medium">Error updating product</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Product Form */}
        {productData && (
          <ProductForm
            initialData={productData}
            onSubmit={handleSubmit}
            submitLabel="Update Product"
          />
        )}

        {/* Cancel Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => router.push('/admin/parts')}
            disabled={isSubmitting}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
