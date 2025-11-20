'use client';

import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * TagInput Component
 * 
 * A reusable input component for managing tags (string arrays).
 * Features:
 * - Add/remove tags with visual badges
 * - Suggestions dropdown (optional)
 * - Custom tag entry support
 * - Keyboard navigation (Enter to add, Backspace to remove)
 * - Styled with Tailwind maroon theme
 */
export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Add tag...',
  label,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions based on input and exclude already selected tags
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      removeTag(value[value.length - 1]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(e.target.value.length > 0 && filteredSuggestions.length > 0);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Tags Container */}
        <div className="min-h-[48px] p-2 border border-[#2a2a2a] rounded-lg bg-[#0a0a0a] focus-within:border-brand-maroon focus-within:ring-1 focus-within:ring-brand-maroon transition-colors">
          <div className="flex flex-wrap gap-2">
            {/* Display existing tags */}
            {value.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-brand-maroon/20 text-brand-maroon rounded-md text-sm font-medium"
              >
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-brand-maroon/30 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}

            {/* Input for new tags */}
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0 && filteredSuggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={value.length === 0 ? placeholder : ''}
              disabled={disabled}
              className="flex-1 min-w-[120px] outline-none bg-transparent text-white text-sm disabled:cursor-not-allowed placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-brand-maroon/10 text-white text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="mt-1 text-xs text-gray-400">
        Press Enter to add a tag or select from suggestions
      </p>
    </div>
  );
}
