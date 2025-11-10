import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/auth";
import { uploadFile, generateUniqueFilename, FOLDERS } from "@/lib/minio";
import { applyRateLimit, uploadRateLimiter } from "@/lib/rate-limit";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * POST /api/admin/upload
 * Upload multiple product images to MinIO
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 10 uploads per hour per IP
    const rateLimitResponse = applyRateLimit(request, uploadRateLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    // Verify admin authentication
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    // Validate: at least one file
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 },
      );
    }

    // Validate: maximum 10 files
    if (files.length > 10) {
      return NextResponse.json(
        { success: false, error: "Maximum 10 files allowed" },
        { status: 400 },
      );
    }

    // Validate and upload each file
    const uploadedKeys: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(
          `File ${i + 1} (${file.name}): Invalid file type. Only JPG, PNG, and WebP are allowed.`,
        );
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `File ${i + 1} (${file.name}): File size exceeds 5MB limit.`,
        );
        continue;
      }

      try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate unique filename with products folder prefix
        const uniqueFilename = generateUniqueFilename(file.name);
        const key = `${FOLDERS.PRODUCTS}${uniqueFilename}`;

        // Upload to MinIO single bucket (now returns key, not URL)
        const uploadedKey = await uploadFile(key, buffer, file.type);

        uploadedKeys.push(uploadedKey);
      } catch (uploadError) {
        console.error(`Error uploading file ${file.name}:`, uploadError);
        errors.push(`File ${i + 1} (${file.name}): Upload failed.`);
      }
    }

    // If no files were successfully uploaded
    if (uploadedKeys.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No files were successfully uploaded",
          details: errors,
        },
        { status: 400 },
      );
    }

    // Generate presigned URLs for immediate display in UI
    const { getPresignedUrl } = await import("@/lib/minio");
    const presignedUrls = await Promise.all(
      uploadedKeys.map((key) => getPresignedUrl(key, 3600)),
    );

    // Return success with both keys (for storage) and presigned URLs (for display)
    return NextResponse.json({
      success: true,
      keys: uploadedKeys, // Store these in database
      urls: presignedUrls, // Display these in UI
      ...(errors.length > 0 && { warnings: errors }),
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Handle authentication errors
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
