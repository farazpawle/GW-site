'use client';

import Image from 'next/image';
import { Copy, Trash2, FileImage, Calendar, HardDrive } from 'lucide-react';
import type { MediaFile } from '@/types/media';

interface FileListProps {
  files: MediaFile[];
  onDelete: (file: MediaFile) => void;
  onCopyUrl: (url: string) => void;
  loading?: boolean;
}

// Extract just the filename from the full key
function getFileName(key: string): string {
  const parts = key.split('/');
  return parts[parts.length - 1];
}

// Format date to readable format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function FileList({ files, onDelete, onCopyUrl, loading = false }: FileListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-block p-6 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] mb-4">
          <FileImage className="w-16 h-16 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No files found</h3>
        <p className="text-gray-400">
          Upload files to see them here or try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.key}
          className="group flex items-center gap-4 p-3 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#6e0000]/50 hover:bg-[#1a1a1a]/80 transition-all"
        >
          {/* Thumbnail */}
          <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-[#2a2a2a]">
            {file.isImage ? (
              <Image
                src={file.url}
                alt={getFileName(file.key)}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileImage className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate" title={getFileName(file.key)}>
              {getFileName(file.key)}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {file.sizeFormatted}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(file.lastModified)}
              </span>
              <span className="hidden md:inline text-gray-500">{file.contentType}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCopyUrl(file.url)}
              className="p-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 transition-colors"
              title="Copy URL"
              aria-label="Copy URL"
            >
              <Copy className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => onDelete(file)}
              className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 transition-colors"
              title="Delete file"
              aria-label="Delete file"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
