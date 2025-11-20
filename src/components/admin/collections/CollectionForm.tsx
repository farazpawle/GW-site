/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { collectionSchema } from '@/lib/validations/collection';
import { Loader2, Save } from 'lucide-react';
import FilterBuilder from './FilterBuilder';

interface FilterRules {
  categoryIds?: string[];
  brands?: string[];
  tags?: string[];
  origins?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
}
import type { z } from 'zod';

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface Product {
  id: string;
  name: string;
  partNumber: string;
  price: number;
}

interface CollectionFormProps {
  initialData?: Partial<CollectionFormValues> & {
    manualProducts?: Array<{ partId: string }>;
  };
  collectionId?: string;
}

export default function CollectionForm({ initialData, collectionId }: CollectionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'automatic' | 'manual'>(
    initialData?.collectionType === 'manual' ? 'manual' : 'automatic'
  );
  const [filterRules, setFilterRules] = useState<FilterRules>(
    {} // Will be converted to conditions format on submit
  );
  const [manualProductIds, setManualProductIds] = useState<string[]>(
    initialData?.manualProducts?.map((mp) => mp.partId) || []
  );
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      name: '',
      slug: '',
      description: '',
      sortBy: 'manual',
      metaTitle: '',
      metaDescription: '',
      published: false,
    },
  });

  useEffect(() => {
    // Fetch products for manual selection
    fetch('/api/admin/parts?limit=100')
      .then(r => r.json())
      .then(data => setAvailableProducts(data.parts || []))
      .catch(() => alert('Failed to load products'));
  }, []);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Validation
      if (!data.name || !data.slug) {
        alert('Name and slug are required');
        return;
      }
      
      if (mode === 'manual' && manualProductIds.length === 0) {
        alert('Please select at least one product for manual collection');
        return;
      }
      
      if (mode === 'automatic' && Object.keys(filterRules).length === 0) {
        alert('Please set at least one filter for automatic collection');
        return;
      }

      const url = collectionId ? `/api/admin/collections/${collectionId}` : '/api/admin/collections';
      const method = collectionId ? 'PUT' : 'POST';

      // Convert filterRules to conditions format for the API
      const conditions = mode === 'automatic' && Object.keys(filterRules).length > 0
        ? {
            match: 'all' as const,
            conditions: Object.entries(filterRules)
              .filter(([, value]) => value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : true))
              .flatMap(([key, value]): any[] => {
                if (key === 'categoryIds' && Array.isArray(value)) {
                  return value.map(id => ({
                    field: 'product_tag',
                    operator: 'equals',
                    value: id,
                  }));
                }
                if (Array.isArray(value)) {
                  return value.map(v => ({
                    field: key === 'brands' ? 'product_vendor' : 'product_tag',
                    operator: 'equals',
                    value: v,
                  }));
                }
                if (key === 'minPrice') {
                  return [{
                    field: 'variant_price',
                    operator: 'greater_than',
                    value: value as number,
                  }];
                }
                if (key === 'maxPrice') {
                  return [{
                    field: 'variant_price',
                    operator: 'less_than',
                    value: value as number,
                  }];
                }
                if (typeof value === 'boolean') {
                  return [{
                    field: 'product_tag',
                    operator: 'equals',
                    value: key,
                  }];
                }
                return [];
              }),
          }
        : null;

      const payload = {
        ...data,
        collectionType: mode === 'manual' ? 'manual' : 'smart',
        conditions: conditions,
        manualProductIds: mode === 'manual' ? manualProductIds : [],
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save collection');
      }

      router.push('/admin/collections');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save collection';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setManualProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Basic Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
          <input
            {...register('name')}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Featured Products"
          />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Slug *</label>
          <input
            {...register('slug')}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., featured-products"
          />
          {errors.slug && <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            {...register('description')}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
      </div>

      {/* Collection Mode */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Collection Mode</h3>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <input
              type="radio"
              checked={mode === 'automatic'}
              onChange={() => setMode('automatic')}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-gray-100">Automatic</div>
              <div className="text-sm text-gray-400">Products filtered by rules</div>
            </div>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <input
              type="radio"
              checked={mode === 'manual'}
              onChange={() => setMode('manual')}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <div className="font-medium text-gray-100">Manual</div>
              <div className="text-sm text-gray-400">Manually select products</div>
            </div>
          </label>
        </div>

        {/* Automatic Mode: Filter Rules */}
        {mode === 'automatic' && (
          <div className="mt-4">
            <FilterBuilder
              filterRules={filterRules}
              onChange={setFilterRules}
            />
          </div>
        )}

        {/* Manual Mode: Product Selection */}
        {mode === 'manual' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Products</label>
            <div className="border border-gray-700 bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
              {availableProducts.map(product => (
                <label key={product.id} className="flex items-center gap-2 p-3 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={manualProductIds.includes(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-100">{product.name}</div>
                    <div className="text-sm text-gray-400">{product.partNumber}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-300">${product.price}</div>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {manualProductIds.length} product(s) selected
            </p>
          </div>
        )}
      </div>

      {/* SEO & Publishing */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">SEO & Publishing</h3>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Meta Title</label>
          <input
            {...register('metaTitle')}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={60}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Meta Description</label>
          <textarea
            {...register('metaDescription')}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            maxLength={160}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('published')}
            id="published"
            className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-300">Publish this collection</label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {collectionId ? 'Update' : 'Create'} Collection
        </button>
      </div>
    </form>
  );
}
