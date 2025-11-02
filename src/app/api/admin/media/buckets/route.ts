import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listObjects, formatBytes, FOLDERS } from '@/lib/minio';
import type { ListBucketsResponse, BucketInfo } from '@/types/media';

/**
 * GET /api/admin/media/buckets
 * List folders in the single MinIO bucket with statistics
 */
export async function GET() {
  try {
    // Verify admin authentication
    await requireAdmin();

    const folderPrefixes = Object.values(FOLDERS);
    const buckets: BucketInfo[] = [];
    let totalFiles = 0;
    let totalSize = 0;

    // Get stats for each folder
    for (const folderPrefix of folderPrefixes) {
      try {
        const objects = await listObjects(folderPrefix);
        
        const fileCount = objects.length;
        const folderSize = objects.reduce((sum, obj) => sum + obj.size, 0);
        const lastModified = objects.length > 0
          ? objects.reduce((latest, obj) => 
              obj.lastModified > latest ? obj.lastModified : latest
            , objects[0].lastModified)
          : new Date();

        // Use folder name (without trailing slash) as bucket name for UI
        const folderName = folderPrefix.replace('/', '');

        buckets.push({
          name: folderName,
          fileCount,
          totalSize: folderSize,
          totalSizeFormatted: formatBytes(folderSize),
          lastModified: lastModified.toISOString(),
        });

        totalFiles += fileCount;
        totalSize += folderSize;
      } catch (error) {
        console.error(`Error listing folder ${folderPrefix}:`, error);
        // Continue with other folders even if one fails
        const folderName = folderPrefix.replace('/', '');
        buckets.push({
          name: folderName,
          fileCount: 0,
          totalSize: 0,
          totalSizeFormatted: '0 Bytes',
          lastModified: new Date().toISOString(),
        });
      }
    }

    const response: ListBucketsResponse = {
      success: true,
      buckets,
      stats: {
        totalFiles,
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
        bucketCount: buckets.length,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('List folders error:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ListBucketsResponse,
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to list folders' } as ListBucketsResponse,
      { status: 500 }
    );
  }
}
