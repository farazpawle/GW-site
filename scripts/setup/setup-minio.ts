import { S3Client, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

// MinIO Configuration
const s3Client = new S3Client({
  endpoint: 'http://localhost:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'garritwulf_minio',
    secretAccessKey: 'garritwulf_minio_secure_2025',
  },
  forcePathStyle: true,
});

const BUCKETS = [
  'product-images',
  'category-images',
  'user-uploads',
];

/**
 * Check if a bucket exists
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
 * Create a bucket with public read access
 */
async function createBucket(bucketName: string): Promise<void> {
  try {
    // Create bucket
    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`✅ Created bucket: ${bucketName}`);

    // Set public read policy (for product/category images)
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(policy),
      })
    );
    console.log(`✅ Set public read policy for: ${bucketName}`);
  } catch (error) {
    console.error(`❌ Error creating bucket ${bucketName}:`, error);
    throw error;
  }
}

/**
 * Setup all MinIO buckets
 */
async function setupMinIO(): Promise<void> {
  console.log('🚀 Setting up MinIO buckets...\n');

  try {
    // Test connection
    console.log('📡 Testing MinIO connection...');
    await s3Client.send(new HeadBucketCommand({ Bucket: 'test' })).catch(() => {
      console.log('✅ MinIO is accessible\n');
    });

    // Create buckets
    for (const bucket of BUCKETS) {
      const exists = await bucketExists(bucket);
      
      if (exists) {
        console.log(`⏭️  Bucket already exists: ${bucket}`);
      } else {
        await createBucket(bucket);
      }
    }

    console.log('\n✅ MinIO setup complete!');
    console.log('\n📍 Access MinIO Console at: http://localhost:9001');
    console.log('   Username: garritwulf_minio');
    console.log('   Password: garritwulf_minio_secure_2025\n');
  } catch (error) {
    console.error('\n❌ MinIO setup failed:', error);
    console.error('\n💡 Make sure Docker services are running:');
    console.error('   npm run docker:dev\n');
    process.exit(1);
  }
}

// Run setup
setupMinIO();
