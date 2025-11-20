'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DEFAULT_IMAGES } from '@/lib/constants';
import { GlowCard } from '@/components/ui/spotlight-card';
import { Badge } from '@/components/ui/badge';

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
    sku?: string | null;
    inStock?: boolean;
    stockQuantity?: number;
    partNumber?: string;
    origin?: string | null;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
}

interface ProductCardSettings {
  showPartNumber: boolean;
  showSku: boolean;
  showBrand: boolean;
  showOrigin: boolean;
  showCategory: boolean;
  showDescription: boolean;
  showTags: boolean;
  showPrice: boolean;
  showComparePrice: boolean;
  showDiscountBadge: boolean;
  showStockStatus: boolean;
}

// Default settings (all visible)
const DEFAULT_SETTINGS: ProductCardSettings = {
  showPartNumber: true,
  showSku: true,
  showBrand: true,
  showOrigin: true,
  showCategory: true,
  showDescription: true,
  showTags: true,
  showPrice: true,
  showComparePrice: true,
  showDiscountBadge: true,
  showStockStatus: true,
};

export default function ProductCard({ product }: ProductCardProps) {
  const [settings, setSettings] = useState<ProductCardSettings>(DEFAULT_SETTINGS);
  const imageUrl = product.image || (product.images && product.images[0]) || DEFAULT_IMAGES.product;

  // Fetch product card settings
  useEffect(() => {
    console.log('🎴 ProductCard: Fetching settings...');
    // Add cache-busting query parameter to force fresh data
    fetch('/api/public/product-card-settings?_=' + Date.now())
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          console.log('🎴 ProductCard: Settings loaded:', result.data);
          console.log('🎴 ProductCard: Component will now render with these settings');
          setSettings(result.data);
        } else {
          console.error('🎴 ProductCard: Failed to load settings:', result);
        }
      })
      .catch((error) => {
        console.error('🎴 ProductCard: Error fetching settings:', error);
      });
  }, []);
  
  // Calculate discount percentage
  const discountPercentage = 
    product.comparePrice && product.price && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;
  
  // Determine inventory badge
  const getInventoryBadge = () => {
    // Only show stock badge if setting is enabled and stock info exists
    if (!settings.showStockStatus || product.inStock === undefined) return null;
    
    if (!product.inStock) {
      return {
        text: 'Out of Stock',
        variant: 'danger' as const,
      };
    }
    
    if (product.stockQuantity !== undefined && product.stockQuantity < 10) {
      return {
        text: `Low Stock (${product.stockQuantity})`,
        variant: 'warning' as const,
      };
    }
    
    return {
      text: 'In Stock',
      variant: 'success' as const,
    };
  };
  
  const inventoryBadge = getInventoryBadge();

  return (
    <Link 
      href={`/products/${product.slug}`}
      className="block h-full relative group"
    >
      {/* Background Glow Layer */}
      <GlowCard 
        customSize={true} 
        height="560px" 
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
          top: '1px', 
          left: '1px', 
          right: '1px', 
          bottom: '1px'
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
          
          {/* Badges Container */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
            {/* Discount Badge (Left) */}
            {settings.showDiscountBadge && discountPercentage && (
              <Badge variant="danger" className="shadow-md">
                -{discountPercentage}% OFF
              </Badge>
            )}
            
            {/* Inventory Badge (Right) */}
            {settings.showStockStatus && inventoryBadge && (
              <Badge variant={inventoryBadge.variant} className="shadow-md ml-auto">
                {inventoryBadge.text}
              </Badge>
            )}
          </div>
        </div>

        {/* Content Container - Fills remaining space */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Part Number & SKU Row - FIXED 20px */}
          <div className="mb-2 flex items-center gap-2 overflow-hidden" style={{ height: '20px', minHeight: '20px', maxHeight: '20px' }}>
            <div className="flex items-center gap-2">
              {settings.showPartNumber && product.partNumber && (
                <p className="text-xs text-red-400 font-mono font-bold tracking-wide truncate">
                  #{product.partNumber}
                </p>
              )}
              {settings.showSku && product.sku && (
                <p className="text-xs text-gray-400 font-mono text-[10px] tracking-wide truncate">
                  SKU: {product.sku}
                </p>
              )}
            </div>
            {settings.showCategory && product.category && (
              <span className="text-xs text-gray-400 truncate ml-auto">
                📁 {product.category.name}
              </span>
            )}
          </div>

          {/* Brand & Origin Row - FIXED 20px */}
          <div className="mb-2 flex justify-between items-center overflow-hidden" style={{ height: '20px', minHeight: '20px', maxHeight: '20px' }}>
            <div className="flex items-center gap-2">
              {settings.showBrand && product.brand && (
                <p className="text-xs text-gray-300 font-semibold uppercase tracking-wider truncate">
                  🏷️ {product.brand}
                </p>
              )}
              {settings.showOrigin && product.origin && (
                <p className="text-xs text-gray-500 truncate">
                  🌍 {product.origin}
                </p>
              )}
            </div>
          </div>

          {/* FIXED Title Area - ALWAYS 48px (2 lines max) */}
          <div className="mb-3 overflow-hidden" style={{ height: '48px', minHeight: '48px', maxHeight: '48px' }}>
            <h3 className="text-lg font-bold text-gray-100 line-clamp-2 leading-6 group-hover:text-red-400 transition-colors duration-200">
              {product.name}
            </h3>
          </div>

          {/* FIXED Description Area - ALWAYS 40px (2 lines max or empty) */}
          <div className="mb-3 overflow-hidden" style={{ height: '40px', minHeight: '40px', maxHeight: '40px' }}>
            {settings.showDescription && product.description ? (
              <p className="text-sm text-gray-400 line-clamp-2 leading-5">
                {product.description}
              </p>
            ) : (
              <div style={{ height: '40px' }}></div>
            )}
          </div>

          {/* FIXED Tags Area - ALWAYS 24px (tags or empty) */}
          <div className="mb-3 overflow-hidden" style={{ height: '24px', minHeight: '24px', maxHeight: '24px' }}>
            {settings.showTags && product.tags && product.tags.length > 0 ? (
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
            {/* Show price if admin setting is ON */}
            {settings.showPrice ? (
              product.price !== undefined ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-red-400">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  {settings.showComparePrice && product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                    <span className="text-sm text-gray-500 line-through">
                      ${Number(product.comparePrice).toFixed(2)}
                    </span>
                  )}
                </div>
              ) : (
                /* No price data available */
                <div className="flex items-center" style={{ height: '32px' }}>
                  <span className="text-sm text-gray-500 italic">Price not available</span>
                </div>
              )
            ) : (
              /* Admin disabled price - show empty space */
              <div style={{ height: '32px' }}></div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
