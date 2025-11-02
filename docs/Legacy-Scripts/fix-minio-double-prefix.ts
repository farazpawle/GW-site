/**
 * Cleanup Script: Fix double folder prefix issue
 * 
 * Issue: Files were copied as products/products/file.jpg
 * Should be: products/file.jpg
 */

import {
  S3Client,
  ListObjectsV2Command,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

// MinIO Configuration
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = process.env.MINIO_PORT || '9000';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'garritwulf_minio';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'garritwulf_minio_secure_2025';
const MINIO_REGION = process.env.MINIO_REGION || 'us-east-1';

const BUCKET = 'garritwulf-media';

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

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * List all files in bucket with prefix
 */
async function listFiles(prefix: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
  });

  const response = await s3Client.send(command);
  
  if (!response.Contents || response.Contents.length === 0) {
    return [];
  }

  return response.Contents.map(obj => obj.Key || '').filter(Boolean);
}

/**
 * Move file within same bucket
 */
async function moveFile(sourceKey: string, targetKey: string): Promise<boolean> {
  try {
    // Copy to new location
    await s3Client.send(new CopyObjectCommand({
      Bucket: BUCKET,
      CopySource: `${BUCKET}/${sourceKey}`,
      Key: targetKey,
    }));

    // Delete old location
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: sourceKey,
    }));

    return true;
  } catch (error) {
    console.error(`Error moving ${sourceKey}:`, error);
    return false;
  }
}

/**
 * Main cleanup function
 */
async function main() {
  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║  Fixing Double Folder Prefix Issue     ║', 'blue');
  log('╚════════════════════════════════════════╝\n', 'blue');

  try {
    // Find all files with double prefix (products/products/, categories/categories/, general/general/)
    const folders = ['products/products/', 'categories/categories/', 'general/general/'];
    
    let totalFixed = 0;

    for (const doublePrefix of folders) {
      const correctPrefix = doublePrefix.split('/')[0] + '/';
      
      log(`\n🔍 Checking: ${doublePrefix}`, 'cyan');
      
      const files = await listFiles(doublePrefix);
      
      if (files.length === 0) {
        log(`  ✓ No files with double prefix found`, 'green');
        continue;
      }

      log(`  Found ${files.length} files to fix`, 'yellow');

      for (const file of files) {
        // Extract just the filename (remove double prefix)
        const filename = file.replace(doublePrefix, '');
        const newKey = correctPrefix + filename;

        const success = await moveFile(file, newKey);
        
        if (success) {
          totalFixed++;
          log(`  ✓ ${file} → ${newKey}`, 'green');
        } else {
          log(`  ✗ Failed: ${file}`, 'yellow');
        }
      }
    }

    log('\n╔════════════════════════════════════════╗', 'blue');
    log('║           Cleanup Summary              ║', 'blue');
    log('╚════════════════════════════════════════╝', 'blue');
    log(`\n✓ Total files fixed: ${totalFixed}`, 'green');
    log('\n✨ Cleanup completed!\n', 'green');

  } catch (error) {
    log('\n❌ Cleanup failed!', 'yellow');
    console.error(error);
    process.exit(1);
  }
}

// Run cleanup
main();
