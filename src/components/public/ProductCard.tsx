'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DEFAULT_IMAGES } from '@/lib/constants';
import { GlowCard } from '@/components/ui/spotlight-card';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    images?: string[];
    price?: number;
    comparePrice?: number | null;
    brand?: string | null;
    tags?: string[];
    inStock?: boolean;
  };
  ecommerceMode?: boolean;
  showPricing?: boolean;
}

export default function ProductCard({ product, ecommerceMode = false, showPricing = false }: ProductCardProps) {
  const imageUrl = product.image || (product.images && product.images[0]) || DEFAULT_IMAGES.product;
  const shouldShowPrice = ecommerceMode || showPricing;

  return (
    <Link 
      href={`/products/${product.slug}`}
      className="block h-full relative group"
    >
      {/* Background Glow Layer */}
      <GlowCard 
        customSize={true} 
        height="520px" 
        width="100%"
        glowColor="red"
        className="absolute inset-0"
      >
        <div className="w-full h-full"></div>
      </GlowCard>
      
      {/* Content Card Layer - Positioned on top with slight inset to show glow */}
      <div 
        className="absolute bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer border border-gray-700"
        style={{ 
          top: '3px', 
          left: '3px', 
          right: '3px', 
          bottom: '3px'
        }}
      >
        {/* FIXED Image Container - ALWAYS 240px */}
        <div className="relative w-full bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0" style={{ height: '240px' }}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-6 group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Stock Badge - Fixed Position */}
          {shouldShowPrice && product.inStock !== undefined && (
            <div className="absolute top-3 right-3 z-10">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
                  product.inStock
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          )}
        </div>

        {/* Content Container - Fills remaining space */}
        <div className="p-5 flex flex-col flex-grow">
          {/* FIXED Brand Area - ALWAYS 20px (empty or filled) */}
          <div className="mb-2 overflow-hidden" style={{ height: '20px', minHeight: '20px', maxHeight: '20px' }}>
            {product.brand ? (
              <p className="text-xs text-red-400 font-bold uppercase tracking-widest truncate">
                {product.brand}
              </p>
            ) : (
              <div style={{ height: '20px' }}></div>
            )}
          </div>

          {/* FIXED Title Area - ALWAYS 48px (2 lines max) */}
          <div className="mb-3 overflow-hidden" style={{ height: '48px', minHeight: '48px', maxHeight: '48px' }}>
            <h3 className="text-lg font-bold text-gray-100 line-clamp-2 leading-6 group-hover:text-red-400 transition-colors duration-200">
              {product.name}
            </h3>
          </div>

          {/* FIXED Description Area - ALWAYS 40px (2 lines max or empty) */}
          <div className="mb-3 overflow-hidden" style={{ height: '40px', minHeight: '40px', maxHeight: '40px' }}>
            {product.description ? (
              <p className="text-sm text-gray-400 line-clamp-2 leading-5">
                {product.description}
              </p>
            ) : (
              <div style={{ height: '40px' }}></div>
            )}
          </div>

          {/* FIXED Tags Area - ALWAYS 24px (tags or empty) */}
          <div className="mb-3 overflow-hidden" style={{ height: '24px', minHeight: '24px', maxHeight: '24px' }}>
            {product.tags && product.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 text-xs font-medium bg-red-900/30 text-red-400 rounded-full border border-red-800 leading-none"
                  >
                    {tag}
                  </span>
                ))}
                {product.tags.length > 2 && (
                  <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-700 text-gray-300 rounded-full leading-none">
                    +{product.tags.length - 2}
                  </span>
                )}
              </div>
            ) : (
              <div style={{ height: '24px' }}></div>
            )}
          </div>

          {/* Spacer - fills remaining space before price */}
          <div className="flex-grow"></div>

          {/* FIXED Price Section - ALWAYS at BOTTOM, ALWAYS 64px */}
          <div className="pt-4 border-t-2 border-gray-700" style={{ height: '64px', minHeight: '64px', maxHeight: '64px' }}>
            {shouldShowPrice ? (
              product.price !== undefined ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-red-400">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                    <span className="text-sm text-gray-500 line-through">
                      ${Number(product.comparePrice).toFixed(2)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center" style={{ height: '32px' }}>
                  <span className="text-sm text-gray-500 italic">Price not available</span>
                </div>
              )
            ) : (
              <div style={{ height: '32px' }}></div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
