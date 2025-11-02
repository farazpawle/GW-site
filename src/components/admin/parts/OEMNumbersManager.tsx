'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Tag } from 'lucide-react';
import { FormModal, DeleteConfirmModal } from '../shared';

// Type definitions
interface OEMPartNumber {
  id: string;
  manufacturer: string;
  oemPartNumber: string;
  notes?: string | null;
}

// Form validation schema
const oemPartNumberSchema = z.object({
  manufacturer: z.string().min(1, 'Manufacturer is required').max(100),
  oemPartNumber: z.string().min(1, 'OEM part number is required').max(50),
  notes: z.string().max(500).optional(),
});

type OEMPartNumberFormData = z.infer<typeof oemPartNumberSchema>;

interface OEMNumbersManagerProps {
  partId: string;
}

/**
 * Admin component for managing OEM part numbers
 * Features:
 * - CRUD operations for OEM numbers
 * - Unique constraint validation (manufacturer + oemPartNumber)
 * - Real-time updates with optimistic UI
 * - Alphabetical sorting by manufacturer
 */
export default function OEMNumbersManager({ partId }: OEMNumbersManagerProps) {
  const [oemNumbers, setOemNumbers] = useState<OEMPartNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOEMNumber, setSelectedOEMNumber] = useState<OEMPartNumber | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<OEMPartNumberFormData>({
    resolver: zodResolver(oemPartNumberSchema),
  });

  // Fetch OEM numbers on mount
  useEffect(() => {
    fetchOEMNumbers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partId]);

  const fetchOEMNumbers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/parts/${partId}/oem-numbers`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch OEM numbers');
      }

      // Sort by manufacturer alphabetically
      const sorted = (result.data || []).sort((a: OEMPartNumber, b: OEMPartNumber) =>
        a.manufacturer.localeCompare(b.manufacturer)
      );
      setOemNumbers(sorted);
    } catch (err) {
      console.error('Error fetching OEM numbers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch OEM numbers');
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message temporarily
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle add
  const handleAdd = () => {
    reset({
      manufacturer: '',
      oemPartNumber: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  // Handle edit
  const handleEdit = (oemNumber: OEMPartNumber) => {
    setSelectedOEMNumber(oemNumber);
    setValue('manufacturer', oemNumber.manufacturer);
    setValue('oemPartNumber', oemNumber.oemPartNumber);
    setValue('notes', oemNumber.notes || '');
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = (oemNumber: OEMPartNumber) => {
    setSelectedOEMNumber(oemNumber);
    setIsDeleteModalOpen(true);
  };

  // Submit add form
  const onSubmitAdd = async (data: OEMPartNumberFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/parts/${partId}/oem-numbers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Check for unique constraint violation
        if (result.error && result.error.includes('unique')) {
          throw new Error(`This manufacturer and OEM part number combination already exists for this part.`);
        }
        throw new Error(result.error || 'Failed to create OEM number');
      }

      // Add to list and re-sort
      const updated = [...oemNumbers, result.data].sort((a, b) =>
        a.manufacturer.localeCompare(b.manufacturer)
      );
      setOemNumbers(updated);
      showSuccess('OEM number added successfully');
      setIsAddModalOpen(false);
      reset();
    } catch (err) {
      console.error('Error creating OEM number:', err);
      setError(err instanceof Error ? err.message : 'Failed to create OEM number');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit edit form
  const onSubmitEdit = async (data: OEMPartNumberFormData) => {
    if (!selectedOEMNumber) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/parts/${partId}/oem-numbers/${selectedOEMNumber.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Check for unique constraint violation
        if (result.error && result.error.includes('unique')) {
          throw new Error(`This manufacturer and OEM part number combination already exists for this part.`);
        }
        throw new Error(result.error || 'Failed to update OEM number');
      }

      // Update list and re-sort
      const updated = oemNumbers
        .map((oem) => (oem.id === selectedOEMNumber.id ? result.data : oem))
        .sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));
      setOemNumbers(updated);
      showSuccess('OEM number updated successfully');
      setIsEditModalOpen(false);
      setSelectedOEMNumber(null);
    } catch (err) {
      console.error('Error updating OEM number:', err);
      setError(err instanceof Error ? err.message : 'Failed to update OEM number');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedOEMNumber) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/parts/${partId}/oem-numbers/${selectedOEMNumber.id}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete OEM number');
      }

      // Remove from list
      setOemNumbers((prev) => prev.filter((oem) => oem.id !== selectedOEMNumber.id));
      showSuccess('OEM number deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedOEMNumber(null);
    } catch (err) {
      console.error('Error deleting OEM number:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete OEM number');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">OEM Part Numbers</h3>
          <p className="text-sm text-gray-400 mt-1">
            Track original equipment manufacturer part numbers
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-red transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add OEM Number
        </button>
      </div>

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
          <span className="ml-3 text-gray-400">Loading OEM numbers...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && oemNumbers.length === 0 && (
        <div className="text-center py-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
          <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No OEM numbers found. Add one to get started.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && oemNumbers.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-[#2a2a2a]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Manufacturer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    OEM Part Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Notes
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {oemNumbers.map((oemNumber) => (
                  <tr key={oemNumber.id} className="hover:bg-[#0a0a0a] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-brand-maroon" />
                        <span className="text-white font-medium">{oemNumber.manufacturer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white font-mono">{oemNumber.oemPartNumber}</td>
                    <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                      {oemNumber.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(oemNumber)}
                          className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(oemNumber)}
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
        title="Add OEM Part Number"
        onClose={() => setIsAddModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
          {/* Manufacturer */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Manufacturer <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('manufacturer')}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              placeholder="e.g., BMW, Bosch, Delphi"
            />
            {errors.manufacturer && (
              <p className="text-red-400 text-sm mt-1">{errors.manufacturer.message}</p>
            )}
          </div>

          {/* OEM Part Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              OEM Part Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('oemPartNumber')}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white font-mono focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              placeholder="e.g., 12345678"
            />
            {errors.oemPartNumber && (
              <p className="text-red-400 text-sm mt-1">{errors.oemPartNumber.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Must be unique for this manufacturer and part combination
            </p>
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
            {errors.notes && (
              <p className="text-red-400 text-sm mt-1">{errors.notes.message}</p>
            )}
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
              {isSubmitting ? 'Adding...' : 'Add OEM Number'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        title="Edit OEM Part Number"
        onClose={() => setIsEditModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
          {/* Same form fields as Add */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Manufacturer <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('manufacturer')}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
            />
            {errors.manufacturer && (
              <p className="text-red-400 text-sm mt-1">{errors.manufacturer.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              OEM Part Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('oemPartNumber')}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white font-mono focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
            />
            {errors.oemPartNumber && (
              <p className="text-red-400 text-sm mt-1">{errors.oemPartNumber.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Must be unique for this manufacturer and part combination
            </p>
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
            {errors.notes && (
              <p className="text-red-400 text-sm mt-1">{errors.notes.message}</p>
            )}
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
              {isSubmitting ? 'Updating...' : 'Update OEM Number'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete OEM Part Number"
        message={`Are you sure you want to delete the OEM number "${selectedOEMNumber?.manufacturer} ${selectedOEMNumber?.oemPartNumber}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedOEMNumber(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}
