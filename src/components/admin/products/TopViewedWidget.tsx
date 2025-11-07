'use client';

import { useEffect, useState } from 'react';
import ProductPerformanceCard from './ProductPerformanceCard';
import { TrendingUp, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  partNumber: string;
  image: string | null;
  views: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  featured: boolean;
  published: boolean;
  createdAt: string;
}

export default function TopViewedWidget() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopViewed = async () => {
      try {
        const response = await fetch('/api/admin/products/top-viewed?limit=20');
        const result = await response.json();

        if (result.success) {
          setProducts(result.data);
        } else {
          console.error('Failed to fetch top viewed products:', result.error);
        }
      } catch (error) {
        console.error('Error fetching top viewed products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopViewed();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 lg:p-8 shadow-xl">
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="w-8 h-8 text-brand-maroon animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 lg:p-8 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-blue-400" size={24} />
        <h2 className="text-xl lg:text-2xl font-bold text-white">Top 20 Viewed Products</h2>
      </div>

      {/* Products List */}
      {products.length > 0 ? (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-maroon/50 scrollbar-track-[#1a1a1a]">
          {products.map((product) => (
            <ProductPerformanceCard key={product.id} product={product} variant="topViewed" />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#0a0a0a] rounded-xl border border-dashed border-[#2a2a2a]">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-600 mb-3" />
          <p className="text-gray-400 mb-1">No product views yet</p>
          <p className="text-sm text-gray-500">Views will be tracked automatically</p>
        </div>
      )}
    </div>
  );
}
