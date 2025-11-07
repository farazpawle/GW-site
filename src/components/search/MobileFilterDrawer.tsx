'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import SearchFilters from './SearchFilters';

export default function MobileFilterDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-6 py-3 bg-[#6e0000] text-white rounded-full shadow-2xl hover:bg-[#8b0000] transition-all duration-300 font-medium"
        aria-label="Open filters"
      >
        <Filter className="w-5 h-5" />
        Filters
      </button>
      
      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-50 animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Drawer */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[85vh] overflow-y-auto ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drawer Handle */}
        <div className="sticky top-0 bg-white pt-2 pb-4 px-6 border-b border-gray-200">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Filter Content */}
        <div className="px-2">
          <SearchFilters />
        </div>
      </div>
    </>
  );
}
