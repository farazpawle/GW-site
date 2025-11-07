'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import MediaPickerModal from '../media/MediaPickerModal';
import type { MediaFile } from '@/types/media';

interface ImageUploaderProps {
  value: string[]; // Array of image URLs
  onChange: (urls: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUploader({
  value = [],
  onChange,
  maxImages = 10,
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE_BYTES = maxSizeMB * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Validate files
  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const errors: string[] = [];
    const valid: File[] = [];

    // Check total count
    if (value.length + files.length > maxImages) {
      errors.push(`Maximum ${maxImages} images allowed. You can upload ${maxImages - value.length} more.`);
      return { valid, errors };
    }

    files.forEach((file) => {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only JPG, PNG, and WebP are allowed.`);
        return;
      }

      // Check file size
      if (file.size > MAX_SIZE_BYTES) {
        errors.push(`${file.name}: File size exceeds ${maxSizeMB}MB limit.`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  // Upload files to server
  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Add new URLs to existing ones
      const newUrls = [...value, ...data.urls];
      onChange(newUrls);

      // Show warnings if any
      if (data.warnings && data.warnings.length > 0) {
        setError(data.warnings.join(' '));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const { valid, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      setError(errors.join(' '));
      return;
    }

    if (valid.length > 0) {
      await uploadFiles(valid);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  // Remove image
  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  // Open file picker
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Handle media library selection
  const handleMediaSelect = (file: MediaFile) => {
    if (value.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }
    
    const newUrls = [...value, file.url];
    onChange(newUrls);
    setIsMediaPickerOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Upload from Device Button */}
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading || value.length >= maxImages}
          className={`
            flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl
            border-2 border-dashed font-medium transition-all
            ${isUploading || value.length >= maxImages
              ? 'border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed'
              : 'border-[#2a2a2a] bg-[#1a1a1a] text-white hover:border-brand-maroon hover:bg-brand-maroon/5'
            }
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload from Device</span>
            </>
          )}
        </button>

        {/* Select from Media Library Button */}
        <button
          type="button"
          onClick={() => setIsMediaPickerOpen(true)}
          disabled={isUploading || value.length >= maxImages}
          className={`
            flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl
            border-2 font-medium transition-all
            ${isUploading || value.length >= maxImages
              ? 'border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed'
              : 'border-brand-maroon/50 bg-brand-maroon/10 text-brand-maroon hover:bg-brand-maroon/20 hover:border-brand-maroon'
            }
          `}
        >
          <FolderOpen className="w-5 h-5" />
          <span>Select from Media Library</span>
        </button>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center
          transition-all
          ${isDragging 
            ? 'border-brand-maroon bg-brand-maroon/10' 
            : 'border-[#2a2a2a] bg-[#0a0a0a]'
          }
          ${isUploading || value.length >= maxImages ? 'pointer-events-none opacity-40' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={isUploading || value.length >= maxImages}
        />

        <div className="flex flex-col items-center gap-3">
          <Upload className="w-8 h-8 text-gray-500" />

          <div>
            <p className="text-gray-400 text-sm mb-1">
              {value.length >= maxImages
                ? `Maximum ${maxImages} images reached`
                : 'Or drag and drop files here'
              }
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, or WebP (max {maxSizeMB}MB each)
            </p>
          </div>

          {value.length > 0 && (
            <p className="text-xs text-gray-500">
              {value.length} / {maxImages} images
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#1a1a1a]"
            >
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image Number */}
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        title="Select Product Image from Media Library"
        folder="products"
      />
    </div>
  );
}
