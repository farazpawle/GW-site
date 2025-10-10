'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Loader2, Package } from 'lucide-react';
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-sm p-6 sticky top-4 border border-gray-700">
              <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h2>

              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => updateFilters({ search: e.target.value })}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={filters.brand}
                    onChange={(e) => updateFilters({ brand: e.target.value })}
                    placeholder="Filter by brand..."
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Origin Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Origin
                  </label>
                  <select
                    value={filters.origin}
                    onChange={(e) => updateFilters({ origin: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Origins</option>
                    <option value="Germany">Germany</option>
                    <option value="Japan">Japan</option>
                    <option value="USA">USA</option>
                    <option value="UAE">UAE</option>
                    <option value="China">China</option>
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Installation Difficulty
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => updateFilters({ difficulty: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Professional">Professional</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilters({ sort: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="showcaseOrder-asc">Featured</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    {mode === 'ecommerce' && (
                      <>
                        <option value="price-asc">Price (Low to High)</option>
                        <option value="price-desc">Price (High to Low)</option>
                      </>
                    )}
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>

                {/* Clear Filters */}
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
                  className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-gray-800 rounded-lg shadow-sm p-12 text-center border border-gray-700">
                <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-100 mb-2">No products found</h3>
                <p className="text-gray-400">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-sm text-gray-400">
                    Showing {products.length} of {pagination?.totalCount || 0} products
                  </p>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => changePage(filters.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-gray-300">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => changePage(filters.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
