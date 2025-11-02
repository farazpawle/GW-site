/**
 * Script to set MinIO bucket policy to private (no public access)
 * This is more secure for showcase websites where images should only be accessible with presigned URLs
 */

import {
  S3Client,
  DeleteBucketPolicyCommand,
} from '@aws-sdk/client-s3';

// MinIO Configuration
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = process.env.MINIO_PORT || '9000';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'garritwulf_minio';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'garritwulf_minio_secure_2025';
const MINIO_REGION = process.env.MINIO_REGION || 'us-east-1';

const BUCKET_NAME = 'garritwulf-media';

// Create S3 Client
const s3Client = new S3Client({
  endpoint: `http://${MINIO_ENDPOINT}:${MINIO_PORT}`,
  region: MINIO_REGION,
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Remove bucket policy to make bucket private
 */
async function setBucketPrivate() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║   Setting MinIO Bucket to Private      ║', 'cyan');
  log('╚════════════════════════════════════════╝\n', 'cyan');

  try {
    log(`Removing public policy from bucket: ${BUCKET_NAME}`, 'cyan');
    log('Policy: Private (presigned URLs only)\n', 'yellow');

    const command = new DeleteBucketPolicyCommand({
      Bucket: BUCKET_NAME,
    });

    await s3Client.send(command);

    log('✅ Success! Bucket is now private.', 'green');
    log('\nWhat this means:', 'cyan');
    log('  • Files are NOT publicly accessible', 'reset');
    log('  • Images require presigned URLs (temporary, secure)', 'reset');
    log('  • Presigned URLs expire after 1 hour', 'reset');
    log('  • More secure for showcase websites\n', 'reset');

    log('How it works:', 'yellow');
    log('  1. API generates presigned URL when listing files', 'reset');
    log('  2. URL contains authentication token and expiration', 'reset');
    log('  3. Images display in Media Library for 1 hour', 'reset');
    log('  4. After expiration, new presigned URL is generated\n', 'reset');

  } catch (error) {
    log('\n❌ Failed to remove bucket policy!', 'yellow');
    console.error(error);
    
    log('\nTroubleshooting:', 'yellow');
    log('1. Make sure MinIO is running (docker ps)', 'reset');
    log('2. Check MinIO credentials in .env.local', 'reset');
    log('3. Verify bucket exists (check MinIO Console at localhost:9001)', 'reset');
    log('4. Try removing policy manually in MinIO Console:\n', 'reset');
    log('   Access Policy → Delete Policy → Save\n', 'reset');
    
    process.exit(1);
  }
}

// Run the script
setBucketPrivate();
