import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';
import { deleteFile } from '@/lib/minio';
import type { DeleteFileResponse } from '@/types/media';

/**
 * DELETE /api/admin/media/files/[key]?folder=products
 * Delete a file from MinIO (single bucket with folder structure)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    // Verify admin authentication
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { key } = await params;

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'File key is required' } as DeleteFileResponse,
        { status: 400 }
      );
    }

    // Decode the key (it comes URL-encoded from the client)
    const decodedKey = decodeURIComponent(key);

    try {
      // Delete file from MinIO (single bucket)
      await deleteFile(decodedKey);

      const response: DeleteFileResponse = {
        success: true,
        message: 'File deleted successfully',
        key: decodedKey,
      };

      return NextResponse.json(response);

    } catch (deleteError) {
      console.error(`Error deleting file ${decodedKey}:`, deleteError);
      return NextResponse.json(
        { success: false, error: 'File not found or could not be deleted' } as DeleteFileResponse,
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Delete file error:', error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as DeleteFileResponse,
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete file' } as DeleteFileResponse,
      { status: 500 }
    );
  }
}
