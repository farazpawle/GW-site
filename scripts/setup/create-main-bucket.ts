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

const BUCKET_NAME = 'garritwulf-media';

async function createMainBucket() {
  console.log('🚀 Creating main bucket for the application...\n');

  try {
    // Check if bucket exists
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
      console.log(`✅ Bucket "${BUCKET_NAME}" already exists`);
      return;
    } catch {
      // Bucket doesn't exist, create it
      console.log(`📦 Creating bucket: ${BUCKET_NAME}`);
    }

    // Create bucket
    await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`✅ Created bucket: ${BUCKET_NAME}`);

    // Set public read policy
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };

    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: BUCKET_NAME,
        Policy: JSON.stringify(policy),
      })
    );
    console.log(`✅ Set public read policy for: ${BUCKET_NAME}`);

    console.log('\n✅ Main bucket setup complete!');
    console.log(`\n📂 Bucket: ${BUCKET_NAME}`);
    console.log('   This bucket will contain folders: products/, categories/, general/');

  } catch (error) {
    console.error('\n❌ Bucket creation failed:', error);
    console.error('\n💡 Make sure MinIO is running:');
    console.error('   docker-compose -f docker-compose.dev.yml up -d\n');
    process.exit(1);
  }
}

// Run
createMainBucket();
