'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { FormModal, DeleteConfirmModal } from '../shared';

// Type definitions
type ReferenceType = 'alternative' | 'supersedes' | 'compatible';

interface CrossReference {
  id: string;
  referenceType: ReferenceType;
  brandName: string;
  partNumber: string;
  notes?: string | null;
  referencedPartId?: string | null;
}

// Form validation schema
const crossReferenceSchema = z.object({
  referenceType: z.enum(['alternative', 'supersedes', 'compatible']),
  brandName: z.string().min(1, 'Brand name is required').max(100),
  partNumber: z.string().min(1, 'Part number is required').max(50),
  notes: z.string().max(500).optional(),
  referencedPartId: z.string().optional(),
});

type CrossReferenceFormData = z.infer<typeof crossReferenceSchema>;

interface CrossReferenceManagerProps {
  partId: string;
}

/**
 * Admin component for managing product cross-references
 * Features:
 * - CRUD operations for cross-references
 * - Three reference types: alternative, supersedes, compatible
 * - Real-time updates with optimistic UI
 * - Validation and error handling
 */
export default function CrossReferenceManager({ partId }: CrossReferenceManagerProps) {
  const [crossReferences, setCrossReferences] = useState<CrossReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReference, setSelectedReference] = useState<CrossReference | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CrossReferenceFormData>({
    resolver: zodResolver(crossReferenceSchema),
  });

  // Fetch cross-references on mount
  useEffect(() => {
    fetchCrossReferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partId]);

  const fetchCrossReferences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/parts/${partId}/cross-references`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch cross-references');
      }

      setCrossReferences(result.data || []);
    } catch (err) {
      console.error('Error fetching cross-references:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cross-references');
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
      referenceType: 'alternative',
      brandName: '',
      partNumber: '',
      notes: '',
      referencedPartId: '',
    });
    setIsAddModalOpen(true);
  };

  // Handle edit
  const handleEdit = (reference: CrossReference) => {
    setSelectedReference(reference);
    setValue('referenceType', reference.referenceType);
    setValue('brandName', reference.brandName);
    setValue('partNumber', reference.partNumber);
    setValue('notes', reference.notes || '');
    setValue('referencedPartId', reference.referencedPartId || '');
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = (reference: CrossReference) => {
    setSelectedReference(reference);
    setIsDeleteModalOpen(true);
  };

  // Submit add form
  const onSubmitAdd = async (data: CrossReferenceFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/parts/${partId}/cross-references`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create cross-reference');
      }

      // Add to list
      setCrossReferences((prev) => [...prev, result.data]);
      showSuccess('Cross-reference added successfully');
      setIsAddModalOpen(false);
      reset();
    } catch (err) {
      console.error('Error creating cross-reference:', err);
      setError(err instanceof Error ? err.message : 'Failed to create cross-reference');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit edit form
  const onSubmitEdit = async (data: CrossReferenceFormData) => {
    if (!selectedReference) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/parts/${partId}/cross-references/${selectedReference.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update cross-reference');
      }

      // Update list
      setCrossReferences((prev) =>
        prev.map((ref) => (ref.id === selectedReference.id ? result.data : ref))
      );
      showSuccess('Cross-reference updated successfully');
      setIsEditModalOpen(false);
      setSelectedReference(null);
    } catch (err) {
      console.error('Error updating cross-reference:', err);
      setError(err instanceof Error ? err.message : 'Failed to update cross-reference');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedReference) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/parts/${partId}/cross-references/${selectedReference.id}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete cross-reference');
      }

      // Remove from list
      setCrossReferences((prev) => prev.filter((ref) => ref.id !== selectedReference.id));
      showSuccess('Cross-reference deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedReference(null);
    } catch (err) {
      console.error('Error deleting cross-reference:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete cross-reference');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reference type labels
  const referenceTypeLabels: Record<ReferenceType, string> = {
    alternative: 'Alternative',
    supersedes: 'Supersedes',
    compatible: 'Compatible',
  };

  // Reference type badges
  const referenceTypeBadges: Record<ReferenceType, string> = {
    alternative: 'bg-blue-900/30 text-blue-400 border-blue-800',
    supersedes: 'bg-green-900/30 text-green-400 border-green-800',
    compatible: 'bg-purple-900/30 text-purple-400 border-purple-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Cross-References</h3>
          <p className="text-sm text-gray-400 mt-1">
            Manage alternative, superseding, and compatible parts
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-red transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Cross-Reference
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
          <span className="ml-3 text-gray-400">Loading cross-references...</span>
        </div>
      )}

      {/* Table */}
      {!isLoading && crossReferences.length === 0 && (
        <div className="text-center py-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
          <p className="text-gray-400">No cross-references found. Add one to get started.</p>
        </div>
      )}

      {!isLoading && crossReferences.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-[#2a2a2a]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Part Number
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
                {crossReferences.map((reference) => (
                  <tr key={reference.id} className="hover:bg-[#0a0a0a] transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          referenceTypeBadges[reference.referenceType]
                        }`}
                      >
                        {referenceTypeLabels[reference.referenceType]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">{reference.brandName}</td>
                    <td className="px-6 py-4 text-white font-mono">{reference.partNumber}</td>
                    <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                      {reference.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(reference)}
                          className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(reference)}
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
        title="Add Cross-Reference"
        onClose={() => setIsAddModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
          {/* Reference Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reference Type <span className="text-red-400">*</span>
            </label>
            <select
              {...register('referenceType')}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
            >
              <option value="alternative">Alternative</option>
              <option value="supersedes">Supersedes</option>
              <option value="compatible">Compatible</option>
            </select>
            {errors.referenceType && (
              <p className="text-red-400 text-sm mt-1">{errors.referenceType.message}</p>
            )}
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Brand Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('brandName')}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              placeholder="e.g., BMW, Mercedes, Toyota"
            />
            {errors.brandName && (
              <p className="text-red-400 text-sm mt-1">{errors.brandName.message}</p>
            )}
          </div>

          {/* Part Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Part Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('partNumber')}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white font-mono focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
              placeholder="e.g., ABC-12345"
            />
            {errors.partNumber && (
              <p className="text-red-400 text-sm mt-1">{errors.partNumber.message}</p>
            )}
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
              {isSubmitting ? 'Adding...' : 'Add Cross-Reference'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        title="Edit Cross-Reference"
        onClose={() => setIsEditModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
          {/* Same form fields as Add */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reference Type <span className="text-red-400">*</span>
            </label>
            <select
              {...register('referenceType')}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
            >
              <option value="alternative">Alternative</option>
              <option value="supersedes">Supersedes</option>
              <option value="compatible">Compatible</option>
            </select>
            {errors.referenceType && (
              <p className="text-red-400 text-sm mt-1">{errors.referenceType.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Brand Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('brandName')}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
            />
            {errors.brandName && (
              <p className="text-red-400 text-sm mt-1">{errors.brandName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Part Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('partNumber')}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white font-mono focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon"
            />
            {errors.partNumber && (
              <p className="text-red-400 text-sm mt-1">{errors.partNumber.message}</p>
            )}
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
              {isSubmitting ? 'Updating...' : 'Update Cross-Reference'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Cross-Reference"
        message={`Are you sure you want to delete the cross-reference "${selectedReference?.brandName} ${selectedReference?.partNumber}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedReference(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}
