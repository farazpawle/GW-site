import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/minio";

/**
 * GET /api/media/url
 * Convert a MinIO key to a browser-accessible presigned URL
 * Used by frontend components to display images stored as keys
 *
 * Query params:
 * - key: The file key (e.g., "products/brake-123.jpg")
 *
 * Returns:
 * - url: Presigned URL valid for 1 hour
 */
export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Key parameter is required" },
        { status: 400 },
      );
    }

    // Generate presigned URL (1 hour expiry)
    const url = await getPresignedUrl(key, 3600);

    return NextResponse.json({
      success: true,
      url,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/media/url/batch
 * Convert multiple keys to presigned URLs in a single request
 * More efficient than multiple GET requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const keys = body.keys as string[];

    if (!keys || !Array.isArray(keys)) {
      return NextResponse.json(
        { success: false, error: "Keys array is required" },
        { status: 400 },
      );
    }

    if (keys.length > 50) {
      return NextResponse.json(
        { success: false, error: "Maximum 50 keys per request" },
        { status: 400 },
      );
    }

    // Generate presigned URLs for all keys
    const urls = await Promise.all(
      keys.map((key) => getPresignedUrl(key, 3600)),
    );

    return NextResponse.json({
      success: true,
      urls,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Error generating batch presigned URLs:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate URLs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
