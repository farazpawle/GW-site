'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staticPageSchema, dynamicPageSchema } from '@/lib/validations/page';
import { Loader2, Save, FileText, Package } from 'lucide-react';
import type { z } from 'zod';

type StaticPageFormValues = z.infer<typeof staticPageSchema>;
type DynamicPageFormValues = z.infer<typeof dynamicPageSchema>;
type PageFormValues = StaticPageFormValues | DynamicPageFormValues;

interface Category {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
}

interface FilterOptions {
  categories: Category[];
  collections: Collection[];
  tags: string[];
  brands: string[];
  origins: string[];
}

interface PageFormProps {
  initialData?: Partial<PageFormValues & { id: string; pageType: 'static' | 'dynamic' }>;
  pageId?: string;
}

export default function PageForm({ initialData, pageId }: PageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageType, setPageType] = useState<'static' | 'dynamic'>(
    initialData?.pageType || 'static'
  );
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    collections: [],
    tags: [],
    brands: [],
    origins: [],
  });
  
  // State for selected filter values
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);

  // Separate forms for each page type
  const staticForm = useForm<StaticPageFormValues>({
    resolver: zodResolver(staticPageSchema),
    defaultValues: pageType === 'static' && initialData ? {
      title: initialData.title || '',
      slug: initialData.slug || '',
      description: initialData.description || '',
      pageType: 'static' as const,
      content: (initialData as StaticPageFormValues).content || '',
      metaTitle: initialData.metaTitle || '',
      metaDesc: initialData.metaDesc || '',
      published: initialData.published || false,
    } : {
      title: '',
      slug: '',
      description: '',
      pageType: 'static' as const,
      content: '',
      metaTitle: '',
      metaDesc: '',
      published: false,
    },
  });

  const dynamicForm = useForm<DynamicPageFormValues>({
    resolver: zodResolver(dynamicPageSchema),
    defaultValues: pageType === 'dynamic' && initialData ? {
      title: initialData.title || '',
      slug: initialData.slug || '',
      description: initialData.description || '',
      pageType: 'dynamic' as const,
      groupType: (initialData as DynamicPageFormValues).groupType || 'all',
      groupValues: (initialData as DynamicPageFormValues).groupValues || {},
      layout: (initialData as DynamicPageFormValues).layout || 'grid',
      sortBy: (initialData as DynamicPageFormValues).sortBy || 'name',
      itemsPerPage: (initialData as DynamicPageFormValues).itemsPerPage || 12,
      metaTitle: initialData.metaTitle || '',
      metaDesc: initialData.metaDesc || '',
      published: initialData.published || false,
    } : {
      title: '',
      slug: '',
      description: '',
      pageType: 'dynamic' as const,
      groupType: 'all' as const,
      groupValues: {},
      layout: 'grid' as const,
      sortBy: 'name' as const,
      itemsPerPage: 12,
      metaTitle: '',
      metaDesc: '',
      published: false,
    },
  });

  const currentForm = pageType === 'static' ? staticForm : dynamicForm;
  const slug = pageType === 'static' ? staticForm.watch('slug') : dynamicForm.watch('slug');
  const currentGroupType = pageType === 'dynamic' ? dynamicForm.watch('groupType') : null;
  
  // Clear selected values when groupType changes
  useEffect(() => {
    if (pageType === 'dynamic' && currentGroupType) {
      setSelectedCategories([]);
      setSelectedCollections([]);
      setSelectedTags([]);
      setSelectedBrands([]);
      setSelectedOrigins([]);
    }
  }, [currentGroupType, pageType]);
  
  // URLs for the page
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${slug || 'your-slug-here'}`
    : `/${slug || 'your-slug-here'}`;
  
  const previewUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/pages/${slug || 'your-slug-here'}`
    : `/pages/${slug || 'your-slug-here'}`;

  useEffect(() => {
    // Fetch all filter options from the new API
    fetch('/api/admin/pages/filter-options')
      .then(r => r.json())
      .then(data => {
        setFilterOptions({
          categories: data.categories || [],
          collections: data.collections || [],
          tags: data.tags || [],
          brands: data.brands || [],
          origins: data.origins || [],
        });
      })
      .catch(err => console.error('Failed to load filter options:', err));
    
    // Initialize selected values from initialData if editing
    if (initialData && pageType === 'dynamic') {
      const groupVals = (initialData as DynamicPageFormValues).groupValues || {};
      setSelectedCategories(groupVals.categoryIds || []);
      setSelectedTags(groupVals.tags || []);
      setSelectedBrands(groupVals.brands || []);
      setSelectedOrigins(groupVals.origins || []);
      if (groupVals.collectionId) {
        setSelectedCollections([groupVals.collectionId]);
      }
    }
  }, []);

  const onSubmit = async (data: PageFormValues) => {
    try {
      setIsSubmitting(true);
      
      // For dynamic pages, build groupValues from selected checkboxes
      if (data.pageType === 'dynamic') {
        const dynamicData = data as DynamicPageFormValues;
        const groupValues: Record<string, unknown> = {};
        
        switch (dynamicData.groupType) {
          case 'category':
            groupValues.categoryIds = selectedCategories;
            break;
          case 'tag':
            groupValues.tags = selectedTags;
            break;
          case 'collection':
            groupValues.collectionId = selectedCollections[0] || null;
            break;
          case 'brand':
            groupValues.brands = selectedBrands;
            break;
          case 'origin':
            groupValues.origins = selectedOrigins;
            break;
          case 'all':
          default:
            // No specific filters for "all"
            break;
        }
        
        dynamicData.groupValues = groupValues;
      }
      
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
      
      const pageUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/pages/${data.slug}`
        : `/pages/${data.slug}`;
        
      if (data.published) {
        alert(`✅ ${data.pageType === 'static' ? 'Static' : 'Product'} page ${pageId ? 'updated' : 'created'} successfully!\n\n📍 Your page is now live at:\n${pageUrl}\n\n🔗 You can also add it to your navigation menu.`);
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

  const handleStaticSubmit = staticForm.handleSubmit(onSubmit);
  const handleDynamicSubmit = dynamicForm.handleSubmit(onSubmit);

  return (
    <form onSubmit={pageType === 'static' ? handleStaticSubmit : handleDynamicSubmit} className="space-y-6">
      {/* Page Type Selector */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-l-4 border-blue-500 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-300 mb-3 text-lg">📄 Select Page Type</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => !pageId && setPageType('static')}
            disabled={!!pageId}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${pageType === 'static'
                ? 'border-blue-500 bg-blue-900/40 shadow-lg shadow-blue-500/20'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }
              ${pageId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-start gap-3">
              <FileText className={`w-6 h-6 flex-shrink-0 ${pageType === 'static' ? 'text-blue-400' : 'text-gray-400'}`} />
              <div>
                <h4 className={`font-semibold mb-1 ${pageType === 'static' ? 'text-blue-300' : 'text-gray-300'}`}>
                  Static Content Page
                </h4>
                <p className="text-sm text-gray-400">
                  For pages with custom HTML/CSS/JS content (About Us, Contact, Terms, etc.)
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => !pageId && setPageType('dynamic')}
            disabled={!!pageId}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${pageType === 'dynamic'
                ? 'border-purple-500 bg-purple-900/40 shadow-lg shadow-purple-500/20'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }
              ${pageId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-start gap-3">
              <Package className={`w-6 h-6 flex-shrink-0 ${pageType === 'dynamic' ? 'text-purple-400' : 'text-gray-400'}`} />
              <div>
                <h4 className={`font-semibold mb-1 ${pageType === 'dynamic' ? 'text-purple-300' : 'text-gray-300'}`}>
                  Dynamic Product Page
                </h4>
                <p className="text-sm text-gray-400">
                  For pages that display filtered products (categories, collections, tags)
                </p>
              </div>
            </div>
          </button>
        </div>
        {pageId && (
          <p className="text-xs text-yellow-400 mt-3 flex items-center gap-2">
            ⚠️ Page type cannot be changed after creation
          </p>
        )}
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
            {...(pageType === 'static' ? staticForm.register('title') : dynamicForm.register('title'))}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="e.g., About Us, Engine Parts, Contact"
          />
          {(pageType === 'static' ? staticForm.formState.errors.title : dynamicForm.formState.errors.title) && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              ⚠️ {(pageType === 'static' ? staticForm.formState.errors.title : dynamicForm.formState.errors.title)?.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            URL Slug <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">/pages/</span>
            <input
              {...(pageType === 'static' ? staticForm.register('slug') : dynamicForm.register('slug'))}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 font-mono"
              placeholder="about-us"
            />
          </div>
          {(pageType === 'static' ? staticForm.formState.errors.slug : dynamicForm.formState.errors.slug) && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              ⚠️ {(pageType === 'static' ? staticForm.formState.errors.slug : dynamicForm.formState.errors.slug)?.message}
            </p>
          )}
          
          {slug && (
            <div className="mt-3 space-y-2">
              <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 text-lg">🌐</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-300 mb-1">Public URL (via menu):</p>
                    <code className="text-sm text-blue-200 break-all block bg-blue-950/50 px-2 py-1 rounded">
                      {publicUrl}
                    </code>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 text-lg">�</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-purple-300 mb-1">Direct Access URL (admin preview):</p>
                    <code className="text-sm text-purple-200 break-all block bg-purple-950/50 px-2 py-1 rounded">
                      {previewUrl}
                    </code>
                  </div>
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
            {...(pageType === 'static' ? staticForm.register('description') : dynamicForm.register('description'))}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            rows={3}
            placeholder="Brief description..."
          />
        </div>
      </div>

      {/* STATIC PAGE: Content Editor */}
      {pageType === 'static' && (
        <div className="bg-blue-900/20 p-6 rounded-lg border-2 border-blue-800 shadow-lg space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-blue-300">✍️ Page Content (HTML/CSS/JS)</h3>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-blue-300 mb-2">
              Content <span className="text-red-400">*</span>
            </label>
            <textarea
              {...staticForm.register('content')}
              className="w-full px-4 py-3 bg-gray-900 border border-blue-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 font-mono text-sm"
              rows={20}
              placeholder="<h1>Welcome to Our Company</h1>
<p>We are a leading provider of...</p>

<style>
  h1 { color: #3b82f6; }
</style>

<script>
  console.log('Page loaded');
</script>"
            />
            {staticForm.formState.errors.content && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                ⚠️ {staticForm.formState.errors.content.message}
              </p>
            )}
            <p className="text-xs text-blue-400 mt-2">
              💡 You can use HTML, CSS, and JavaScript. Content will be rendered safely on the public page.
            </p>
          </div>
        </div>
      )}

      {/* DYNAMIC PAGE: Product Group Selection */}
      {pageType === 'dynamic' && (
        <div className="bg-purple-900/20 p-6 rounded-lg border-2 border-purple-800 shadow-lg space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-purple-300">🎯 Product Group Selection</h3>
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-300 mb-3">
              What products should this page show? <span className="text-red-400">*</span>
            </label>
            <select 
              {...dynamicForm.register('groupType')} 
              className="w-full px-4 py-3 bg-gray-900 border border-purple-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">🌐 All Products (Show entire catalog)</option>
              <option value="category">📂 Specific Categories</option>
              <option value="tag">🏷️ Products with Specific Tags</option>
              <option value="collection">📦 Specific Collections</option>
              <option value="brand">🏭 Products by Brand</option>
              <option value="origin">🌍 Products by Origin/Country</option>
            </select>
          </div>

          {dynamicForm.watch('groupType') === 'category' && (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                📂 Select Categories
              </label>
              {filterOptions.categories.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-900 rounded border border-gray-700">
                  {filterOptions.categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 p-3 bg-gray-800 hover:bg-gray-750 rounded cursor-pointer border border-gray-700 hover:border-blue-600 transition-all">
                      <input
                        type="checkbox"
                        value={cat.id}
                        checked={selectedCategories.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, cat.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-gray-800"
                      />
                      <span className="text-gray-200 text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-3">No categories found. Create categories first in Admin → Categories.</p>
              )}
            </div>
          )}

          {dynamicForm.watch('groupType') === 'collection' && (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                📦 Select Collections
              </label>
              {filterOptions.collections.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-900 rounded border border-gray-700">
                  {filterOptions.collections.map(col => (
                    <label key={col.id} className="flex items-center gap-2 p-3 bg-gray-800 hover:bg-gray-750 rounded cursor-pointer border border-gray-700 hover:border-purple-600 transition-all">
                      <input
                        type="checkbox"
                        value={col.id}
                        checked={selectedCollections.includes(col.id)}
                        onChange={(e) => {
                          // Collections: only one can be selected
                          if (e.target.checked) {
                            setSelectedCollections([col.id]);
                          } else {
                            setSelectedCollections([]);
                          }
                        }}
                        className="w-4 h-4 text-purple-600 border-gray-600 rounded focus:ring-2 focus:ring-purple-500 bg-gray-800"
                      />
                      <span className="text-gray-200 text-sm">{col.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-3">No collections found. Create collections first in Admin → Collections.</p>
              )}
            </div>
          )}

          {dynamicForm.watch('groupType') === 'tag' && (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                🏷️ Select Tags
              </label>
              {filterOptions.tags.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-900 rounded border border-gray-700">
                  {filterOptions.tags.map(tag => (
                    <label key={tag} className="flex items-center gap-2 p-3 bg-gray-800 hover:bg-gray-750 rounded cursor-pointer border border-gray-700 hover:border-green-600 transition-all">
                      <input
                        type="checkbox"
                        value={tag}
                        checked={selectedTags.includes(tag)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag]);
                          } else {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          }
                        }}
                        className="w-4 h-4 text-green-600 border-gray-600 rounded focus:ring-2 focus:ring-green-500 bg-gray-800"
                      />
                      <span className="text-gray-200 text-sm">{tag}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-3">No tags found. Add tags to your products first.</p>
              )}
            </div>
          )}

          {dynamicForm.watch('groupType') === 'brand' && (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                🏭 Select Brands
              </label>
              {filterOptions.brands.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-900 rounded border border-gray-700">
                  {filterOptions.brands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 p-3 bg-gray-800 hover:bg-gray-750 rounded cursor-pointer border border-gray-700 hover:border-orange-600 transition-all">
                      <input
                        type="checkbox"
                        value={brand}
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand]);
                          } else {
                            setSelectedBrands(selectedBrands.filter(b => b !== brand));
                          }
                        }}
                        className="w-4 h-4 text-orange-600 border-gray-600 rounded focus:ring-2 focus:ring-orange-500 bg-gray-800"
                      />
                      <span className="text-gray-200 text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-3">No brands found. Add brands to your products first.</p>
              )}
            </div>
          )}

          {dynamicForm.watch('groupType') === 'origin' && (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                🌍 Select Origins/Countries
              </label>
              {filterOptions.origins.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-900 rounded border border-gray-700">
                  {filterOptions.origins.map(origin => (
                    <label key={origin} className="flex items-center gap-2 p-3 bg-gray-800 hover:bg-gray-750 rounded cursor-pointer border border-gray-700 hover:border-cyan-600 transition-all">
                      <input
                        type="checkbox"
                        value={origin}
                        checked={selectedOrigins.includes(origin)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrigins([...selectedOrigins, origin]);
                          } else {
                            setSelectedOrigins(selectedOrigins.filter(o => o !== origin));
                          }
                        }}
                        className="w-4 h-4 text-cyan-600 border-gray-600 rounded focus:ring-2 focus:ring-cyan-500 bg-gray-800"
                      />
                      <span className="text-gray-200 text-sm">{origin}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-3">No origins found. Add origin/country to your products first.</p>
              )}
            </div>
          )}

          {/* Display Options for Dynamic Pages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-purple-800">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">📐 Layout</label>
              <select 
                {...dynamicForm.register('layout')} 
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="grid">Grid View</option>
                <option value="list">List View</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">🔄 Sort By</label>
              <select 
                {...dynamicForm.register('sortBy')} 
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price">Price (Low to High)</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">📊 Items Per Page</label>
              <input
                type="number"
                {...dynamicForm.register('itemsPerPage', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="4"
                max="100"
              />
            </div>
          </div>
        </div>
      )}

      {/* SEO & Publishing */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-lg space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-gray-100">🔍 SEO & Publishing</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Meta Title</label>
            <input
              {...(pageType === 'static' ? staticForm.register('metaTitle') : dynamicForm.register('metaTitle'))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="SEO title (max 60 chars)"
              maxLength={60}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Meta Description</label>
            <input
              {...(pageType === 'static' ? staticForm.register('metaDesc') : dynamicForm.register('metaDesc'))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="SEO description (max 160 chars)"
              maxLength={160}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...(pageType === 'static' ? staticForm.register('published') : dynamicForm.register('published'))}
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
