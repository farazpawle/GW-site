'use client';

import ProductCard from './ProductCard';

interface Product {
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
}

interface ProductGridProps {
  products: Product[];
  ecommerceMode?: boolean;
  showPricing?: boolean;
  emptyMessage?: string;
}

export default function ProductGrid({ 
  products, 
  ecommerceMode = false, 
  showPricing = false,
  emptyMessage = 'No products found'
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}
