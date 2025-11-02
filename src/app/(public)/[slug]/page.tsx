'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ProductCard from '@/components/public/ProductCard';

interface PageData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  pageType: string;
  content: string | null;
  groupType: string;
  layout: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  partNumber: string;
  sku: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  stockQuantity: number;
  inStock?: boolean;
  images: string[];
  image?: string;
  brand?: string | null;
  origin?: string | null;
  tags?: string[];
  difficulty?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function PublicPageRenderer() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 24;

  useEffect(() => {
    if (!slug) return;

    const fetchPageData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/public/pages/${slug}?page=${currentPage}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Page not found');
          } else {
            setError('Failed to load page');
          }
          return;
        }
        
        const data = await response.json();
        setPageData(data.page);
        setProducts(data.products || []);
        setTotal(data.total || 0);
      } catch {
        setError('Failed to load page');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [slug, currentPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error || !pageData) {
    // Trigger Next.js 404 page
    notFound();
  }

  // STATIC PAGE RENDERING
  if (pageData.pageType === 'static') {
    return (
      <div className="min-h-screen bg-white">
        {/* Render HTML content */}
        <div 
          dangerouslySetInnerHTML={{ __html: pageData.content || '' }}
          className="static-page-content"
        />
      </div>
    );
  }

  // DYNAMIC PRODUCT PAGE RENDERING
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-100 mb-2">{pageData.title}</h1>
        {pageData.description && (
          <p className="text-lg text-gray-300">{pageData.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-2">
          {total} {total === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No products found for this page.</p>
        </div>
      ) : (
        <>
          <div
            className={
              pageData.layout === 'list'
                ? 'space-y-6'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            }
          >
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  partNumber: product.partNumber,
                  sku: product.sku,
                  description: product.description,
                  image: product.image,
                  images: product.images,
                  price: product.price,
                  comparePrice: product.comparePrice,
                  brand: product.brand,
                  origin: product.origin,
                  tags: product.tags,
                  category: product.category,
                  inStock: product.inStock,
                  stockQuantity: product.stockQuantity,
                }} 
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-700"
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, arr) => {
                    const prevPage = arr[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex gap-2">
                        {showEllipsis && (
                          <span className="px-3 py-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>
              
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
