'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { FOLDERS } from '@/lib/minio';

interface MediaUploaderProps {
  onUploadComplete: () => void;
  onClose?: () => void;
}

interface SelectedFile extends File {
  preview?: string;
}

interface UploadError {
  name: string;
  error: string;
}

export default function MediaUploader({ onUploadComplete, onClose }: MediaUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [folder, setFolder] = useState<string>(FOLDERS.PRODUCTS);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: Array<{ file: File; errors: ReadonlyArray<{ message: string }> }>) => {
    console.log('📥 [MediaUploader] Files dropped:', {
      accepted: acceptedFiles.length,
      rejected: rejectedFiles.length,
    });

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejectionErrors: UploadError[] = rejectedFiles.map((rejection) => {
        const errors = Array.from(rejection.errors).map((e) => e.message).join(', ');
        return {
          name: rejection.file.name,
          error: errors,
        };
      });
      setErrors((prev) => [...prev, ...rejectionErrors]);
      console.log('❌ [MediaUploader] Rejected files:', rejectionErrors);
    }

    // Add preview URLs to accepted files
    const filesWithPreview = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );

    setSelectedFiles((prev) => {
      const combined = [...prev, ...filesWithPreview];
      // Enforce max 10 files
      if (combined.length > 10) {
        setErrors((e) => [
          ...e,
          {
            name: 'Limit exceeded',
            error: 'Maximum 10 files allowed. Extra files removed.',
          },
        ]);
        return combined.slice(0, 10);
      }
      return combined;
    });

    console.log('✅ [MediaUploader] Files added:', filesWithPreview.length);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg'],
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
  });

  // Remove file from selection
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      // Revoke preview URL to free memory
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
    console.log('🗑️  [MediaUploader] File removed at index:', index);
  };

  // Upload files to API
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    console.log('⬆️  [MediaUploader] Starting upload...', {
      files: selectedFiles.length,
      folder,
    });

    setUploading(true);
    setUploadProgress(0);
    setErrors([]);
    setUploadSuccess(false);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('folder', folder);

      // Append all files
      selectedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      console.log('📤 [MediaUploader] Sending request to API...');

      // Simulate progress (since fetch doesn't provide upload progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 300);

      // Upload to API
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      console.log('📥 [MediaUploader] API response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Handle partial failures
      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
        console.log('⚠️  [MediaUploader] Some files failed:', data.errors);
      }

      // Show success
      setUploadSuccess(true);
      console.log('✅ [MediaUploader] Upload completed:', data.message);

      // Cleanup and callback
      setTimeout(() => {
        // Revoke all preview URLs
        selectedFiles.forEach((file) => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });

        // Reset state
        setSelectedFiles([]);
        setUploadProgress(0);
        setUploadSuccess(false);

        // Notify parent
        onUploadComplete();
      }, 1500);

    } catch (error) {
      console.error('❌ [MediaUploader] Upload error:', error);
      setErrors([
        {
          name: 'Upload Error',
          error: error instanceof Error ? error.message : 'Failed to upload files',
        },
      ]);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Format file size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Folder Selection */}
      <div>
        <label htmlFor="folder" className="block text-sm font-medium text-gray-700 mb-2">
          Select Folder
        </label>
        <select
          id="folder"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          disabled={uploading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value={FOLDERS.PRODUCTS}>Products</option>
          <option value={FOLDERS.CATEGORIES}>Categories</option>
          <option value={FOLDERS.GENERAL}>General</option>
        </select>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop files here...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF, WebP, SVG (max 5MB per file, up to 10 files)
            </p>
          </div>
        )}
      </div>

      {/* File Preview Grid */}
      {selectedFiles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Selected Files ({selectedFiles.length}/10)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="relative border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFile(index)}
                  disabled={uploading}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Preview */}
                <div className="aspect-square mb-2 bg-gray-100 rounded overflow-hidden">
                  {file.preview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="text-xs">
                  <p className="font-medium text-gray-700 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-gray-500">{formatBytes(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">Files uploaded successfully!</p>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">{error.name}</p>
                <p className="text-red-600">{error.error}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onClose && (
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
