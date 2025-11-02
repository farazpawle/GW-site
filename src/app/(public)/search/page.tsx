import Link from 'next/link';
import Image from 'next/image';
import SearchFilters from '@/components/search/SearchFilters';
import SearchEmptyState from '@/components/search/SearchEmptyState';
import SearchErrorState from '@/components/search/SearchErrorState';
import Pagination from '@/components/search/SearchPagination';

interface SearchParams {
  q?: string;
  page?: string;
  categoryId?: string | string[];
  brand?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  tags?: string | string[];
  sort?: string;
}

interface SearchPageProps {
  searchParams: Promise<SearchParams>;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  partNumber: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  featured: boolean;
}

interface SearchMetadata {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  query: string;
  appliedFilters: {
    categoryIds: string[];
    brands: string[];
    tags: string[];
    minPrice: string | null;
    maxPrice: string | null;
    sort: string;
  };
}

interface SearchResponse {
  results: SearchResult[];
  metadata: SearchMetadata;
}

async function searchProducts(params: SearchParams): Promise<SearchResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.append('q', params.q);
  if (params.page) queryParams.append('page', params.page);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.minPrice) queryParams.append('minPrice', params.minPrice);
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
  
  // Handle array parameters
  const categoryIds = Array.isArray(params.categoryId) ? params.categoryId : params.categoryId ? [params.categoryId] : [];
  categoryIds.forEach(id => queryParams.append('categoryId', id));
  
  const brands = Array.isArray(params.brand) ? params.brand : params.brand ? [params.brand] : [];
  brands.forEach(brand => queryParams.append('brand', brand));
  
  const tags = Array.isArray(params.tags) ? params.tags : params.tags ? [params.tags] : [];
  tags.forEach(tag => queryParams.append('tags', tag));
  
  const url = `${baseUrl}/api/search?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    cache: 'no-store', // Always fetch fresh results
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch search results');
  }
  
  return response.json();
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  
  // If no query, show empty state
  if (!query) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Search for Parts</h1>
            <p className="text-gray-400 mb-8">Enter a search term to find auto parts</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-[#6e0000] text-white rounded-lg hover:bg-[#8b0000] transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  try {
    const data = await searchProducts(params);
    const { results, metadata } = data;
    
    return (
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
            <h1 className="text-3xl font-bold text-gray-100">
              Search Results for &quot;{metadata.query}&quot;
            </h1>
            <p className="mt-2 text-gray-300">
              {metadata.totalCount} {metadata.totalCount === 1 ? 'result' : 'results'} found
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
          {/* Compact Filters Bar - Same as Products Page */}
          <SearchFilters />
          
          {/* Results Grid */}
          {results.length > 0 ? (
            <>
              {/* Results Count Card */}
              <div className="mb-6 flex items-center justify-between bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-md">
                    {metadata.totalCount}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">
                      Products Found
                    </p>
                    <p className="text-xs text-gray-500">
                      Showing {results.length} on this page
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Page {metadata.currentPage} of {metadata.totalPages}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Pagination */}
              {metadata.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination metadata={metadata} query={query} />
                </div>
              )}
            </>
          ) : (
            <SearchEmptyState query={metadata.query} />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Search page error:', error);
    return <SearchErrorState />;
  }
}

// Product Card Component
function ProductCard({ product }: { product: SearchResult }) {
  const imageUrl = product.images[0] || '/images/placeholder.jpg';
  
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-[#6e0000] transition-all duration-300"
    >
      <div className="aspect-square relative bg-[#0f0f0f]">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.featured && (
          <div className="absolute top-2 right-2 bg-[#6e0000] text-white text-xs px-2 py-1 rounded">
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
        <h3 className="font-semibold text-white group-hover:text-[#ff9999] transition-colors mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 mb-3">Part #: {product.partNumber}</p>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
          {product.comparePrice && (
            <span className="text-sm text-gray-500 line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}


