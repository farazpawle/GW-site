'use client';

import { useState, useEffect } from 'react';
import { Search, X, Package } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  partNumber: string;
  image: string;
  price: number;
  categoryId: string;
}

interface RelatedProductsSelectorProps {
  value: string[]; // Array of selected product IDs
  onChange: (ids: string[]) => void;
  currentProductId?: string; // Exclude current product from selection
  maxSelections?: number;
}

export default function RelatedProductsSelector({
  value = [],
  onChange,
  currentProductId,
  maxSelections = 4,
}: RelatedProductsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all products for selection
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/parts?pageSize=100');
        if (response.ok) {
          const data = await response.json();
          const allProducts = data.data || [];
          
          // Filter out current product if editing
          const filteredProducts = currentProductId
            ? allProducts.filter((p: Product) => p.id !== currentProductId)
            : allProducts;
          
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, currentProductId]);

  // Load selected products data
  useEffect(() => {
    const loadSelectedProducts = async () => {
      if (value.length === 0) {
        setSelectedProducts([]);
        return;
      }

      try {
        const promises = value.map(id => 
          fetch(`/api/admin/parts/${id}`).then(res => res.json())
        );
        const results = await Promise.all(promises);
        const loadedProducts = results
          .filter(r => r.success)
          .map(r => r.data);
        setSelectedProducts(loadedProducts);
      } catch (error) {
        console.error('Failed to load selected products:', error);
      }
    };

    loadSelectedProducts();
  }, [value]);

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle product selection
  const handleToggleProduct = (product: Product) => {
    const isSelected = value.includes(product.id);
    
    if (isSelected) {
      // Remove from selection
      const newValue = value.filter(id => id !== product.id);
      onChange(newValue);
    } else {
      // Add to selection if under limit
      if (value.length < maxSelections) {
        onChange([...value, product.id]);
      }
    }
  };

  // Remove selected product
  const handleRemove = (productId: string) => {
    onChange(value.filter(id => id !== productId));
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-300">
        Related Products (You May Also Like)
      </label>
      <p className="text-xs text-gray-400 -mt-2 mb-3">
        Select up to {maxSelections} products to show as similar items
      </p>

      {/* Selected Products Display */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          {selectedProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg"
            >
              <div className="relative w-12 h-12 flex-shrink-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                <Image
                  src={product.image || '/images/placeholder-product.svg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-400">
                  {product.partNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(product.id)}
                className="p-1 hover:bg-red-500/10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Products Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={value.length >= maxSelections}
        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                 text-white hover:border-brand-maroon transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed
                 flex items-center justify-center gap-2"
      >
        <Package className="w-4 h-4" />
        {value.length >= maxSelections 
          ? `Maximum ${maxSelections} products selected`
          : `Add Related Products (${value.length}/${maxSelections})`
        }
      </button>

      {/* Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Select Related Products
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or part number..."
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg 
                           text-white placeholder-gray-500 focus:outline-none focus:border-brand-maroon"
                />
              </div>

              <p className="mt-3 text-sm text-gray-400">
                {value.length}/{maxSelections} products selected
              </p>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="text-center py-12 text-gray-400">
                  Loading products...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No products found
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredProducts.map((product) => {
                    const isSelected = value.includes(product.id);
                    const canSelect = value.length < maxSelections;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleToggleProduct(product)}
                        disabled={!isSelected && !canSelect}
                        className={`
                          flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left
                          ${isSelected
                            ? 'bg-brand-maroon/10 border-brand-maroon'
                            : 'bg-[#0a0a0a] border-[#2a2a2a] hover:border-brand-maroon/50'
                          }
                          ${!isSelected && !canSelect ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <div className="relative w-16 h-16 flex-shrink-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
                          <Image
                            src={product.image || '/images/placeholder-product.svg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {product.partNumber}
                          </p>
                          <p className="text-sm text-brand-maroon font-semibold">
                            ${Number(product.price).toFixed(2)}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 w-6 h-6 bg-brand-maroon rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#2a2a2a]">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full px-6 py-3 bg-brand-maroon hover:bg-brand-maroon/90 
                         text-white font-semibold rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
