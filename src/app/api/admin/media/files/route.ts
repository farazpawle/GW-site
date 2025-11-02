import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listObjects, formatBytes, isImageFile, getPresignedUrl, FOLDERS } from '@/lib/minio';
import type { ListFilesResponse, MediaFile } from '@/types/media';

/**
 * GET /api/admin/media/files?folder=products&page=1&limit=50&search=brake
 * List files in a specific folder with pagination and search
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdmin();

    const { searchParams } = request.nextUrl;
    const folder = searchParams.get('folder') || searchParams.get('bucket'); // Support legacy 'bucket' param
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' } as ListFilesResponse,
        { status: 400 }
      );
    }

    try {
      // Determine folder prefix - if no folder specified, list all
      let folderPrefix = '';
      if (folder) {
        // Map folder name to prefix (e.g., 'products' -> 'products/')
        const folderMap: Record<string, string> = {
          'products': FOLDERS.PRODUCTS,
          'categories': FOLDERS.CATEGORIES,
          'general': FOLDERS.GENERAL,
          // Legacy bucket names
          'product-images': FOLDERS.PRODUCTS,
          'category-images': FOLDERS.CATEGORIES,
          'user-uploads': FOLDERS.GENERAL,
        };
        folderPrefix = folderMap[folder] || `${folder}/`;
      }

      // List all objects in folder
      const objects = await listObjects(folderPrefix);

      // Filter by search term if provided
      let filteredObjects = objects;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredObjects = objects.filter(obj =>
          obj.key.toLowerCase().includes(searchLower)
        );
      }

      // Calculate pagination
      const total = filteredObjects.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedObjects = filteredObjects.slice(start, end);

      // Convert to MediaFile format with presigned URLs
      const files: MediaFile[] = await Promise.all(
        paginatedObjects.map(async (obj) => {
          // Generate presigned URL (valid for 1 hour)
          const url = await getPresignedUrl(obj.key, 3600);
          
          // Determine content type from extension
          const ext = obj.key.split('.').pop()?.toLowerCase() || '';
          const contentTypeMap: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
          };
          const contentType = contentTypeMap[ext] || 'application/octet-stream';

          return {
            key: obj.key,
            url,
            size: obj.size,
            sizeFormatted: formatBytes(obj.size),
            lastModified: obj.lastModified.toISOString(),
            contentType,
            isImage: isImageFile(contentType),
          };
        })
      );

      const response: ListFilesResponse = {
        success: true,
        bucket: folder || 'all', // Keep 'bucket' for UI compatibility
        files,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      };

      return NextResponse.json(response);

    } catch (folderError) {
      console.error(`Error accessing folder ${folder}:`, folderError);
      return NextResponse.json(
        { success: false, error: `Folder "${folder}" not found or inaccessible` } as ListFilesResponse,
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('List files error:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ListFilesResponse,
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to list files' } as ListFilesResponse,
      { status: 500 }
    );
  }
}
