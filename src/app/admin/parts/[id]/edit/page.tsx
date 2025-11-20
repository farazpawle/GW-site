'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductForm from '@/components/admin/parts/ProductForm';
import CrossReferenceManager from '@/components/admin/parts/CrossReferenceManager';
import OEMNumbersManager from '@/components/admin/parts/OEMNumbersManager';
import VehicleCompatibilityManager from '@/components/admin/parts/VehicleCompatibilityManager';
import Toast from '@/components/ui/Toast';
import { Loader2 } from 'lucide-react';

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
      console.log('Submitting product data:', data);
      
      const response = await fetch(`/api/admin/parts/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('API Response:', { status: response.status, result });

      if (!response.ok || !result.success) {
        const errorMessage = result.error || 'Failed to update product';
        const errorDetails = result.details ? JSON.stringify(result.details, null, 2) : '';
        throw new Error(`${errorMessage}${errorDetails ? '\n' + errorDetails : ''}`);
      }

      setSuccess(true);
      setIsSubmitting(false);

      // Show success message for 3 seconds, then redirect
      setTimeout(() => {
        router.push('/admin/parts');
        router.refresh();
      }, 3000);

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
      {/* Toast Notifications */}
      <Toast
        message="Product updated successfully! Redirecting to products list..."
        type="success"
        show={success}
        onClose={() => setSuccess(false)}
        duration={3000}
      />
      <Toast
        message={error || 'Failed to update product'}
        type="error"
        show={!!error}
        onClose={() => setError(null)}
        duration={5000}
      />

      <AdminHeader
        pageTitle="Edit Product"
        description={productData?.name ? `Editing: ${productData.name}` : 'Update product information'}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Tabbed Interface */}
        {productData && (
          <TabsInterface
            productData={productData}
            productId={productId}
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

// Tabbed Interface Component
function TabsInterface({
  productData,
  productId,
  onSubmit,
  submitLabel,
}: {
  productData: Partial<ProductFormData> & { id: string };
  productId: string;
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel: string;
}) {
  const [activeTab, setActiveTab] = useState<'product' | 'cross-references' | 'oem-numbers' | 'vehicle-compatibility'>('product');

  const tabs = [
    { id: 'product' as const, label: 'Product Info', icon: '📦' },
    { id: 'cross-references' as const, label: 'Cross-References', icon: '🔗' },
    { id: 'oem-numbers' as const, label: 'OEM Numbers', icon: '🏷️' },
    { id: 'vehicle-compatibility' as const, label: 'Vehicle Compatibility', icon: '🚗' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-maroon text-white border-b-2 border-brand-red'
                  : 'text-gray-400 hover:text-white hover:bg-[#0a0a0a]'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'product' && (
          <ProductForm
            initialData={productData}
            onSubmit={onSubmit}
            submitLabel={submitLabel}
          />
        )}

        {activeTab === 'cross-references' && (
          <CrossReferenceManager partId={productId} />
        )}

        {activeTab === 'oem-numbers' && (
          <OEMNumbersManager partId={productId} />
        )}

        {activeTab === 'vehicle-compatibility' && (
          <VehicleCompatibilityManager partId={productId} />
        )}
      </div>
    </div>
  );
}
