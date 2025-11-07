'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Image as ImageIcon, Search, Check } from 'lucide-react';
import type { MediaFile, ListFilesResponse } from '@/types/media';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile) => void;
  currentImage?: string;
  folder?: string; // Default folder to open
  title?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentImage,
  folder = 'all',
  title = 'Select Image from Media Library',
}: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  // Fetch files
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(folder !== 'all' && { folder }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/media/files?${params}`);
      const data: ListFilesResponse = await response.json();

      if (data.success) {
        // Filter only images
        const imageFiles = data.files.filter((file) =>
          file.isImage
        );
        setFiles(imageFiles);
      } else {
        console.error('Failed to load files:', data.error);
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [folder, searchTerm]);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen, fetchFiles]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
    }
  }, [isOpen]);

  // Sync selected file when opening modal or when current value changes
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!currentImage) {
      setSelectedFile(null);
      return;
    }

    const matchedFile = files.find((file) =>
      file.key === currentImage || file.url === currentImage
    );

    if (matchedFile) {
      setSelectedFile(matchedFile);
    } else {
      setSelectedFile(null);
    }
  }, [currentImage, files, isOpen]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        fetchFiles();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, fetchFiles]);

  const handleSelect = () => {
    if (selectedFile) {
      onSelect(selectedFile);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-gray-900 rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-maroon-500/20 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-maroon-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search images..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* File Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-maroon-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.key}
                  onClick={() => setSelectedFile(file)}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedFile?.key === file.key
                      ? 'border-maroon-500 ring-2 ring-maroon-500/50'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="aspect-square bg-gray-800 flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/admin/media/proxy?url=${encodeURIComponent(file.url)}`}
                      alt={file.key.split('/').pop() || 'Image'}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Selection Indicator */}
                  {selectedFile?.key === file.key && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-maroon-500 rounded-full flex items-center justify-center z-10">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 z-[5]">
                    <p className="text-white text-xs text-center line-clamp-2">
                      {file.key.split('/').pop()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {selectedFile ? 'Click "Select Image" to confirm' : 'Click an image to select it'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedFile}
              className="px-4 py-2 bg-maroon-500 hover:bg-maroon-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
