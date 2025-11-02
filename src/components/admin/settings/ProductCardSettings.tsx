/**
 * Product Card Display Settings Component
 * 
 * Allows admins to control which fields are visible on product cards
 * throughout the entire site. All changes are stored in site settings
 * and applied globally.
 */

'use client';

import { Eye, EyeOff } from 'lucide-react';

interface ProductCardSettingsProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

interface FieldConfig {
  key: string;
  label: string;
  description: string;
  category: 'Basic Info' | 'Pricing' | 'Inventory' | 'Additional' | 'Product Detail Page';
}

const FIELD_CONFIGS: FieldConfig[] = [
  // Basic Info
  {
    key: 'product_card_showPartNumber',
    label: 'Part Number',
    description: 'Display product part number (e.g., #BP-001)',
    category: 'Basic Info',
  },
  {
    key: 'product_card_showSku',
    label: 'SKU',
    description: 'Display product SKU code',
    category: 'Basic Info',
  },
  {
    key: 'product_card_showBrand',
    label: 'Brand',
    description: 'Display product brand name',
    category: 'Basic Info',
  },
  {
    key: 'product_card_showOrigin',
    label: 'Country of Origin',
    description: 'Display where the product is from',
    category: 'Basic Info',
  },
  {
    key: 'product_card_showCategory',
    label: 'Category',
    description: 'Display product category',
    category: 'Basic Info',
  },
  {
    key: 'product_card_showDescription',
    label: 'Description',
    description: 'Display short product description (2 lines)',
    category: 'Basic Info',
  },
  {
    key: 'product_card_showTags',
    label: 'Tags',
    description: 'Display product tags/labels',
    category: 'Basic Info',
  },
  // Pricing
  {
    key: 'product_card_showPrice',
    label: 'Price',
    description: 'Display product price (when in ecommerce mode)',
    category: 'Pricing',
  },
  {
    key: 'product_card_showComparePrice',
    label: 'Compare Price',
    description: 'Display compare-at price (strikethrough)',
    category: 'Pricing',
  },
  {
    key: 'product_card_showDiscountBadge',
    label: 'Discount Badge',
    description: 'Display percentage discount badge',
    category: 'Pricing',
  },
  // Inventory
  {
    key: 'product_card_showStockStatus',
    label: 'Stock Status',
    description: 'Display "In Stock" / "Out of Stock" badge',
    category: 'Inventory',
  },
  // Product Detail Page
  {
    key: 'product_detail_showCertifications',
    label: 'Certifications',
    description: 'Display product certifications and standards',
    category: 'Product Detail Page',
  },
  {
    key: 'product_detail_showWarranty',
    label: 'Warranty Information',
    description: 'Display warranty details and coverage',
    category: 'Product Detail Page',
  },
  {
    key: 'product_detail_showApplication',
    label: 'Applications',
    description: 'Display product application areas',
    category: 'Product Detail Page',
  },
  {
    key: 'product_detail_showCompatibility',
    label: 'Compatibility',
    description: 'Display vehicle/equipment compatibility',
    category: 'Product Detail Page',
  },
];

export default function ProductCardSettings({ formData, onChange }: ProductCardSettingsProps) {
  const getFieldValue = (key: string): boolean => {
    const value = formData[key];
    if (value === undefined || value === '') return true; // Default to true
    return value === 'true';
  };

  const toggleField = (key: string) => {
    const currentValue = getFieldValue(key);
    onChange(key, String(!currentValue));
  };

  const groupedFields = FIELD_CONFIGS.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, FieldConfig[]>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl shadow-lg">
              🎴
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Product Card Display Settings
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Control which fields appear on product cards throughout your site. These settings apply globally to all product listings, search results, and dynamic pages.
            </p>
          </div>
        </div>
      </div>

      {/* Settings by Category */}
      {Object.entries(groupedFields).map(([category, fields]) => (
        <div key={category} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {/* Category Header */}
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {category === 'Basic Info' && '📋'}
                {category === 'Pricing' && '💰'}
                {category === 'Inventory' && '📦'}
                {category === 'Additional' && '✨'}
                {category === 'Product Detail Page' && '📄'}
                {category}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {fields.length} {fields.length === 1 ? 'field' : 'fields'}
              </span>
            </div>
          </div>

          {/* Fields */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {fields.map((field) => {
              const isEnabled = getFieldValue(field.key);
              
              return (
                <div
                  key={field.key}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <label
                          htmlFor={field.key}
                          className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                        >
                          {field.label}
                        </label>
                        {isEnabled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase tracking-wide">
                            ● Visible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 uppercase tracking-wide">
                            ○ Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {field.description}
                      </p>
                    </div>

                    {/* iOS-Style Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => toggleField(field.key)}
                      className={`
                        group relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer items-center
                        rounded-full transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
                        ${isEnabled 
                          ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500' 
                          : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 focus:ring-gray-400'
                        }
                      `}
                      role="switch"
                      aria-checked={isEnabled}
                      aria-labelledby={field.key}
                    >
                      <span className="sr-only">Toggle {field.label}</span>
                      
                      {/* Toggle Circle/Knob */}
                      <span
                        className={`
                          inline-block h-5 w-5 transform rounded-full bg-white shadow-lg
                          transition-transform duration-200 ease-in-out
                          ring-0 group-active:w-6
                          ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              Important
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
              Changes apply within <strong>5 seconds</strong> of saving. For immediate updates, <strong>hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)</strong> on any product pages. The cache system ensures optimal performance while keeping settings responsive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
