'use client';

import { useState, useEffect } from 'react';

export interface FilterRules {
  categoryIds?: string[];
  brands?: string[];
  tags?: string[];
  origins?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface FilterRuleBuilderProps {
  filterRules: FilterRules;
  onChange: (rules: FilterRules) => void;
}

export default function FilterRuleBuilder({ filterRules, onChange }: FilterRuleBuilderProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => setCategories(data.categories || []))
      .catch(() => alert('Failed to load categories'));
  }, []);

  const updateRule = (key: keyof FilterRules, value: string[] | number | boolean | undefined) => {
    onChange({ ...filterRules, [key]: value });
  };

  const toggleArrayItem = (key: 'categoryIds' | 'brands' | 'tags' | 'origins', value: string) => {
    const current = filterRules[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateRule(key, updated.length > 0 ? updated : undefined);
  };

  return (
    <div className="space-y-6">
      <h4 className="font-medium text-gray-100">Filter Rules</h4>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Categories</label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(category => (
            <label key={category.id} className="flex items-center gap-2 p-2 border border-gray-700 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={filterRules.categoryIds?.includes(category.id) || false}
                onChange={() => toggleArrayItem('categoryIds', category.id)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-100">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
          <input
            type="number"
            value={filterRules.minPrice || ''}
            onChange={(e) => updateRule('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
          <input
            type="number"
            value={filterRules.maxPrice || ''}
            onChange={(e) => updateRule('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="9999.00"
            step="0.01"
          />
        </div>
      </div>

      {/* Boolean Filters */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={filterRules.inStock || false}
            onChange={(e) => updateRule('inStock', e.target.checked || undefined)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-100">In Stock Only</span>
        </label>

        <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={filterRules.featured || false}
            onChange={(e) => updateRule('featured', e.target.checked || undefined)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-100">Featured Only</span>
        </label>
      </div>

      {/* Active Filters Summary */}
      <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="text-sm font-medium text-gray-100 mb-2">Active Filters:</div>
        <div className="text-sm text-gray-300 space-y-1">
          {filterRules.categoryIds && filterRules.categoryIds.length > 0 && (
            <div>• {filterRules.categoryIds.length} categor{filterRules.categoryIds.length === 1 ? 'y' : 'ies'}</div>
          )}
          {filterRules.minPrice !== undefined && <div>• Min Price: ${filterRules.minPrice}</div>}
          {filterRules.maxPrice !== undefined && <div>• Max Price: ${filterRules.maxPrice}</div>}
          {filterRules.inStock && <div>• In Stock Only</div>}
          {filterRules.featured && <div>• Featured Only</div>}
          {!filterRules.categoryIds?.length && 
           filterRules.minPrice === undefined && 
           filterRules.maxPrice === undefined && 
           !filterRules.inStock && 
           !filterRules.featured && (
            <div className="text-gray-500">No filters selected</div>
          )}
        </div>
      </div>
    </div>
  );
}
