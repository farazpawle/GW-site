/**
 * Script to set MinIO bucket policy to public-read
 * This allows images to be displayed without authentication
 */

import {
  S3Client,
  PutBucketPolicyCommand,
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
 * Set bucket policy to allow public read access
 */
async function setBucketPublic() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║  Setting MinIO Bucket to Public Read   ║', 'cyan');
  log('╚════════════════════════════════════════╝\n', 'cyan');

  try {
    // Bucket policy that allows public read access
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };

    log(`Setting policy for bucket: ${BUCKET_NAME}`, 'cyan');
    log('Policy: Allow public read access (GetObject)\n', 'yellow');

    const command = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(policy),
    });

    await s3Client.send(command);

    log('✅ Success! Bucket policy updated.', 'green');
    log('\nWhat this means:', 'cyan');
    log('  • All files in the bucket are now publicly readable', 'reset');
    log('  • Images will display in the Media Library', 'reset');
    log('  • No authentication needed to view images', 'reset');
    log('  • Upload/delete still requires admin authentication\n', 'reset');

    log('Test your images:', 'yellow');
    log(`  http://${MINIO_ENDPOINT}:${MINIO_PORT}/${BUCKET_NAME}/products/[filename]\n`, 'reset');

  } catch (error) {
    log('\n❌ Failed to set bucket policy!', 'yellow');
    console.error(error);
    
    log('\nTroubleshooting:', 'yellow');
    log('1. Make sure MinIO is running (docker ps)', 'reset');
    log('2. Check MinIO credentials in .env.local', 'reset');
    log('3. Verify bucket exists (check MinIO Console at localhost:9001)', 'reset');
    log('4. Try setting policy manually in MinIO Console:\n', 'reset');
    log('   Access Policy → Custom → Paste policy → Save\n', 'reset');
    
    process.exit(1);
  }
}

// Run the script
setBucketPublic();
