import type { MediaFile } from '@/types/media';
import FileCard from './FileCard';

export type GridSize = 'normal' | 'compact';

interface FileGridProps {
  files: MediaFile[];
  onDelete: (file: MediaFile) => void;
  onCopyUrl: (url: string) => void;
  loading?: boolean;
  size?: GridSize;
  canDelete?: boolean;
}

export default function FileGrid({
  files,
  onDelete,
  onCopyUrl,
  loading = false,
  size = 'normal',
  canDelete = true,
}: FileGridProps) {
  // Grid classes based on size
  const gridClasses = size === 'compact'
    ? 'grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2'
    : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3';

  if (loading) {
    return (
      <div className={gridClasses}>
        {[...Array(size === 'compact' ? 24 : 16)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-block p-6 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] mb-4">
          <svg
            className="w-16 h-16 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No files found</h3>
        <p className="text-gray-400">
          Upload files to see them here or try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {files.map((file) => (
        <FileCard
          key={file.key}
          file={file}
          onDelete={() => onDelete(file)}
          onCopyUrl={() => onCopyUrl(file.url)}
          size={size}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}
