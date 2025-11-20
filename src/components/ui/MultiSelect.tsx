'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * MultiSelect Component
 * 
 * A reusable dropdown component for selecting multiple options with checkboxes.
 * Features:
 * - Dropdown with checkbox list
 * - Selected count indicator
 * - Clear all button
 * - Click outside to close
 * - Styled with Tailwind maroon theme
 */
export function MultiSelect({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select options...',
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 
          border border-gray-300 rounded-md bg-white 
          text-left text-sm
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-maroon'}
          ${isOpen ? 'border-maroon ring-1 ring-maroon' : ''}
          transition-colors
        `}
      >
        <span className={value.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
          {value.length === 0
            ? placeholder
            : `${value.length} selected`}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Header with Clear All */}
          {value.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
              <span className="text-xs text-gray-600 font-medium">
                {value.length} selected
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-maroon hover:text-maroon/80 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-52">
            {options.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const isSelected = value.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleOption(option)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 text-sm
                      transition-colors
                      ${isSelected ? 'bg-maroon/5' : 'hover:bg-gray-50'}
                    `}
                  >
                    {/* Custom Checkbox */}
                    <div
                      className={`
                        w-4 h-4 rounded border flex items-center justify-center
                        ${
                          isSelected
                            ? 'bg-maroon border-maroon'
                            : 'border-gray-300'
                        }
                      `}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    {/* Option Label */}
                    <span className={isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}>
                      {option}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
