'use client';

import { useEffect, useState } from 'react';
import ProductPerformanceCard from './ProductPerformanceCard';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  partNumber: string;
  image: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  issues: string[];
  issueCount: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NeedsAttentionWidget() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNeedsAttention = async () => {
      try {
        const response = await fetch('/api/admin/products/needs-attention');
        const result = await response.json();

        if (result.success) {
          setProducts(result.data.slice(0, 5)); // Show top 5
        } else {
          console.error('Failed to fetch products needing attention:', result.error);
        }
      } catch (error) {
        console.error('Error fetching products needing attention:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNeedsAttention();
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="text-yellow-400" size={24} />
            <h2 className="text-xl lg:text-2xl font-bold text-white">Needs Attention</h2>
          </div>
          <p className="text-sm text-gray-400">Products that need updates or improvements</p>
        </div>

        {products.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle size={16} className="text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">{products.length}</span>
          </div>
        )}
      </div>

      {/* Products List */}
      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((product) => (
            <ProductPerformanceCard key={product.id} product={product} variant="needsAttention" />
          ))}

          {products.length >= 5 && (
            <div className="pt-4 text-center">
              <Link
                href="/admin/parts?filter=needs-attention"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-maroon/10 hover:bg-brand-maroon text-brand-maroon hover:text-white rounded-lg text-sm font-medium transition-all duration-300 border border-brand-maroon/20 hover:border-brand-maroon"
              >
                View All Issues
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#0a0a0a] rounded-xl border border-dashed border-[#2a2a2a]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-gray-400 mb-1 font-medium">All products look great!</p>
          <p className="text-sm text-gray-500">
            No products need attention at the moment
          </p>
        </div>
      )}
    </div>
  );
}
