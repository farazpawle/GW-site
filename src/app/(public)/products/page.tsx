'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2, Package } from 'lucide-react';
import ProductCard from '@/components/public/ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string;
  price?: number;
  comparePrice?: number | null;
  tags: string[];
  brand: string | null;
  origin: string | null;
  difficulty: string | null;
  featured: boolean;
  partNumber?: string;
  sku?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  inStock?: boolean;
  stockQuantity?: number;
}

interface ProductsResponse {
  success: boolean;
  mode: 'showcase' | 'ecommerce';
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function ProductCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [mode, setMode] = useState<'showcase' | 'ecommerce'>('showcase');
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    tags: searchParams.get('tags') || '',
    brand: searchParams.get('brand') || '',
    origin: searchParams.get('origin') || '',
    difficulty: searchParams.get('difficulty') || '',
    sort: searchParams.get('sort') || 'showcaseOrder-asc',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.category) params.set('category', filters.category);
        if (filters.tags) params.set('tags', filters.tags);
        if (filters.brand) params.set('brand', filters.brand);
        if (filters.origin) params.set('origin', filters.origin);
        if (filters.difficulty) params.set('difficulty', filters.difficulty);
        params.set('sort', filters.sort);
        params.set('page', filters.page.toString());

        const response = await fetch(`/api/public/showcase/products?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch products');

        const data: ProductsResponse = await response.json();
        if (data.success) {
          // Debug logging - REMOVE AFTER VERIFICATION
          console.log('📦 Products Page - Received data:', {
            count: data.data.length,
            mode: data.mode,
            firstProduct: data.data[0] ? {
              name: data.data[0].name,
              partNumber: data.data[0].partNumber,
              sku: data.data[0].sku,
              brand: data.data[0].brand,
              origin: data.data[0].origin,
              category: data.data[0].category,
              hasAllFields: !!(data.data[0].partNumber && data.data[0].brand && data.data[0].category)
            } : null
          });
          
          setProducts(data.data);
          setMode(data.mode);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters, page: 1 }; // Reset to page 1 on filter change
    setFilters(updated);

    // Update URL
    const params = new URLSearchParams();
    if (updated.search) params.set('search', updated.search);
    if (updated.category) params.set('category', updated.category);
    if (updated.tags) params.set('tags', updated.tags);
    if (updated.brand) params.set('brand', updated.brand);
    if (updated.origin) params.set('origin', updated.origin);
    if (updated.difficulty) params.set('difficulty', updated.difficulty);
    if (updated.sort) params.set('sort', updated.sort);
    if (updated.page > 1) params.set('page', updated.page.toString());

    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const changePage = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <h1 className="text-3xl font-bold text-gray-100">Our Products</h1>
          <p className="mt-2 text-gray-300">
            {mode === 'ecommerce'
              ? 'Browse our complete catalog of automotive parts with pricing'
              : 'Explore our showcase of premium automotive parts and accessories'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Compact Filters Bar - Dark Theme */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-xl mb-6 border border-gray-700/50 overflow-hidden">
          <div className="p-4">
            {/* Single Row Layout - All filters in one line */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar - Compact */}
              <div className="flex-1 min-w-[280px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all hover:bg-gray-900/80"
                  />
                </div>
              </div>

              {/* Brand Filter - Compact */}
              <input
                type="text"
                value={filters.brand}
                onChange={(e) => updateFilters({ brand: e.target.value })}
                placeholder="Brand"
                className="w-32 px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all hover:bg-gray-900/80"
              />

              {/* Origin Filter - Compact */}
              <div className="relative">
                <select
                  value={filters.origin}
                  onChange={(e) => updateFilters({ origin: e.target.value })}
                  className="w-36 pl-3 pr-8 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all appearance-none cursor-pointer hover:bg-gray-900/80"
                >
                  <option value="">Origin</option>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="Japan">🇯🇵 Japan</option>
                  <option value="USA">🇺🇸 USA</option>
                  <option value="UAE">🇦🇪 UAE</option>
                  <option value="China">🇨🇳 China</option>
                </select>
                <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Difficulty Filter - Compact */}
              <div className="relative">
                <select
                  value={filters.difficulty}
                  onChange={(e) => updateFilters({ difficulty: e.target.value })}
                  className="w-36 pl-3 pr-8 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all appearance-none cursor-pointer hover:bg-gray-900/80"
                >
                  <option value="">Difficulty</option>
                  <option value="Easy">✓ Easy</option>
                  <option value="Moderate">⚙️ Moderate</option>
                  <option value="Professional">🔧 Professional</option>
                  <option value="Advanced">⚡ Advanced</option>
                </select>
                <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Sort - Compact */}
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="w-40 pl-3 pr-8 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all appearance-none cursor-pointer hover:bg-gray-900/80"
                >
                  <option value="showcaseOrder-asc">⭐ Featured</option>
                  <option value="name-asc">A → Z</option>
                  <option value="name-desc">Z → A</option>
                  {mode === 'ecommerce' && (
                    <>
                      <option value="price-asc">$ Low to High</option>
                      <option value="price-desc">$ High to Low</option>
                    </>
                  )}
                  <option value="newest">🆕 Newest</option>
                  <option value="popular">🔥 Popular</option>
                </select>
                <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Clear Filters Button - Compact */}
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    category: '',
                    tags: '',
                    brand: '',
                    origin: '',
                    difficulty: '',
                    sort: 'showcaseOrder-asc',
                    page: 1,
                  });
                  router.push('/products');
                }}
                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 text-sm font-medium flex items-center gap-2 group"
                title="Clear all filters"
              >
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-800 rounded-2xl border border-gray-700">
              <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
              <p className="text-gray-300 font-medium">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-12 text-center">
              <div className="bg-gray-700/50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-3">No products found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                We couldn&apos;t find any products matching your criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    category: '',
                    tags: '',
                    brand: '',
                    origin: '',
                    difficulty: '',
                    sort: 'showcaseOrder-asc',
                    page: 1,
                  });
                  router.push('/products');
                }}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-md">
                    {pagination?.totalCount || 0}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">
                      Products Found
                    </p>
                    <p className="text-xs text-gray-500">
                      Showing {products.length} on this page
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Page {filters.page} of {pagination?.totalPages || 1}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    ecommerceMode={mode === 'ecommerce'}
                    showPricing={mode === 'ecommerce'}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => changePage(filters.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-gray-200 rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold group"
                    >
                      <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold shadow-md">
                        {pagination.page}
                      </span>
                      <span className="text-gray-500 font-medium">of</span>
                      <span className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg font-semibold">
                        {pagination.totalPages}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => changePage(filters.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:hover:shadow-lg group"
                    >
                      Next
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
