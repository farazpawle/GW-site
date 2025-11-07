"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ProductGrid from "@/components/public/ProductGrid";
import { Loader2 } from "lucide-react";

interface CollectionData {
  collection: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    published: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function PublicCollectionPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<CollectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!slug) return;

    const fetchCollection = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/public/collections/${slug}?page=${currentPage}`,
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("Collection not found");
          } else {
            setError("Failed to load collection");
          }
          return;
        }

        const result = await response.json();
        setData(result);
      } catch {
        setError("An error occurred while loading the collection");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [slug, currentPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { collection, products, pagination } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {collection.description}
            </p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            Showing {products.length} of {pagination.total} products
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <ProductGrid
          products={products}
          emptyMessage="No products in this collection yet"
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 border rounded-lg ${
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
