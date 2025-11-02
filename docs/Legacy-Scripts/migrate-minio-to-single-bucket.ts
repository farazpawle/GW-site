/**
 * Migration Script: Move files from 3 buckets to single bucket with folders
 * 
 * Old Structure:
 * - product-images/file.jpg
 * - category-images/file.jpg
 * - user-uploads/file.pdf
 * 
 * New Structure:
 * - garritwulf-media/products/file.jpg
 * - garritwulf-media/categories/file.jpg
 * - garritwulf-media/general/file.pdf
 */

import {
  S3Client,
  ListObjectsV2Command,
  CopyObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';

// MinIO Configuration
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = process.env.MINIO_PORT || '9000';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'garritwulf_minio';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'garritwulf_minio_secure_2025';
const MINIO_REGION = process.env.MINIO_REGION || 'us-east-1';

// Bucket Configuration
const NEW_BUCKET = 'garritwulf-media';
const OLD_BUCKETS = {
  'product-images': 'products/',
  'category-images': 'categories/',
  'user-uploads': 'general/',
};

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
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check if bucket exists
 */
async function bucketExists(bucketName: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Create new bucket if it doesn't exist
 */
async function ensureBucketExists(bucketName: string): Promise<void> {
  const exists = await bucketExists(bucketName);
  
  if (!exists) {
    log(`Creating bucket: ${bucketName}`, 'cyan');
    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    log(`✓ Bucket created: ${bucketName}`, 'green');
  } else {
    log(`✓ Bucket already exists: ${bucketName}`, 'green');
  }
}

/**
 * List all files in a bucket
 */
async function listFiles(bucketName: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
  });

  const response = await s3Client.send(command);
  
  if (!response.Contents || response.Contents.length === 0) {
    return [];
  }

  return response.Contents.map(obj => obj.Key || '').filter(Boolean);
}

/**
 * Copy file from old bucket to new bucket with folder prefix
 */
async function copyFile(
  sourceBucket: string,
  sourceKey: string,
  targetBucket: string,
  targetKey: string
): Promise<boolean> {
  try {
    const copySource = `${sourceBucket}/${sourceKey}`;
    
    await s3Client.send(new CopyObjectCommand({
      Bucket: targetBucket,
      CopySource: copySource,
      Key: targetKey,
    }));

    return true;
  } catch (error) {
    console.error(`Error copying ${sourceKey}:`, error);
    return false;
  }
}

/**
 * Delete file from old bucket
 */
async function deleteFile(bucketName: string, key: string): Promise<boolean> {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));
    return true;
  } catch (error) {
    console.error(`Error deleting ${key}:`, error);
    return false;
  }
}

/**
 * Migrate files from one old bucket to new bucket
 */
async function migrateBucket(
  oldBucketName: string,
  folderPrefix: string
): Promise<{ success: number; failed: number }> {
  log(`\n📦 Migrating: ${oldBucketName} → ${NEW_BUCKET}/${folderPrefix}`, 'blue');
  
  // Check if old bucket exists
  const exists = await bucketExists(oldBucketName);
  if (!exists) {
    log(`  ⚠ Bucket does not exist: ${oldBucketName}`, 'yellow');
    return { success: 0, failed: 0 };
  }

  // List all files in old bucket
  const files = await listFiles(oldBucketName);
  
  if (files.length === 0) {
    log(`  ℹ No files found in ${oldBucketName}`, 'yellow');
    return { success: 0, failed: 0 };
  }

  log(`  Found ${files.length} files`, 'cyan');

  let successCount = 0;
  let failedCount = 0;

  // Migrate each file
  for (const file of files) {
    const targetKey = `${folderPrefix}${file}`;
    
    // Copy file
    const copied = await copyFile(oldBucketName, file, NEW_BUCKET, targetKey);
    
    if (copied) {
      // Delete from old bucket after successful copy
      const deleted = await deleteFile(oldBucketName, file);
      
      if (deleted) {
        successCount++;
        log(`  ✓ ${file} → ${targetKey}`, 'green');
      } else {
        failedCount++;
        log(`  ✗ Failed to delete: ${file}`, 'red');
      }
    } else {
      failedCount++;
      log(`  ✗ Failed to copy: ${file}`, 'red');
    }
  }

  return { success: successCount, failed: failedCount };
}

/**
 * Main migration function
 */
async function main() {
  log('\n╔═══════════════════════════════════════════════════════╗', 'bright');
  log('║  MinIO Migration: 3 Buckets → Single Bucket + Folders ║', 'bright');
  log('╚═══════════════════════════════════════════════════════╝\n', 'bright');

  try {
    // Step 1: Ensure new bucket exists
    log('Step 1: Checking/Creating new bucket...', 'cyan');
    await ensureBucketExists(NEW_BUCKET);

    // Step 2: Migrate each old bucket
    log('\nStep 2: Migrating files...', 'cyan');
    
    let totalSuccess = 0;
    let totalFailed = 0;

    for (const [oldBucket, folderPrefix] of Object.entries(OLD_BUCKETS)) {
      const result = await migrateBucket(oldBucket, folderPrefix);
      totalSuccess += result.success;
      totalFailed += result.failed;
    }

    // Summary
    log('\n╔═══════════════════════════════════════════════════════╗', 'bright');
    log('║                  Migration Summary                     ║', 'bright');
    log('╚═══════════════════════════════════════════════════════╝', 'bright');
    log(`\n✓ Total files migrated: ${totalSuccess}`, 'green');
    
    if (totalFailed > 0) {
      log(`✗ Total files failed: ${totalFailed}`, 'red');
    }

    log('\n✨ Migration completed!', 'green');
    log('\nNew structure:', 'cyan');
    log(`  ${NEW_BUCKET}/`, 'bright');
    log(`    ├── products/`, 'cyan');
    log(`    ├── categories/`, 'cyan');
    log(`    └── general/`, 'cyan');
    
    log('\n⚠ Note: Old buckets still exist but are now empty.', 'yellow');
    log('You can manually delete them from MinIO Console if needed.\n', 'yellow');

  } catch (error) {
    log('\n❌ Migration failed!', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run migration
main();
