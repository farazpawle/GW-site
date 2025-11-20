import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/auth";
import { getPresignedUrl } from "@/lib/minio";

export const dynamic = "force-dynamic";

function resolveCorsOrigin(request: NextRequest): string {
  const originHeader = request.headers.get("origin");
  if (originHeader) {
    return originHeader;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  const host = request.headers.get("host");
  if (host) {
    const protocol = request.nextUrl.protocol || "https:";
    return `${protocol}//${host}`;
  }

  return request.nextUrl.origin || "https://garritwulf.com";
}

function createImageResponse(
  request: NextRequest,
  imageBuffer: ArrayBuffer,
  contentType: string,
) {
  const corsOrigin = resolveCorsOrigin(request);

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    },
  });
}

/**
 * GET /api/admin/media/proxy?url=encoded_presigned_url
 * GET /api/admin/media/proxy?key=file_key
 * Proxy MinIO images to avoid CORS issues in browser
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = request.nextUrl;
    const imageUrl = searchParams.get("url");
    const fileKey = searchParams.get("key");

    // Support both 'key' and 'url' parameters
    if (!imageUrl && !fileKey) {
      return NextResponse.json(
        { error: "Missing url or key parameter" },
        { status: 400 },
      );
    }

    // If key is provided, generate a fresh presigned URL
    if (fileKey) {
      try {
        const presignedUrl = await getPresignedUrl(fileKey, 3600);
        const response = await fetch(presignedUrl);

        if (!response.ok) {
          console.error(`Failed to fetch file with key: ${fileKey}`);
          return NextResponse.json(
            { error: "Failed to fetch image" },
            { status: response.status },
          );
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType =
          response.headers.get("content-type") || "image/jpeg";

        return createImageResponse(request, imageBuffer, contentType);
      } catch (error) {
        console.error("Error fetching image by key:", error);
        return NextResponse.json(
          { error: "Failed to generate presigned URL or fetch image" },
          { status: 500 },
        );
      }
    }

    // Legacy URL-based proxy (fallback)
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing url parameter" },
        { status: 400 },
      );
    }

    const candidateUrls: string[] = [imageUrl];

    const endpoint = process.env.MINIO_ENDPOINT || "";
    const normalizedEndpoint = endpoint.replace(/^https?:\/\//, "");
    const [endpointHost, endpointPort] = normalizedEndpoint.split(":");
    const fallbackHost = endpointHost || "minio";
    const fallbackPort = endpointPort || process.env.MINIO_PORT || "9000";

    try {
      const urlObj = new URL(imageUrl);
      const protocol = urlObj.protocol || "http:";
      candidateUrls.push(
        `${protocol}//${fallbackHost}:${fallbackPort}${urlObj.pathname}${urlObj.search}`,
      );
      if (fallbackHost !== "minio") {
        candidateUrls.push(
          `${protocol}//minio:${fallbackPort}${urlObj.pathname}${urlObj.search}`,
        );
      }
    } catch (parseError) {
      console.warn("Failed to parse proxy image URL:", parseError);
    }

    let response: Response | null = null;
    let lastError: unknown = null;

    for (const candidate of candidateUrls) {
      try {
        response = await fetch(candidate);
        if (response.ok) {
          break;
        }
        lastError = new Error(`Upstream returned ${response.status}`);
      } catch (fetchError) {
        lastError = fetchError;
      }
    }

    if (!response || !response.ok) {
      console.error("Failed to proxy image:", lastError);
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: response?.status || 502 },
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return createImageResponse(request, imageBuffer, contentType);
  } catch (error) {
    console.error("Error proxying image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
