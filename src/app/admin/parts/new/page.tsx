'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductForm from '@/components/admin/parts/ProductForm';
import Toast from '@/components/ui/Toast';

// Type for form submission - matches ProductForm's internal type
type ProductFormData = {
  name: string;
  partNumber: string;
  sku: string;
  description?: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number | null;
  categoryId: string;
  images: string[];
  specifications?: Record<string, unknown> | null;
  compatibility: string[];
  featured: boolean;
  // Shopify inventory fields (only fields that exist in database)
  hasVariants?: boolean;
  compareAtPrice?: number | null;
  // Showcase fields
  published?: boolean;
  showcaseOrder?: number;
  tags?: string[];
  brand?: string | null;
  origin?: string | null;
  certifications?: string[];
  warranty?: string | null;
  application?: string[];
  pdfUrl?: string | null;
  // Related products
  relatedProductIds: string[];
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
      {/* Toast Notifications */}
      <Toast
        message="Product created successfully! Redirecting..."
        type="success"
        show={success}
        onClose={() => setSuccess(false)}
        duration={1000}
      />
      <Toast
        message={error || 'Failed to create product'}
        type="error"
        show={!!error}
        onClose={() => setError(null)}
        duration={5000}
      />

      <AdminHeader
        pageTitle="Add New Product"
        description="Create a new product in your inventory"
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Product Form */}
        <ProductForm
          onSubmit={handleSubmit}
          submitLabel="Create Product"
        />
      </div>
    </div>
  );
}
