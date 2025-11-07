'use client';

import { useEffect, useState } from 'react';
import ProductPerformanceCard from './ProductPerformanceCard';
import { AlertTriangle, Loader2, HelpCircle } from 'lucide-react';
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
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchNeedsAttention = async () => {
      try {
        const response = await fetch('/api/admin/products/needs-attention');
        const result = await response.json();

        if (result.success) {
          setProducts(result.data); // Show all products with issues
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
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-yellow-400" size={24} />
          <h2 className="text-xl lg:text-2xl font-bold text-white">Needs Attention</h2>
          <div className="relative">
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <HelpCircle size={18} />
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-8 z-10 w-64 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl">
                <p className="text-xs text-gray-300">Products that need updates or improvements</p>
              </div>
            )}
          </div>
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
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-maroon/20 scrollbar-track-transparent hover:scrollbar-thumb-brand-maroon/40">
          {products.map((product) => (
            <ProductPerformanceCard key={product.id} product={product} variant="needsAttention" />
          ))}
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
