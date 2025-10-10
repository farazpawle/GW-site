'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductForm from '@/components/admin/parts/ProductForm';

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

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create product');
      }

      setSuccess(true);

      // Show success message briefly, then redirect
      setTimeout(() => {
        router.push('/admin/parts');
        router.refresh();
      }, 1000);

    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminHeader
        pageTitle="Add New Product"
        description="Create a new product in your inventory"
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
                Product created successfully! Redirecting...
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
                <p className="text-red-400 font-medium">Error creating product</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Product Form */}
        <ProductForm
          onSubmit={handleSubmit}
          submitLabel="Create Product"
        />
      </div>
    </div>
  );
}
