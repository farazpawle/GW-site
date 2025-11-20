'use client';

import { useState, useEffect } from 'react';
import { X, Download, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalProducts: number;
  currentFilters?: {
    search?: string;
    categoryId?: string;
    stockFilter?: string;
  };
}

type ExportMode = 'all' | 'filtered' | 'published' | 'draft' | 'featured';
type DataType = 'products' | 'cross-reference' | 'oem-numbers' | 'vehicle-compatibility';

export default function ExportModal({ 
  isOpen, 
  onClose, 
  totalProducts,
  currentFilters 
}: ExportModalProps) {
  const [dataType, setDataType] = useState<DataType>('products');
  const [exportMode, setExportMode] = useState<ExportMode>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDataType('products');
      setExportMode('all');
      setError(null);
    }
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen) return null;

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Determine API endpoint based on data type
      let apiEndpoint = '/api/admin/products/export';
      const params = new URLSearchParams();

      if (dataType === 'products') {
        // Build query parameters based on export mode for products
        if (exportMode === 'all') {
          params.set('filter', 'all');
        } else if (exportMode === 'filtered' && currentFilters) {
          // Use current page filters
          params.set('filter', 'all');
          if (currentFilters.search) {
            params.set('search', currentFilters.search);
          }
          if (currentFilters.categoryId) {
            params.set('categoryId', currentFilters.categoryId);
          }
          if (currentFilters.stockFilter === 'in-stock') {
            params.set('inStock', 'true');
          } else if (currentFilters.stockFilter === 'out-of-stock') {
            params.set('inStock', 'false');
          }
        } else {
          // Use predefined filters
          params.set('filter', exportMode);
        }
      } else {
        // For other data types, use specific endpoints
        apiEndpoint = `/api/admin/products/export/${dataType}`;
        // Other data types don't support filtering
      }

      // Call export API
      const response = await fetch(`${apiEndpoint}?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export products');
      }

      // Get the CSV content
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `products-${exportMode}-${timestamp}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Close modal on success
      onClose();
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Failed to export products');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine product count for selected mode
  const getProductCount = () => {
    if (exportMode === 'filtered') {
      return totalProducts; // Current filtered count
    }
    // For other modes, we don't know the exact count
    return '?';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6e0000]/10 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-[#6e0000]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Export Data</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Download product data as CSV file
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Data Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Select data type to export
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDataType('products')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  dataType === 'products'
                    ? 'bg-[#6e0000] border-[#6e0000] text-white'
                    : 'bg-[#0a0a0a] border-[#2a2a2a] text-gray-400 hover:border-[#6e0000]'
                }`}
              >
                Product Info
              </button>
              <button
                onClick={() => setDataType('cross-reference')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  dataType === 'cross-reference'
                    ? 'bg-[#6e0000] border-[#6e0000] text-white'
                    : 'bg-[#0a0a0a] border-[#2a2a2a] text-gray-400 hover:border-[#6e0000]'
                }`}
              >
                Cross Reference
              </button>
              <button
                onClick={() => setDataType('oem-numbers')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  dataType === 'oem-numbers'
                    ? 'bg-[#6e0000] border-[#6e0000] text-white'
                    : 'bg-[#0a0a0a] border-[#2a2a2a] text-gray-400 hover:border-[#6e0000]'
                }`}
              >
                OEM Numbers
              </button>
              <button
                onClick={() => setDataType('vehicle-compatibility')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  dataType === 'vehicle-compatibility'
                    ? 'bg-[#6e0000] border-[#6e0000] text-white'
                    : 'bg-[#0a0a0a] border-[#2a2a2a] text-gray-400 hover:border-[#6e0000]'
                }`}
              >
                Vehicle Compatibility
              </button>
            </div>
          </div>

          {/* Export Mode Selection (Only for Product Info) */}
          {dataType === 'products' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Select products to export
              </label>

            <div className="space-y-2">
              {/* All Products */}
              <label className="flex items-center gap-3 p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#6e0000] transition-colors">
                <input
                  type="radio"
                  name="exportMode"
                  value="all"
                  checked={exportMode === 'all'}
                  onChange={(e) => setExportMode(e.target.value as ExportMode)}
                  className="w-4 h-4 text-[#6e0000] focus:ring-[#6e0000]"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">All Products</div>
                  <div className="text-sm text-gray-400">Export entire product catalog</div>
                </div>
              </label>

              {/* Filtered Products */}
              {currentFilters && (currentFilters.search || currentFilters.categoryId || currentFilters.stockFilter !== 'all') && (
                <label className="flex items-center gap-3 p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#6e0000] transition-colors">
                  <input
                    type="radio"
                    name="exportMode"
                    value="filtered"
                    checked={exportMode === 'filtered'}
                    onChange={(e) => setExportMode(e.target.value as ExportMode)}
                    className="w-4 h-4 text-[#6e0000] focus:ring-[#6e0000]"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium">Filtered Products</div>
                    <div className="text-sm text-gray-400">
                      Export {totalProducts} product{totalProducts !== 1 ? 's' : ''} matching current filters
                    </div>
                  </div>
                </label>
              )}

              {/* Published Products */}
              <label className="flex items-center gap-3 p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#6e0000] transition-colors">
                <input
                  type="radio"
                  name="exportMode"
                  value="published"
                  checked={exportMode === 'published'}
                  onChange={(e) => setExportMode(e.target.value as ExportMode)}
                  className="w-4 h-4 text-[#6e0000] focus:ring-[#6e0000]"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">Published Products</div>
                  <div className="text-sm text-gray-400">Export only published products</div>
                </div>
              </label>

              {/* Draft Products */}
              <label className="flex items-center gap-3 p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#6e0000] transition-colors">
                <input
                  type="radio"
                  name="exportMode"
                  value="draft"
                  checked={exportMode === 'draft'}
                  onChange={(e) => setExportMode(e.target.value as ExportMode)}
                  className="w-4 h-4 text-[#6e0000] focus:ring-[#6e0000]"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">Draft Products</div>
                  <div className="text-sm text-gray-400">Export only unpublished drafts</div>
                </div>
              </label>

              {/* Featured Products */}
              <label className="flex items-center gap-3 p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#6e0000] transition-colors">
                <input
                  type="radio"
                  name="exportMode"
                  value="featured"
                  checked={exportMode === 'featured'}
                  onChange={(e) => setExportMode(e.target.value as ExportMode)}
                  className="w-4 h-4 text-[#6e0000] focus:ring-[#6e0000]"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">Featured Products</div>
                  <div className="text-sm text-gray-400">Export only featured products</div>
                </div>
              </label>
            </div>

            {/* Product Count Info */}
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Products to export:</span>
                <span className="text-lg font-bold text-white">{getProductCount()}</span>
              </div>
            </div>
          </div>
          )}

          {/* Info for other data types */}
          {dataType !== 'products' && (
            <div className="bg-blue-900/20 border border-blue-800 text-blue-400 px-4 py-3 rounded-lg text-sm">
              {dataType === 'cross-reference' && 'Export all cross references for all products'}
              {dataType === 'oem-numbers' && 'Export all OEM part numbers for all products'}
              {dataType === 'vehicle-compatibility' && 'Export all vehicle compatibility data for all products'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2a2a2a] bg-[#0a0a0a]">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#6e0000] text-white rounded-lg hover:bg-[#8a0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
