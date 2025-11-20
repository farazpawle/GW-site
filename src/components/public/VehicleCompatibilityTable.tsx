'use client';

import { useState, useMemo } from 'react';

interface VehicleCompatibility {
  id: string;
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  engine?: string | null;
  trim?: string | null;
  position?: string | null;
  notes?: string | null;
}

interface VehicleCompatibilityTableProps {
  vehicleCompatibility: VehicleCompatibility[];
}

const ITEMS_PER_PAGE = 10;

/**
 * Public display component for vehicle compatibility
 * Features:
 * - Filterable by make and model
 * - Pagination for large datasets
 * - Empty state handling
 * - Responsive (horizontal scroll on mobile)
 * - Client-side processing
 */
export default function VehicleCompatibilityTable({ vehicleCompatibility }: VehicleCompatibilityTableProps) {
  const [makeFilter, setMakeFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique makes and models for filters
  const makes = useMemo(() => {
    const uniqueMakes = Array.from(new Set(vehicleCompatibility.map((v) => v.make))).sort();
    return uniqueMakes;
  }, [vehicleCompatibility]);

  const models = useMemo(() => {
    if (!makeFilter) return [];
    const filtered = vehicleCompatibility.filter((v) => v.make === makeFilter);
    const uniqueModels = Array.from(new Set(filtered.map((v) => v.model))).sort();
    return uniqueModels;
  }, [vehicleCompatibility, makeFilter]);

  // Apply filters
  const filteredData = useMemo(() => {
    let filtered = vehicleCompatibility;

    if (makeFilter) {
      filtered = filtered.filter((v) => v.make === makeFilter);
    }

    if (modelFilter) {
      filtered = filtered.filter((v) => v.model === modelFilter);
    }

    return filtered;
  }, [vehicleCompatibility, makeFilter, modelFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // Reset pagination when filters change
  const handleMakeChange = (value: string) => {
    setMakeFilter(value);
    setModelFilter('');
    setCurrentPage(1);
  };

  const handleModelChange = (value: string) => {
    setModelFilter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setMakeFilter('');
    setModelFilter('');
    setCurrentPage(1);
  };

  // Empty state
  if (vehicleCompatibility.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="text-gray-400 text-4xl mb-4">🚗</div>
        <p className="text-gray-600">No vehicle compatibility information available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Compatibility</h2>
        <p className="text-gray-600">Compatible vehicles for this part</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Make Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-700 mb-2 font-medium">Filter by Make</label>
            <select
              value={makeFilter}
              onChange={(e) => handleMakeChange(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
            >
              <option value="">All Makes</option>
              {makes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>

          {/* Model Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-700 mb-2 font-medium">Filter by Model</label>
            <select
              value={modelFilter}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={!makeFilter}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Models</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          {(makeFilter || modelFilter) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors self-end"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        {(makeFilter || modelFilter) && (
          <p className="text-sm text-gray-600 mt-3">
            Showing {filteredData.length} of {vehicleCompatibility.length} vehicles
          </p>
        )}
      </div>

      {/* Table */}
      {filteredData.length > 0 ? (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Make
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Model
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Year Range
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Engine
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Trim
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-brand-maroon">🚗</span>
                          <span className="text-gray-900 font-medium">{vehicle.make}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{vehicle.model}</td>
                      <td className="px-6 py-4 text-gray-900">
                        <span className="bg-gray-100 px-3 py-1 rounded border border-gray-200 font-medium">
                          {vehicle.yearStart} - {vehicle.yearEnd}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{vehicle.engine || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{vehicle.trim || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{vehicle.position || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer with total count and pagination */}
            <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 font-medium">
                  Total: {filteredData.length} compatible {filteredData.length === 1 ? 'vehicle' : 'vehicles'}
                </p>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-gray-600">No vehicles match your filter criteria.</p>
          <button
            onClick={resetFilters}
            className="mt-4 px-6 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-red transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
