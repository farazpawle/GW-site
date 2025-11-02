/**
 * FilterBuilder Component
 * Visual interface for building collection filter rules
 * Dynamically fetches available filter options from API
 */

'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FilterOptions {
  categories: Category[];
  brands: string[];
  origins: string[];
  tags: string[];
}

interface FilterRules {
  categoryIds?: string[];
  brands?: string[];
  tags?: string[];
  origins?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
}

interface FilterBuilderProps {
  filterRules: FilterRules;
  onChange: (rules: FilterRules) => void;
  disabled?: boolean;
}

export default function FilterBuilder({ filterRules, onChange, disabled = false }: FilterBuilderProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch filter options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/collections/filter-options');
        if (!response.ok) throw new Error('Failed to fetch filter options');
        
        const data = await response.json();
        setFilterOptions(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load filter options');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (field: keyof FilterRules, value: string | boolean | number | string[] | undefined) => {
    onChange({
      ...filterRules,
      [field]: value,
    });
  };

  const toggleArrayValue = (field: keyof FilterRules, value: string) => {
    const currentValues = (filterRules[field] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    
    handleChange(field, newValues.length > 0 ? newValues : undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-400">Loading filter options...</span>
      </div>
    );
  }

  if (error || !filterOptions) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
        {error || 'Failed to load filter options'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Categories
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filterOptions.categories.map((category) => (
            <label
              key={category.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                filterRules.categoryIds?.includes(category.id)
                  ? 'bg-blue-900/30 border-blue-700'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={filterRules.categoryIds?.includes(category.id) || false}
                onChange={() => toggleArrayValue('categoryIds', category.id)}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-gray-900"
              />
              <span className="text-gray-200 text-sm">{category.name}</span>
            </label>
          ))}
        </div>
        {filterOptions.categories.length === 0 && (
          <p className="text-sm text-gray-500 italic">No categories available</p>
        )}
      </div>

      {/* Brands */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Brands
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filterOptions.brands.map((brand) => (
            <label
              key={brand}
              className={`flex items-center gap-2 p-2 rounded border text-sm transition-colors cursor-pointer ${
                filterRules.brands?.includes(brand)
                  ? 'bg-blue-900/30 border-blue-700 text-blue-300'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={filterRules.brands?.includes(brand) || false}
                onChange={() => toggleArrayValue('brands', brand)}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="truncate">{brand}</span>
            </label>
          ))}
        </div>
        {filterOptions.brands.length === 0 && (
          <p className="text-sm text-gray-500 italic">No brands available</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {filterOptions.tags.map((tag) => (
            <label
              key={tag}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors cursor-pointer ${
                filterRules.tags?.includes(tag)
                  ? 'bg-green-900/30 border-green-700 text-green-300'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={filterRules.tags?.includes(tag) || false}
                onChange={() => toggleArrayValue('tags', tag)}
                disabled={disabled}
                className="w-3.5 h-3.5 text-green-600 rounded focus:ring-green-500"
              />
              <span>{tag}</span>
            </label>
          ))}
        </div>
        {filterOptions.tags.length === 0 && (
          <p className="text-sm text-gray-500 italic">No tags available</p>
        )}
      </div>

      {/* Origins */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Origins
        </label>
        <div className="flex flex-wrap gap-3">
          {filterOptions.origins.map((origin) => (
            <label
              key={origin}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                filterRules.origins?.includes(origin)
                  ? 'bg-purple-900/30 border-purple-700 text-purple-300'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={filterRules.origins?.includes(origin) || false}
                onChange={() => toggleArrayValue('origins', origin)}
                disabled={disabled}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium">{origin}</span>
            </label>
          ))}
        </div>
        {filterOptions.origins.length === 0 && (
          <p className="text-sm text-gray-500 italic">No origins available</p>
        )}
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Minimum Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filterRules.minPrice || ''}
              onChange={(e) => handleChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              disabled={disabled}
              placeholder="Min"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Maximum Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filterRules.maxPrice || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              disabled={disabled}
              placeholder="Max"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Stock & Featured */}
      <div className="space-y-3">
        <label className={`flex items-center gap-3 p-3 rounded-lg border bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            type="checkbox"
            checked={filterRules.inStock || false}
            onChange={(e) => handleChange('inStock', e.target.checked || undefined)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">Only show in-stock products</span>
        </label>

        <label className={`flex items-center gap-3 p-3 rounded-lg border bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            type="checkbox"
            checked={filterRules.featured || false}
            onChange={(e) => handleChange('featured', e.target.checked || undefined)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">Only show featured products</span>
        </label>
      </div>

      {/* Filter Summary */}
      <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
        <p className="text-sm text-blue-400">
          <strong>Active Filters:</strong>{' '}
          {[
            filterRules.categoryIds?.length && `${filterRules.categoryIds.length} categories`,
            filterRules.brands?.length && `${filterRules.brands.length} brands`,
            filterRules.tags?.length && `${filterRules.tags.length} tags`,
            filterRules.origins?.length && `${filterRules.origins.length} origins`,
            (filterRules.minPrice || filterRules.maxPrice) && 'price range',
            filterRules.inStock && 'in stock',
            filterRules.featured && 'featured',
          ]
            .filter(Boolean)
            .join(', ') || 'None'}
        </p>
      </div>
    </div>
  );
}
