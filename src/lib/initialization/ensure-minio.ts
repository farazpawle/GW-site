/**
 * MinIO Bucket Auto-Creation Module
 *
 * Ensures the required MinIO bucket exists and is properly configured.
 * This runs automatically on app startup to eliminate manual bucket creation.
 *
 * Features:
 * - Idempotent: Safe to run multiple times
 * - Non-blocking: Won't crash app if MinIO is unavailable
 * - Auto-creates: garritwulf-media bucket with public read policy
 */

import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";

// MinIO Configuration from environment
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
const MINIO_PORT = process.env.MINIO_PORT || "9000";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "garritwulf_minio";
const MINIO_SECRET_KEY =
  process.env.MINIO_SECRET_KEY || "garritwulf_minio_secure_2025";
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "garritwulf-media";

// S3 Client
const s3Client = new S3Client({
  endpoint: `http://${MINIO_ENDPOINT}:${MINIO_PORT}`,
  region: "us-east-1",
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

/**
 * Check if bucket exists
 */
async function bucketExists(): Promise<boolean> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Create bucket with public read policy
 */
async function createBucket(): Promise<void> {
  try {
    // Create bucket
    await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`✅ Created MinIO bucket: ${BUCKET_NAME}`);

    // Set public read policy for images
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicRead",
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };

    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: BUCKET_NAME,
        Policy: JSON.stringify(policy),
      }),
    );
    console.log(`✅ Set public read policy for: ${BUCKET_NAME}`);
  } catch (error) {
    console.error(`❌ Failed to create bucket ${BUCKET_NAME}:`, error);
    throw error;
  }
}

/**
 * Ensure MinIO bucket exists (main entry point)
 *
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function ensureMinioBucket(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log("🔍 Checking MinIO bucket...");

    // Check if bucket exists
    const exists = await bucketExists();

    if (exists) {
      console.log(`✅ MinIO bucket "${BUCKET_NAME}" already exists`);
      return { success: true, message: "Bucket already exists" };
    }

    // Create bucket if missing
    console.log(`📦 Creating MinIO bucket: ${BUCKET_NAME}`);
    await createBucket();

    return {
      success: true,
      message: `Bucket "${BUCKET_NAME}" created successfully`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ MinIO bucket initialization failed:", errorMessage);
    console.error("💡 Make sure MinIO is running and accessible");

    // Don't throw - return error state instead
    return {
      success: false,
      message: `MinIO initialization failed: ${errorMessage}`,
    };
  }
}
