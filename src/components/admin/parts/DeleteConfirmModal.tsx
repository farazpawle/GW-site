'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string;
  productCount?: number;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  productCount,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  const isBulk = productCount !== undefined && productCount > 1;
  const itemText = isBulk ? `${productCount} products` : `"${productName}"`;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Confirm Deletion</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <p className="text-gray-300">
            Are you sure you want to delete {itemText}?
          </p>
          
          <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
            <p className="text-red-300 text-sm font-medium">
              ⚠️ This action cannot be undone
            </p>
            <p className="text-red-400/80 text-sm mt-2">
              {isBulk 
                ? 'All selected products and their images will be permanently deleted.'
                : 'This product and all its images will be permanently deleted.'}
            </p>
          </div>

          {!isBulk && (
            <div className="p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg">
              <p className="text-gray-400 text-sm">
                <span className="font-medium text-white">Product: </span>
                {productName}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
