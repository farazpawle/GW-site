'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useDebounce } from 'use-debounce';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Suggestion {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    partNumber: string;
    price: number;
    images: string[];
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface SearchBarProps {
  onClose?: () => void;
  className?: string;
}

const RECENT_SEARCHES_KEY = 'garrit_wulf_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export default function SearchBar({ onClose, className = '' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Debounce search query for autocomplete
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);
  
  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions(null);
    }
  }, [debouncedQuery]);
  
  const fetchSuggestions = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    
    // Remove duplicates and add to front
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };
  
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      if (onClose) onClose();
    }
  };
  
  const handleSearchClick = (query: string) => {
    saveRecentSearch(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
    if (onClose) onClose();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    
    const totalItems = (suggestions?.products.length || 0) + (suggestions?.categories.length || 0);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && suggestions) {
          e.preventDefault();
          const products = suggestions.products || [];
          const categories = suggestions.categories || [];
          
          if (selectedIndex < products.length) {
            const product = products[selectedIndex];
            router.push(`/products/${product.slug}`);
          } else {
            const category = categories[selectedIndex - products.length];
            router.push(`/search?categoryId=${category.id}`);
          }
          setShowSuggestions(false);
          if (onClose) onClose();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };
  
  const handleFocus = () => {
    if (searchQuery.trim() === '' && recentSearches.length > 0) {
      setShowSuggestions(true);
    } else if (suggestions) {
      setShowSuggestions(true);
    }
  };
  
  const handleBlur = () => {
    // Delay to allow click events on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };
  
  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-4">
          <Search className="w-6 h-6 text-[#6e0000]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search for auto parts..."
            className="flex-1 text-lg outline-none bg-transparent"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSuggestions(null);
                inputRef.current?.focus();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[500px] overflow-y-auto z-50">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-[#6e0000] border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {/* Recent Searches */}
          {!searchQuery && recentSearches.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </h3>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs text-[#6e0000] hover:underline"
                >
                  Clear All
                </button>
              </div>
              <ul>
                {recentSearches.map((query, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => handleSearchClick(query)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2 text-gray-700"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      {query}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Product Suggestions */}
          {suggestions && suggestions.products.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Products
              </h3>
              <ul>
                {suggestions.products.map((product, index) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.slug}`}
                      className={`flex items-center gap-3 p-3 rounded hover:bg-gray-50 transition-colors ${
                        selectedIndex === index ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => {
                        setShowSuggestions(false);
                        if (onClose) onClose();
                      }}
                    >
                      <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded">
                        <Image
                          src={product.images?.[0] || '/images/placeholder-product.svg'}
                          alt={product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">Part #: {product.partNumber}</p>
                      </div>
                      <span className="text-sm font-bold text-[#6e0000]">${product.price.toFixed(2)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Category Suggestions */}
          {suggestions && suggestions.categories.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
              <ul>
                {suggestions.categories.map((category, index) => {
                  const itemIndex = (suggestions.products.length || 0) + index;
                  return (
                    <li key={category.id}>
                      <Link
                        href={`/search?categoryId=${category.id}`}
                        className={`block px-3 py-2 rounded hover:bg-gray-50 transition-colors ${
                          selectedIndex === itemIndex ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => {
                          setShowSuggestions(false);
                          if (onClose) onClose();
                        }}
                      >
                        <p className="text-sm text-gray-700">{category.name}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          {/* No Results */}
          {suggestions && suggestions.products.length === 0 && suggestions.categories.length === 0 && searchQuery && (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-2">No suggestions found</p>
              <button
                type="button"
                onClick={() => handleSearchClick(searchQuery)}
                className="text-[#6e0000] hover:underline text-sm"
              >
                Search for &quot;{searchQuery}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
