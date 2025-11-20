'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Car, Search, X as XIcon } from 'lucide-react';
import { FormModal, DeleteConfirmModal } from '../shared';

// Type definitions
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

// Form validation schema with year range validation
const vehicleCompatibilitySchema = z.object({
  make: z.string().min(1, 'Make is required').max(50),
  model: z.string().min(1, 'Model is required').max(50),
  yearStart: z.number().int().min(1900).max(2100),
  yearEnd: z.number().int().min(1900).max(2100),
  engine: z.string().max(100).optional(),
  trim: z.string().max(50).optional(),
  position: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
}).refine((data) => data.yearEnd >= data.yearStart, {
  message: 'End year must be greater than or equal to start year',
  path: ['yearEnd'],
});

type VehicleCompatibilityFormData = z.infer<typeof vehicleCompatibilitySchema>;

interface VehicleCompatibilityManagerProps {
  partId: string;
}

/**
 * Admin component for managing vehicle compatibility
 * Features:
 * - CRUD operations for vehicle fitment data
 * - Year range validation (yearEnd >= yearStart)
 * - Filter by make and model
 * - Real-time updates with optimistic UI
 */
export default function VehicleCompatibilityManager({ partId }: VehicleCompatibilityManagerProps) {
  const [vehicleCompatibility, setVehicleCompatibility] = useState<VehicleCompatibility[]>([]);
  const [filteredData, setFilteredData] = useState<VehicleCompatibility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Filter states
  const [makeFilter, setMakeFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompatibility, setSelectedCompatibility] = useState<VehicleCompatibility | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<VehicleCompatibilityFormData>({
    resolver: zodResolver(vehicleCompatibilitySchema),
  });

  // Fetch vehicle compatibility on mount
  useEffect(() => {
    fetchVehicleCompatibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partId]);

  // Apply filters whenever data or filters change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleCompatibility, makeFilter, modelFilter]);

  const fetchVehicleCompatibility = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/parts/${partId}/vehicle-compatibility`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch vehicle compatibility');
      }

      setVehicleCompatibility(result.data || []);
    } catch (err) {
      console.error('Error fetching vehicle compatibility:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicle compatibility');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...vehicleCompatibility];

    if (makeFilter) {
      filtered = filtered.filter((item) =>
        item.make.toLowerCase().includes(makeFilter.toLowerCase())
      );
    }

    if (modelFilter) {
      filtered = filtered.filter((item) =>
        item.model.toLowerCase().includes(modelFilter.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setMakeFilter('');
    setModelFilter('');
  };

  // Show success message temporarily
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle add
  const handleAdd = () => {
    reset({
      make: '',
      model: '',
      yearStart: new Date().getFullYear(),
      yearEnd: new Date().getFullYear(),
      engine: '',
      trim: '',
      position: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  // Handle edit
  const handleEdit = (compatibility: VehicleCompatibility) => {
    setSelectedCompatibility(compatibility);
    setValue('make', compatibility.make);
    setValue('model', compatibility.model);
    setValue('yearStart', compatibility.yearStart);
    setValue('yearEnd', compatibility.yearEnd);
    setValue('engine', compatibility.engine || '');
    setValue('trim', compatibility.trim || '');
    setValue('position', compatibility.position || '');
    setValue('notes', compatibility.notes || '');
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = (compatibility: VehicleCompatibility) => {
    setSelectedCompatibility(compatibility);
    setIsDeleteModalOpen(true);
  };

  // Submit add form
  const onSubmitAdd = async (data: VehicleCompatibilityFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/parts/${partId}/vehicle-compatibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create vehicle compatibility');
      }

      // Add to list
      setVehicleCompatibility((prev) => [...prev, result.data]);
      showSuccess('Vehicle compatibility added successfully');
      setIsAddModalOpen(false);
      reset();
    } catch (err) {
      console.error('Error creating vehicle compatibility:', err);
      setError(err instanceof Error ? err.message : 'Failed to create vehicle compatibility');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit edit form
  const onSubmitEdit = async (data: VehicleCompatibilityFormData) => {
    if (!selectedCompatibility) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/parts/${partId}/vehicle-compatibility/${selectedCompatibility.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update vehicle compatibility');
      }

      // Update list
      setVehicleCompatibility((prev) =>
        prev.map((compat) => (compat.id === selectedCompatibility.id ? result.data : compat))
      );
      showSuccess('Vehicle compatibility updated successfully');
      setIsEditModalOpen(false);
      setSelectedCompatibility(null);
    } catch (err) {
      console.error('Error updating vehicle compatibility:', err);
      setError(err instanceof Error ? err.message : 'Failed to update vehicle compatibility');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedCompatibility) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/parts/${partId}/vehicle-compatibility/${selectedCompatibility.id}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete vehicle compatibility');
      }

      // Remove from list
      setVehicleCompatibility((prev) =>
        prev.filter((compat) => compat.id !== selectedCompatibility.id)
      );
      showSuccess('Vehicle compatibility deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedCompatibility(null);
    } catch (err) {
      console.error('Error deleting vehicle compatibility:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle compatibility');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Vehicle Compatibility</h3>
          <p className="text-sm text-gray-400 mt-1">
            Manage vehicle fitment information for this part
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-red transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      {!isLoading && vehicleCompatibility.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by make..."
                value={makeFilter}
                onChange={(e) => setMakeFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by model..."
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              />
            </div>
            {(makeFilter || modelFilter) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] text-gray-400 hover:text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <XIcon className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
          {(makeFilter || modelFilter) && (
            <p className="text-sm text-gray-400 mt-2">
              Showing {filteredData.length} of {vehicleCompatibility.length} vehicles
            </p>
          )}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-900/30 border border-green-800 rounded-lg">
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-brand-maroon animate-spin" />
          <span className="ml-3 text-gray-400">Loading vehicle compatibility...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && vehicleCompatibility.length === 0 && (
        <div className="text-center py-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
          <Car className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No vehicle compatibility data found. Add one to get started.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && vehicleCompatibility.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-[#2a2a2a]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Make
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Model
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Year Range
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Engine
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Trim
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Position
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {(filteredData.length > 0 ? filteredData : vehicleCompatibility).map((compatibility) => (
                  <tr key={compatibility.id} className="hover:bg-[#0a0a0a] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-brand-maroon" />
                        <span className="text-white font-medium">{compatibility.make}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{compatibility.model}</td>
                    <td className="px-6 py-4 text-white">
                      {compatibility.yearStart} - {compatibility.yearEnd}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{compatibility.engine || '-'}</td>
                    <td className="px-6 py-4 text-gray-400">{compatibility.trim || '-'}</td>
                    <td className="px-6 py-4 text-gray-400">{compatibility.position || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(compatibility)}
                          className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(compatibility)}
                          className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <FormModal
        isOpen={isAddModalOpen}
        title="Add Vehicle Compatibility"
        onClose={() => setIsAddModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
          {/* Make & Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Make <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register('make')}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
                placeholder="e.g., BMW"
              />
              {errors.make && (
                <p className="text-red-400 text-sm mt-1">{errors.make.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register('model')}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
                placeholder="e.g., 3 Series"
              />
              {errors.model && (
                <p className="text-red-400 text-sm mt-1">{errors.model.message}</p>
              )}
            </div>
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Year <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                {...register('yearStart', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
                placeholder="e.g., 2015"
              />
              {errors.yearStart && (
                <p className="text-red-400 text-sm mt-1">{errors.yearStart.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Year <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                {...register('yearEnd', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
                placeholder="e.g., 2020"
              />
              {errors.yearEnd && (
                <p className="text-red-400 text-sm mt-1">{errors.yearEnd.message}</p>
              )}
            </div>
          </div>

          {/* Engine, Trim, Position */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Engine (Optional)
              </label>
              <input
                type="text"
                {...register('engine')}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
                placeholder="e.g., 2.0L Turbo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trim (Optional)
              </label>
              <input
                type="text"
                {...register('trim')}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
                placeholder="e.g., Sport"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Position (Optional)
              </label>
              <input
                type="text"
                {...register('position')}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
                placeholder="e.g., Front"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon resize-none"
              placeholder="Additional information..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-brand-maroon text-white rounded-lg hover:bg-brand-red transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        title="Edit Vehicle Compatibility"
        onClose={() => setIsEditModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
          {/* Same form fields as Add */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Make <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register('make')}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              />
              {errors.make && (
                <p className="text-red-400 text-sm mt-1">{errors.make.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register('model')}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              />
              {errors.model && (
                <p className="text-red-400 text-sm mt-1">{errors.model.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Year <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                {...register('yearStart', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              />
              {errors.yearStart && (
                <p className="text-red-400 text-sm mt-1">{errors.yearStart.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Year <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                {...register('yearEnd', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              />
              {errors.yearEnd && (
                <p className="text-red-400 text-sm mt-1">{errors.yearEnd.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Engine (Optional)
              </label>
              <input
                type="text"
                {...register('engine')}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trim (Optional)
              </label>
              <input
                type="text"
                {...register('trim')}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Position (Optional)
              </label>
              <input
                type="text"
                {...register('position')}
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-brand-maroon text-white rounded-lg hover:bg-brand-red transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Updating...' : 'Update Vehicle'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Vehicle Compatibility"
        message={`Are you sure you want to delete the compatibility for "${selectedCompatibility?.make} ${selectedCompatibility?.model} (${selectedCompatibility?.yearStart}-${selectedCompatibility?.yearEnd})"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedCompatibility(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}
