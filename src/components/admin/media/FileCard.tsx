"use client";

import Image from "next/image";
import { Copy, Trash2, FileImage, Lock } from "lucide-react";
import type { MediaFile } from "@/types/media";

export type CardSize = "normal" | "compact";

interface FileCardProps {
  file: MediaFile;
  onDelete: () => void;
  onCopyUrl: () => void;
  size?: CardSize;
  canDelete?: boolean;
}

// Extract just the filename from the full key
function getFileName(key: string): string {
  const parts = key.split("/");
  return parts[parts.length - 1];
}

// Format date to relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export default function FileCard({
  file,
  onDelete,
  onCopyUrl,
  size = "normal",
  canDelete = true,
}: FileCardProps) {
  const isCompact = size === "compact";

  // Always use proxy endpoint for reliable image loading (uses file.key directly)
  const imageUrl = `/api/admin/media/proxy?key=${encodeURIComponent(file.key)}`;

  return (
    <div className="group relative aspect-square rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden hover:border-[#6e0000]/50 hover:shadow-lg hover:shadow-[#6e0000]/20 transition-all hover:scale-[1.02]">
      {/* Image Preview or File Icon */}
      {file.isImage ? (
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt={getFileName(file.key)}
            fill
            className="object-cover"
            sizes={
              isCompact
                ? "(max-width: 640px) 25vw, (max-width: 768px) 12.5vw, (max-width: 1024px) 10vw, (max-width: 1280px) 8vw, 8vw"
                : "(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16vw, 12vw"
            }
            unoptimized
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FileImage
            className={
              isCompact ? "w-6 h-6 text-gray-600" : "w-8 h-8 text-gray-600"
            }
          />
        </div>
      )}

      {/* Hover Overlay with Actions */}
      <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
        <button
          onClick={onCopyUrl}
          className={`rounded-lg bg-blue-600/80 hover:bg-blue-600 transition-colors flex items-center text-xs font-medium ${
            isCompact ? "p-1.5 gap-1" : "p-2 gap-1.5"
          }`}
          title="Copy URL"
          aria-label="Copy URL"
        >
          <Copy
            className={
              isCompact ? "w-3 h-3 text-white" : "w-3.5 h-3.5 text-white"
            }
          />
          {!isCompact && <span className="text-white">Copy</span>}
        </button>
        {canDelete ? (
          <button
            onClick={onDelete}
            className={`rounded-lg bg-red-600/80 hover:bg-red-600 transition-colors flex items-center text-xs font-medium ${
              isCompact ? "p-1.5 gap-1" : "p-2 gap-1.5"
            }`}
            title="Delete file"
            aria-label="Delete file"
          >
            <Trash2
              className={
                isCompact ? "w-3 h-3 text-white" : "w-3.5 h-3.5 text-white"
              }
            />
            {!isCompact && <span className="text-white">Delete</span>}
          </button>
        ) : (
          <button
            onClick={onDelete}
            className={`rounded-lg bg-gray-800/80 cursor-not-allowed flex items-center text-xs font-medium ${
              isCompact ? "p-1.5 gap-1" : "p-2 gap-1.5"
            }`}
            title="No permission to delete"
            aria-label="No permission to delete"
            disabled
          >
            <Lock
              className={
                isCompact
                  ? "w-3 h-3 text-gray-500"
                  : "w-3.5 h-3.5 text-gray-500"
              }
            />
            {!isCompact && <span className="text-gray-500">Delete</span>}
          </button>
        )}
      </div>

      {/* File Info Footer - Visible on Hover (only in normal mode) */}
      {!isCompact && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p
            className="text-[10px] text-white truncate font-medium"
            title={getFileName(file.key)}
          >
            {getFileName(file.key)}
          </p>
          <div className="flex justify-between items-center mt-0.5">
            <p className="text-[9px] text-gray-400">{file.sizeFormatted}</p>
            <p className="text-[9px] text-gray-500">
              {formatRelativeTime(file.lastModified)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
