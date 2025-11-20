import type { MediaFile } from '@/types/media';

interface DeleteConfirmModalProps {
  show: boolean;
  file?: MediaFile;
  onConfirm: () => void;
  onCancel: () => void;
  deleting?: boolean;
}

// Extract filename from key
function getFileName(key: string): string {
  const parts = key.split('/');
  return parts[parts.length - 1];
}

export default function DeleteConfirmModal({
  show,
  file,
  onConfirm,
  onCancel,
  deleting = false,
}: DeleteConfirmModalProps) {
  if (!show || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4">Delete File?</h3>
        
        <p className="text-gray-400 mb-4">
          Are you sure you want to delete this file? This action cannot be undone.
        </p>
        
        <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-500 mb-1">Filename:</p>
          <p className="text-sm text-white font-mono break-all">
            {getFileName(file.key)}
          </p>
          <p className="text-xs text-gray-600 mt-2">{file.sizeFormatted}</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2 rounded-lg border border-[#2a2a2a] text-white 
                     hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium
                     hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
