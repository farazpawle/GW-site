'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, Lock } from 'lucide-react';
import type { BucketInfo, MediaFile, ListBucketsResponse, ListFilesResponse } from '@/types/media';
import StorageStats from './StorageStats';
import FolderFilter from './BucketTabs'; // Re-exported as FolderFilter
import SearchBar from './SearchBar';
import FileGrid from './FileGrid';
import FileList from './FileList';
import DeleteConfirmModal from './DeleteConfirmModal';
import UploadModal from './UploadModal';
import ViewModeSelector, { type ViewMode } from './ViewModeSelector';

export default function MediaLibraryClient() {
  const [folders, setFolders] = useState<BucketInfo[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>('products');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);
  const [totalFiles, setTotalFiles] = useState(0);
  const [totalSize, setTotalSize] = useState('0 Bytes');
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; file?: MediaFile }>({ show: false });
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  // permissionsLoading is set but currently not displayed in UI
  const [, setPermissionsLoading] = useState(true);

  // Fetch user permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (response.ok) {
          const data = await response.json();
          setUserPermissions(data.permissions || []);
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      } finally {
        setPermissionsLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  // Helper function to check permissions
  const hasPermission = (permission: string): boolean => {
    if (userPermissions.includes('*')) return true;
    if (userPermissions.includes(permission)) return true;
    const [resource] = permission.split('.');
    if (userPermissions.includes(`${resource}.*`)) return true;
    return false;
  };

  const canUpload = hasPermission('media.upload');
  const canDelete = hasPermission('media.delete');

  // Fetch folders and stats
  const fetchFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/media/buckets');
      const data: ListBucketsResponse = await response.json();

      if (data.success) {
        setFolders(data.buckets); // API returns folders as "buckets" for compatibility
        setTotalFiles(data.stats.totalFiles);
        setTotalSize(data.stats.totalSizeFormatted);
      } else {
        showMessage('error', data.error || 'Failed to load folders');
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      showMessage('error', 'Failed to load folders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch files for active folder
  const fetchFiles = useCallback(async () => {
    setFilesLoading(true);
    try {
      const params = new URLSearchParams({
        folder: activeFolder,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`/api/admin/media/files?${params}`);
      const data: ListFilesResponse = await response.json();

      if (data.success) {
        setFiles(data.files);
      } else {
        showMessage('error', data.error || 'Failed to load files');
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      showMessage('error', 'Failed to load files');
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, [activeFolder, debouncedSearchTerm]);

  // Initial load
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Load files when folder or search changes
  useEffect(() => {
    if (!loading) {
      fetchFiles();
    }
  }, [loading, fetchFiles]);

  // Show message with auto-hide
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Handle folder change
  const handleFolderChange = (folder: string) => {
    setActiveFolder(folder);
    setSearchTerm('');
  };

  // Memoize search handler to prevent SearchBar re-renders
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Memoize placeholder to prevent re-renders
  const searchPlaceholder = useMemo(() => `Search files in ${activeFolder}...`, [activeFolder]);

  // Copy URL to clipboard
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showMessage('success', 'URL copied to clipboard!');
    } catch (error) {
      console.error('Error copying URL:', error);
      showMessage('error', 'Failed to copy URL');
    }
  };

  // Open delete modal
  const handleDeleteClick = (file: MediaFile) => {
    if (!canDelete) {
      showMessage('error', '⛔ Access Denied - You do not have permission to delete media files. Missing permission: media.delete');
      return;
    }
    setDeleteModal({ show: true, file });
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deleteModal.file) return;

    setDeleting(true);
    try {
      const encodedKey = encodeURIComponent(deleteModal.file.key);
      const response = await fetch(
        `/api/admin/media/files/${encodedKey}?folder=${activeFolder}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'File deleted successfully');
        setDeleteModal({ show: false });
        // Refresh both folders and files
        await Promise.all([fetchFolders(), fetchFiles()]);
      } else {
        showMessage('error', data.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      showMessage('error', 'Failed to delete file');
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setDeleteModal({ show: false });
  };

  return (
    <div className="space-y-4">
      {/* Message Banner */}
      {message && (
        <div
          className={`p-3 rounded-lg border text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Storage Statistics */}
      <StorageStats
        totalFiles={totalFiles}
        totalSize={totalSize}
        loading={loading}
      />

      {/* Folder Filter */}
      {!loading && (
        <FolderFilter
          folders={folders}
          activeFolder={activeFolder}
          onFolderChange={handleFolderChange}
        />
      )}

      {/* Toolbar with Search, View Mode, and Upload */}
      {!loading && (
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>
          <ViewModeSelector
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          {canUpload ? (
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#6e0000] text-white rounded-lg hover:bg-[#8e0000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap shadow-lg shadow-[#6e0000]/20"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          ) : (
            <button
              onClick={() => showMessage('error', '⛔ Access Denied - You do not have permission to upload media files. Missing permission: media.upload')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/30 text-gray-500 border border-gray-800 rounded-lg cursor-not-allowed font-medium whitespace-nowrap"
              disabled
            >
              <Lock className="w-4 h-4" />
              Upload
            </button>
          )}
        </div>
      )}

      {/* File Display - Grid or List based on view mode */}
      {!loading && (
        <>
          {viewMode === 'list' ? (
            <FileList
              files={files}
              onDelete={handleDeleteClick}
              onCopyUrl={handleCopyUrl}
              loading={filesLoading}
              canDelete={canDelete}
            />
          ) : (
            <FileGrid
              files={files}
              onDelete={handleDeleteClick}
              onCopyUrl={handleCopyUrl}
              loading={filesLoading}
              size={viewMode === 'compact' ? 'compact' : 'normal'}
              canDelete={canDelete}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={deleteModal.show}
        file={deleteModal.file}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        deleting={deleting}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={() => {
          // Refresh both folders and files to update stats
          fetchFiles();
          fetchFolders();
          setUploadModalOpen(false);
          showMessage('success', 'Files uploaded successfully!');
        }}
      />
    </div>
  );
}
