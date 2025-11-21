import { NextRequest, NextResponse } from "next/server";
import {
  GetObjectCommand,
  type GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { Buffer } from "node:buffer";
import { Readable } from "node:stream";

import { s3Client, BUCKET_NAME } from "@/lib/minio";
import { isAllowedPublicKey } from "@/lib/minio-client";

const CACHE_CONTROL_HEADER = "public, max-age=31536000, immutable";

function toWebStream(
  body: GetObjectCommandOutput["Body"],
): ReadableStream<Uint8Array> {
  if (!body) {
    throw new Error("Missing object body");
  }

  if (body instanceof Readable) {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        body.on("data", (chunk) => {
          const data =
            chunk instanceof Uint8Array ? chunk : Buffer.from(chunk as Buffer);
          controller.enqueue(data);
        });

        body.on("end", () => {
          controller.close();
        });

        body.on("error", (error) => {
          controller.error(error);
        });
      },
      cancel(reason) {
        if (typeof body.destroy === "function") {
          body.destroy(reason as Error | undefined);
        }
      },
    });
  }

  if (
    typeof (body as { transformToWebStream?: () => ReadableStream<Uint8Array> })
      .transformToWebStream === "function"
  ) {
    return (
      body as { transformToWebStream: () => ReadableStream<Uint8Array> }
    ).transformToWebStream();
  }

  if (body instanceof Uint8Array) {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(body);
        controller.close();
      },
    });
  }

  return body as ReadableStream<Uint8Array>;
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key")?.trim() ?? "";

  if (!key) {
    return NextResponse.json(
      { success: false, error: "Key parameter is required" },
      { status: 400 },
    );
  }

  if (!isAllowedPublicKey(key)) {
    return NextResponse.json(
      { success: false, error: "Requested key is not accessible" },
      { status: 403 },
    );
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const result = await s3Client.send(command);
    const stream = toWebStream(result.Body);

    const headers = new Headers();
    headers.set("Cache-Control", CACHE_CONTROL_HEADER);

    if (result.ContentType) {
      headers.set("Content-Type", result.ContentType);
    }

    if (result.ContentLength !== undefined) {
      headers.set("Content-Length", result.ContentLength.toString());
    }

    if (result.ETag) {
      headers.set("ETag", result.ETag.replace(/"/g, ""));
    }

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch (error) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "$metadata" in error &&
      typeof (error as { $metadata?: { httpStatusCode?: number } }).$metadata
        ?.httpStatusCode === "number"
        ? (error as { $metadata: { httpStatusCode?: number } }).$metadata
            .httpStatusCode
        : undefined;

    if (statusCode === 404) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 },
      );
    }

    // Always log errors for debugging
    console.error("[media-public] Failed to stream object", {
      key,
      error,
      statusCode,
    });

    return NextResponse.json(
      { success: false, error: "Failed to load media asset" },
      { status: 500 },
    );
  }
}
