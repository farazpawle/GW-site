/**
 * ConditionBuilder Component (Shopify-style)
 * Allows building smart collection rules with field/operator/value conditions
 */

'use client';

import { Plus, X } from 'lucide-react';
import type { Condition, ConditionField, ConditionOperator } from '@/lib/validations/collection';

interface ConditionBuilderProps {
  match: 'all' | 'any';
  conditions: Condition[];
  onChange: (match: 'all' | 'any', conditions: Condition[]) => void;
  disabled?: boolean;
}

// Field labels matching Shopify
const fieldLabels: Record<ConditionField, string> = {
  product_title: 'Product title',
  product_type: 'Product type',
  product_vendor: 'Product vendor',
  product_tag: 'Product tag',
  variant_price: 'Product price',
  variant_compare_at_price: 'Compare at price',
  variant_weight: 'Product weight',
  variant_inventory: 'Inventory stock',
};

// Operator labels matching Shopify
const operatorLabels: Record<ConditionOperator, string> = {
  equals: 'is equal to',
  not_equals: 'is not equal to',
  contains: 'contains',
  not_contains: 'does not contain',
  starts_with: 'starts with',
  ends_with: 'ends with',
  greater_than: 'is greater than',
  less_than: 'is less than',
  is_set: 'is set',
  is_not_set: 'is not set',
};

// Which operators are available for each field
const fieldOperators: Record<ConditionField, ConditionOperator[]> = {
  product_title: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with'],
  product_type: ['equals', 'not_equals', 'contains', 'not_contains'],
  product_vendor: ['equals', 'not_equals'],
  product_tag: ['equals', 'not_equals'],
  variant_price: ['equals', 'not_equals', 'greater_than', 'less_than'],
  variant_compare_at_price: ['equals', 'not_equals', 'greater_than', 'less_than', 'is_set', 'is_not_set'],
  variant_weight: ['equals', 'not_equals', 'greater_than', 'less_than'],
  variant_inventory: ['equals', 'not_equals', 'greater_than', 'less_than'],
};

export default function ConditionBuilder({ match, conditions, onChange, disabled = false }: ConditionBuilderProps) {
  const addCondition = () => {
    const newCondition: Condition = {
      field: 'product_tag',
      operator: 'equals',
      value: '',
    };
    onChange(match, [...conditions, newCondition]);
  };

  const removeCondition = (index: number) => {
    const updated = conditions.filter((_, i) => i !== index);
    onChange(match, updated);
  };

  const updateCondition = (index: number, field: keyof Condition, value: string | number) => {
    const updated = conditions.map((condition, i) => {
      if (i === index) {
        const newCondition = { ...condition, [field]: value };
        
        // If field changed, reset operator and value
        if (field === 'field') {
          const availableOps = fieldOperators[value as ConditionField];
          newCondition.operator = availableOps[0];
          newCondition.value = '';
        }
        
        // If operator changed to is_set/is_not_set, clear value
        if (field === 'operator' && typeof value === 'string' && ['is_set', 'is_not_set'].includes(value)) {
          newCondition.value = '';
        }
        
        return newCondition;
      }
      return condition;
    });
    onChange(match, updated);
  };

  const needsValue = (operator: ConditionOperator) => {
    return !['is_set', 'is_not_set'].includes(operator);
  };

  const getInputType = (field: ConditionField) => {
    if (field.includes('price') || field.includes('weight') || field.includes('inventory')) {
      return 'number';
    }
    return 'text';
  };

  return (
    <div className="space-y-4">
      {/* AND/OR Logic Selector */}
      <div className="flex items-center gap-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <span className="text-sm text-gray-300">Products must match:</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={match === 'all'}
            onChange={() => onChange('all', conditions)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm text-gray-200">All conditions</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={match === 'any'}
            onChange={() => onChange('any', conditions)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm text-gray-200">Any condition</span>
        </label>
      </div>

      {/* Conditions List */}
      <div className="space-y-3">
        {conditions.map((condition, index) => (
          <div key={index} className="flex items-start gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Field Dropdown */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Field</label>
                <select
                  value={condition.field}
                  onChange={(e) => updateCondition(index, 'field', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  {Object.entries(fieldLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operator Dropdown */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Condition</label>
                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  {fieldOperators[condition.field].map((op) => (
                    <option key={op} value={op}>
                      {operatorLabels[op]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value Input */}
              {needsValue(condition.operator) && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Value</label>
                  <input
                    type={getInputType(condition.field)}
                    value={condition.value || ''}
                    onChange={(e) => {
                      const val = getInputType(condition.field) === 'number' 
                        ? parseFloat(e.target.value) || '' 
                        : e.target.value;
                      updateCondition(index, 'value', val);
                    }}
                    disabled={disabled}
                    placeholder="Enter value..."
                    step={condition.field.includes('price') ? '0.01' : '1'}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeCondition(index)}
              disabled={disabled || conditions.length === 1}
              className="mt-6 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove condition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Condition Button */}
      <button
        type="button"
        onClick={addCondition}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 border border-blue-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        Add condition
      </button>

      {/* Helper Text */}
      <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
        <p className="text-xs text-blue-300">
          <strong>Smart collections</strong> automatically add products that match your conditions. 
          As you add new products to your store, they&apos;ll be automatically added or removed from this collection based on these rules.
        </p>
      </div>
    </div>
  );
}
