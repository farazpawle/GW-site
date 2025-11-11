import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MINIO_BUCKET_NAME, extractKeyFromUrl } from "./minio-client";

export { extractKeyFromUrl } from "./minio-client";

// MinIO S3-compatible storage client
const s3Client = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT || "localhost"}:${process.env.MINIO_PORT || "9000"}`,
  region: process.env.MINIO_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "garritwulf_minio",
    secretAccessKey:
      process.env.MINIO_SECRET_KEY || "garritwulf_minio_secure_2025",
  },
  forcePathStyle: true, // Required for MinIO
});

// Single bucket with folder structure
export const BUCKET_NAME = MINIO_BUCKET_NAME;

// Folder prefixes within the bucket
export const FOLDERS = {
  PRODUCTS: "products/",
  CATEGORIES: "categories/",
  GENERAL: "general/",
  ICONS: "icons/", // For favicons and app icons
} as const;

// Legacy - for backward compatibility (DEPRECATED)
export const BUCKETS = {
  PRODUCT_IMAGES: "product-images",
  CATEGORY_IMAGES: "category-images",
  USER_UPLOADS: "user-uploads",
} as const;

/**
 * Upload a file to MinIO (Single Bucket)
 * @param key - File path with folder prefix (e.g., 'products/brake-123.jpg')
 * @param file - File buffer or stream
 * @param contentType - MIME type (e.g., 'image/jpeg')
 * @returns Promise<string> - FILE KEY (not URL) - store this in database
 */
export async function uploadFile(
  key: string,
  file: Buffer | Uint8Array | ReadableStream,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
    ContentDisposition: "inline",
  });

  await s3Client.send(command);

  // ✅ RETURN ONLY THE KEY - Never return environment-specific URLs
  // The key can be used to generate presigned URLs on-demand
  return key;
}

/**
 * Upload a file to MinIO (Legacy - with bucket parameter)
 * @deprecated Use uploadFile(key, file, contentType) instead
 */
export async function uploadFileWithBucket(
  bucket: string,
  key: string,
  file: Buffer | Uint8Array | ReadableStream,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
    ContentDisposition: "inline",
  });

  await s3Client.send(command);

  // ✅ RETURN ONLY THE KEY for consistency with uploadFile()
  return key;
}

/**
 * Delete a file from MinIO (Single Bucket)
 * @param key - File path with folder prefix
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Delete a file from MinIO (Legacy - with bucket parameter)
 * @deprecated Use deleteFile(key) instead
 */
export async function deleteFileWithBucket(
  bucket: string,
  key: string,
): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Get a presigned URL for accessing a file (read-only)
 * @param key - File path with folder prefix
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise<string> - Presigned URL that works in browser (both dev and production)
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  let presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });

  // ✅ Environment-aware URL transformation
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // Production: Replace container hostnames with public MinIO subdomain
    // This allows presigned URLs to work from any browser
    // Use regex with 'gi' flag for case-insensitive replacement
    presignedUrl = presignedUrl.replace(
      /http:\/\/gw-minio:9000/gi,
      "https://minio.garritwulf.com",
    );
    presignedUrl = presignedUrl.replace(
      /https:\/\/gw-minio:9000/gi,
      "https://minio.garritwulf.com",
    );
    presignedUrl = presignedUrl.replace(
      /http:\/\/minio:9000/gi,
      "https://minio.garritwulf.com",
    );
    presignedUrl = presignedUrl.replace(
      /https:\/\/minio:9000/gi,
      "https://minio.garritwulf.com",
    );
  } else {
    // Development: Replace Docker hostnames with localhost
    presignedUrl = presignedUrl.replace(
      /http:\/\/minio:9000/gi,
      "http://localhost:9000",
    );
    presignedUrl = presignedUrl.replace(
      /https:\/\/minio:9000/gi,
      "https://localhost:9000",
    );
    presignedUrl = presignedUrl.replace(
      /http:\/\/gw-minio:9000/gi,
      "http://localhost:9000",
    );
  }

  return presignedUrl;
}

/**
 * Get a browser-accessible URL for a file (accepts key or old URL format)
 * @param keyOrUrl - Either a key (products/file.jpg) or full URL
 * @returns Promise<string> - Presigned URL that works in browser
 */
export async function getPublicUrl(keyOrUrl: string): Promise<string> {
  let key = keyOrUrl;

  if (keyOrUrl.startsWith("http")) {
    key = extractKeyFromUrl(keyOrUrl);
    if (!key) {
      throw new Error("Could not extract key from URL");
    }
  }

  // Generate presigned URL
  return await getPresignedUrl(key, 3600);
}

/**
 * Check if a file exists in MinIO
 * @param key - File path with folder prefix
 * @returns Promise<boolean> - True if file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get bucket name from MinIO URL (Legacy)
 * @deprecated Single bucket architecture - always returns BUCKET_NAME
 */
export function getBucketFromUrl(): string {
  return BUCKET_NAME;
}

/**
 * List all objects in the bucket (or filtered by folder prefix)
 * @param prefix - Optional folder prefix to filter (e.g., 'products/')
 * @param maxKeys - Maximum number of objects to return (default: 1000)
 * @returns Promise<Array> - Array of objects with key, size, and lastModified
 */
export async function listObjects(
  prefix?: string,
  maxKeys: number = 1000,
): Promise<
  Array<{ key: string; size: number; lastModified: Date; etag?: string }>
> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });

  const response: ListObjectsV2CommandOutput = await s3Client.send(command);

  if (!response.Contents || response.Contents.length === 0) {
    return [];
  }

  return response.Contents.map((obj) => ({
    key: obj.Key || "",
    size: obj.Size || 0,
    lastModified: obj.LastModified || new Date(),
    etag: obj.ETag,
  }));
}

/**
 * List all objects in a specific bucket (Legacy)
 * @deprecated Use listObjects(prefix) instead
 */
export async function listObjectsInBucket(
  bucket: string,
  prefix?: string,
  maxKeys: number = 1000,
): Promise<
  Array<{ key: string; size: number; lastModified: Date; etag?: string }>
> {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });

  const response: ListObjectsV2CommandOutput = await s3Client.send(command);

  if (!response.Contents || response.Contents.length === 0) {
    return [];
  }

  return response.Contents.map((obj) => ({
    key: obj.Key || "",
    size: obj.Size || 0,
    lastModified: obj.LastModified || new Date(),
    etag: obj.ETag,
  }));
}

/**
 * Get object metadata (size, content type, last modified)
 * @param key - File path with folder prefix
 * @returns Promise<Object> - Object metadata
 */
export async function getObjectMetadata(
  key: string,
): Promise<{ size: number; contentType: string; lastModified: Date }> {
  const command = new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);

  return {
    size: response.ContentLength || 0,
    contentType: response.ContentType || "application/octet-stream",
    lastModified: response.LastModified || new Date(),
  };
}

/**
 * Generate unique filename with timestamp
 * @param originalName - Original file name
 * @returns string - Unique filename (e.g., "brake-pad-1699123456789.jpg")
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const ext = originalName.split(".").pop();
  const nameWithoutExt = originalName
    .replace(`.${ext}`, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
  return `${nameWithoutExt}-${timestamp}.${ext}`;
}

/**
 * Format bytes to human-readable format
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns string - Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Check if file is an image based on content type
 * @param contentType - MIME type
 * @returns boolean - True if image
 */
export function isImageFile(contentType: string): boolean {
  return contentType.startsWith("image/");
}

export { s3Client };
