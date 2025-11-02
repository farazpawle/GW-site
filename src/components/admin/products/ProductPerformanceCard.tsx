'use client';

import { Eye, Edit, ExternalLink, Star, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductPerformanceCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    partNumber: string;
    image: string | null;
    views?: number;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    featured?: boolean;
    published?: boolean;
    issues?: string[];
    createdAt: string;
  };
  variant: 'topViewed' | 'needsAttention';
}

export default function ProductPerformanceCard({ product, variant }: ProductPerformanceCardProps) {
  const isTopViewed = variant === 'topViewed';

  return (
    <div className="flex gap-2 p-2 bg-[#0a0a0a] rounded border border-[#2a2a2a] hover:border-brand-maroon/50 transition-colors">
      {/* Product Image - Ultra Compact */}
      <div className="relative w-10 h-10 bg-[#1a1a1a] rounded overflow-hidden flex-shrink-0">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <AlertCircle size={16} />
          </div>
        )}
      </div>

      {/* Product Info - Minimal */}
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-medium text-white truncate">
              {product.name}
            </h3>
            {product.featured && (
              <Star size={12} className="text-yellow-500 flex-shrink-0" fill="currentColor" />
            )}
          </div>
          
          {/* Stats based on variant */}
          {isTopViewed ? (
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Eye size={12} className="text-blue-400" />
                <span className="text-blue-400 font-medium">{product.views?.toLocaleString() || 0}</span>
              </div>
              <span>•</span>
              <span className="truncate">{product.sku}</span>
            </div>
          ) : (
            // Needs Attention - show issues
            <div className="flex flex-wrap gap-1 mt-0.5">
              {product.issues?.map((issue) => {
                const issueConfig: Record<string, { label: string; color: string }> = {
                  unpublished: { label: 'Unpublished', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
                  no_images: { label: 'No Images', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                  no_description: { label: 'No Description', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
                  no_short_desc: { label: 'No Short Desc', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
                };

                const config = issueConfig[issue] || { label: issue, color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };

                return (
                  <span
                    key={issue}
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${config.color}`}
                  >
                    {config.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons - Minimal */}
        <div className="flex gap-1 flex-shrink-0">
          <Link
            href={`/admin/parts/${product.id}/edit`}
            className="flex items-center justify-center p-1.5 bg-brand-maroon/10 hover:bg-brand-maroon text-brand-maroon hover:text-white rounded transition-colors"
            title="Edit Product"
          >
            <Edit size={12} />
          </Link>
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="flex items-center justify-center p-1.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded transition-colors"
            title="View on Site"
          >
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
