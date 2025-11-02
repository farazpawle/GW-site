'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pageSchema } from '@/lib/validations/page';
import { Loader2, Save } from 'lucide-react';
import type { z } from 'zod';

type PageFormValues = z.infer<typeof pageSchema>;

interface Category {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
}

interface PageFormProps {
  initialData?: Partial<PageFormValues>;
  pageId?: string;
}

export default function PageForm({ initialData, pageId }: PageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: initialData || {
      title: '',
      slug: '',
      description: '',
      groupType: 'all' as const,
      groupValues: {},
      layout: 'grid' as const,
      sortBy: 'name' as const,
      itemsPerPage: 12,
      published: false,
    },
  });

  const groupType = watch('groupType');
  const slug = watch('slug');
  
  // Generate public URL based on current slug
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/pages/${slug || 'your-slug-here'}`
    : `/pages/${slug || 'your-slug-here'}`;

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
    fetch('/api/admin/collections').then(r => r.json()).then(d => setCollections(d.collections || []));
  }, []);

  const onSubmit = async (data: PageFormValues) => {
    try {
      setIsSubmitting(true);
      const url = pageId ? `/api/admin/pages/${pageId}` : '/api/admin/pages';
      const method = pageId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save page');
      }

      await response.json();
      
      // Show success message with URL
      const pageUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/pages/${data.slug}`
        : `/pages/${data.slug}`;
        
      if (data.published) {
        alert(`✅ Page ${pageId ? 'updated' : 'created'} successfully!\n\n📍 Your page is now live at:\n${pageUrl}\n\n🔗 You can also add it to your navigation menu.`);
      } else {
        alert(`✅ Page ${pageId ? 'updated' : 'created'} as draft!\n\n📍 Once published, it will be available at:\n${pageUrl}`);
      }

      router.push('/admin/pages');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save page';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📄</div>
          <div>
            <h3 className="font-semibold text-blue-300 mb-1">About Custom Pages</h3>
            <p className="text-sm text-blue-200">
              Create custom pages to showcase specific product groups (categories, collections, tags). 
              These pages can be linked from your navigation menu.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-lg space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-gray-100">📝 Basic Information</h3>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Page Title <span className="text-red-400">*</span>
          </label>
          <input
            {...register('title')}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="e.g., Engine Parts, Brake Systems, All Products"
          />
          {errors.title && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠️ {errors.title.message}</p>}
          <p className="text-xs text-gray-500 mt-2">This will appear as the page heading</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            URL Slug <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">/pages/</span>
            <input
              {...register('slug')}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 font-mono"
              placeholder="engine-parts"
            />
          </div>
          {errors.slug && <p className="text-red-400 text-sm mt-2 flex items-center gap-1">⚠️ {errors.slug.message}</p>}
          <p className="text-xs text-gray-500 mt-2">
            Use lowercase letters, numbers, and hyphens only (e.g., engine-parts, brake-systems)
          </p>
          
          {/* URL Preview */}
          {slug && (
            <div className="mt-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-green-400 text-lg">🔗</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-300 mb-1">Public Page URL:</p>
                  <code className="text-sm text-green-200 break-all block bg-green-950/50 px-2 py-1 rounded">
                    {publicUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      alert('URL copied to clipboard!');
                    }}
                    className="text-xs text-green-400 hover:text-green-300 mt-2 underline"
                  >
                    📋 Copy URL
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Page Description (Optional)
          </label>
          <textarea
            {...register('description')}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            rows={4}
            placeholder="Brief description of what products this page shows..."
          />
          <p className="text-xs text-gray-500 mt-2">This will appear below the page title (optional)</p>
        </div>
      </div>

      {/* Product Group */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-lg space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-gray-100">🎯 Product Group Selection</h3>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-3">
            What products should this page show? <span className="text-red-400">*</span>
          </label>
          <select 
            {...register('groupType')} 
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">🌐 All Products (Show entire catalog)</option>
            <option value="category">📂 Specific Categories</option>
            <option value="tag">🏷️ Products with Specific Tags</option>
            <option value="collection">📦 Specific Collections</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            {groupType === 'all' && '✓ Will display all products from your catalog'}
            {groupType === 'category' && '→ Select categories below to show only products in those categories'}
            {groupType === 'tag' && '→ Enter tags below to show products matching those tags'}
            {groupType === 'collection' && '→ Select collections below to show products in those collections'}
          </p>
        </div>

        {groupType === 'category' && (
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              📂 Select Categories
            </label>
            {categories.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-900 rounded border border-gray-700">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 p-3 bg-gray-800 hover:bg-gray-750 rounded cursor-pointer border border-gray-700 hover:border-blue-600 transition-all">
                      <input
                        type="checkbox"
                        value={cat.id}
                        className="w-4 h-4 text-blue-600 border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-gray-800"
                      />
                      <span className="text-gray-200 text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select one or more categories to display</p>
              </>
            ) : (
              <p className="text-gray-500 text-sm py-3">No categories found. Create categories first in Categories section.</p>
            )}
          </div>
        )}

        {groupType === 'collection' && (
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              📦 Select Collections
            </label>
            {collections.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-900 rounded border border-gray-700">
                  {collections.map(col => (
                    <label key={col.id} className="flex items-center gap-2 p-3 bg-gray-800 hover:bg-gray-750 rounded cursor-pointer border border-gray-700 hover:border-purple-600 transition-all">
                      <input
                        type="checkbox"
                        value={col.id}
                        className="w-4 h-4 text-purple-600 border-gray-600 rounded focus:ring-2 focus:ring-purple-500 bg-gray-800"
                      />
                      <span className="text-gray-200 text-sm">{col.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select one or more collections to display</p>
              </>
            ) : (
              <p className="text-gray-500 text-sm py-3">No collections found. Create collections first in Collections section.</p>
            )}
          </div>
        )}

        {groupType === 'tag' && (
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              🏷️ Enter Tags (comma-separated)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500"
              placeholder="e.g., premium, sale, featured"
            />
            <p className="text-xs text-gray-500 mt-2">Enter multiple tags separated by commas</p>
          </div>
        )}
      </div>

      {/* Display Options */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-lg space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-gray-100">⚙️ Display Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              📐 Layout Style
            </label>
            <select 
              {...register('layout')} 
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="grid">Grid View (Cards)</option>
              <option value="list">List View (Rows)</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">How products are displayed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              🔄 Default Sorting
            </label>
            <select 
              {...register('sortBy')} 
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price">Price (Low to High)</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">Initial sort order</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              📊 Items Per Page
            </label>
            <input
              type="number"
              {...register('itemsPerPage', { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="4"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-2">Products shown per page</p>
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register('published')}
              id="published"
              className="w-5 h-5 mt-0.5 text-green-600 border-gray-600 rounded focus:ring-2 focus:ring-green-500 bg-gray-800"
            />
            <div>
              <span className="text-sm font-semibold text-gray-200 group-hover:text-gray-100">
                ✓ Publish this page immediately
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Page will be accessible via URL. Uncheck to keep as draft.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end sticky bottom-0 bg-black/20 backdrop-blur-sm p-4 -mx-4 -mb-4 rounded-b-lg border-t border-gray-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {pageId ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {pageId ? 'Update Page' : 'Create Page'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
