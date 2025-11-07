import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin, checkPermission } from '@/lib/auth';
import {
  uploadFile,
  generateUniqueFilename,
  getPresignedUrl,
  formatBytes,
  FOLDERS,
} from '@/lib/minio';

/**
 * Upload API Endpoint
 * POST /api/admin/media/upload
 * 
 * Handles multipart/form-data file uploads to MinIO
 * Supports multiple files (max 10), validates type and size
 * 
 * @param request - Next.js request with FormData
 * @returns JSON response with uploaded file metadata or error
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📤 [Upload API] Processing upload request');

    // Authentication check
    const admin = await checkAdmin();
    if (!admin) {
      console.log('❌ [Upload API] Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    console.log('✅ [Upload API] Admin authenticated:', admin.email);

    // Parse form data
    const formData = await request.formData();
    const folder = formData.get('folder') as string;

    console.log('📁 [Upload API] Target folder:', folder);

    // Validate folder
    const validFolders = Object.values(FOLDERS);
    if (!folder || !validFolders.includes(folder as (typeof FOLDERS)[keyof typeof FOLDERS])) {
      console.log('❌ [Upload API] Invalid folder:', folder);
      return NextResponse.json(
        {
          success: false,
          error: `Invalid folder. Must be one of: ${validFolders.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Extract files (use type that has name property)
    type FileWithName = Blob & { name: string };
    const files: FileWithName[] = [];
    for (const [key, value] of formData.entries()) {
      // Check if value is a file (Blob with name property)
      if (key.startsWith('file') && value instanceof Blob && 'name' in value) {
        files.push(value as FileWithName);
      }
    }

    console.log('📄 [Upload API] Files received:', files.length);

    // Validate file count
    if (files.length === 0) {
      console.log('❌ [Upload API] No files provided');
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      console.log('❌ [Upload API] Too many files:', files.length);
      return NextResponse.json(
        { success: false, error: 'Maximum 10 files allowed per upload' },
        { status: 400 }
      );
    }

    // Allowed MIME types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/x-icon',           // .ico files
      'image/vnd.microsoft.icon', // Alternative .ico MIME type
    ];

    // Maximum file size (5MB)
    const maxSize = 5 * 1024 * 1024;

    // Upload results
    const uploadedFiles = [];
    const failedFiles = [];

    // Process each file
    for (const file of files) {
      try {
        console.log(`📄 [Upload API] Processing: ${file.name} (${formatBytes(file.size)})`);

        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          const error = `Invalid file type: ${file.type}. Allowed: JPEG, PNG, GIF, WebP, SVG, ICO`;
          console.log(`❌ [Upload API] ${error}`);
          failedFiles.push({
            name: file.name,
            error,
          });
          continue;
        }

        // Validate file size
        if (file.size > maxSize) {
          const error = `File size exceeds maximum allowed (5MB): ${formatBytes(file.size)}`;
          console.log(`❌ [Upload API] ${error}`);
          failedFiles.push({
            name: file.name,
            error,
          });
          continue;
        }

        // Generate unique filename
        const uniqueFilename = generateUniqueFilename(file.name);
        const key = `${folder}${uniqueFilename}`;

        console.log(`🔑 [Upload API] Generated key: ${key}`);

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`⬆️  [Upload API] Uploading to MinIO...`);

        // Upload to MinIO
        await uploadFile(key, buffer, file.type);

        console.log(`✅ [Upload API] Upload successful`);

        // Generate presigned URL for immediate access
        const presignedUrl = await getPresignedUrl(key, 3600); // 1 hour expiry

        console.log(`🔗 [Upload API] Generated presigned URL`);

        // Add to successful uploads
        uploadedFiles.push({
          key,
          url: presignedUrl,
          size: file.size,
          sizeFormatted: formatBytes(file.size),
          contentType: file.type,
          isImage: true,
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
        });

        console.log(`✅ [Upload API] File processed successfully: ${file.name}`);

      } catch (error) {
        console.error(`❌ [Upload API] Failed to upload ${file.name}:`, error);
        failedFiles.push({
          name: file.name,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }

    // Prepare response
    const response = {
      success: uploadedFiles.length > 0,
      uploaded: uploadedFiles.length,
      failed: failedFiles.length,
      files: uploadedFiles,
      errors: failedFiles,
      message: failedFiles.length === 0
        ? `Successfully uploaded ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''}`
        : `Uploaded ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''}, ${failedFiles.length} failed`,
    };

    console.log('✅ [Upload API] Request completed:', response.message);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [Upload API] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
