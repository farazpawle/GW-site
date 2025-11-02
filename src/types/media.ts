/**
 * Media Library Types
 * TypeScript interfaces for MinIO file management
 */

/**
 * Represents a single file in MinIO
 */
export interface MediaFile {
  key: string; // File path in bucket (e.g., "products/brake-pad-123.jpg")
  url: string; // Full public URL
  size: number; // Size in bytes
  sizeFormatted: string; // Human-readable size (e.g., "1.5 MB")
  lastModified: string; // ISO date string
  contentType: string; // MIME type (e.g., "image/jpeg")
  isImage: boolean; // True if file is an image
}

/**
 * Represents a MinIO bucket with statistics
 */
export interface BucketInfo {
  name: string; // Bucket name (e.g., "product-images")
  fileCount: number; // Total files in bucket
  totalSize: number; // Total size in bytes
  totalSizeFormatted: string; // Human-readable size
  lastModified: string; // Last modification date (ISO string)
}

/**
 * Overall storage statistics across all buckets
 */
export interface BucketStats {
  totalFiles: number; // Total files across all buckets
  totalSize: number; // Total size in bytes
  totalSizeFormatted: string; // Human-readable size
  bucketCount: number; // Number of buckets
}

/**
 * Pagination info for file lists
 */
export interface Pagination {
  total: number; // Total files in bucket
  page: number; // Current page number (1-based)
  limit: number; // Items per page
  totalPages: number; // Total number of pages
}

/**
 * Response from GET /api/admin/media/buckets
 */
export interface ListBucketsResponse {
  success: boolean;
  buckets: BucketInfo[];
  stats: BucketStats;
  error?: string;
}

/**
 * Response from GET /api/admin/media/files
 */
export interface ListFilesResponse {
  success: boolean;
  bucket: string;
  files: MediaFile[];
  pagination: Pagination;
  error?: string;
}

/**
 * Response from DELETE /api/admin/media/files/[key]
 */
export interface DeleteFileResponse {
  success: boolean;
  message?: string;
  key?: string;
  error?: string;
}

/**
 * Query parameters for GET /api/admin/media/files
 */
export interface ListFilesParams {
  bucket: string; // Required: bucket name
  page?: number; // Optional: page number (default: 1)
  limit?: number; // Optional: items per page (default: 50)
  search?: string; // Optional: search term
}

/**
 * View mode for file display
 */
export type ViewMode = 'grid' | 'list';

/**
 * Bucket names (matches BUCKETS in lib/minio.ts)
 */
export const BUCKET_NAMES = {
  PRODUCT_IMAGES: 'product-images',
  CATEGORY_IMAGES: 'category-images',
  USER_UPLOADS: 'user-uploads',
} as const;

export type BucketName = typeof BUCKET_NAMES[keyof typeof BUCKET_NAMES];
