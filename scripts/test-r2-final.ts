/**
 * R2 Detailed Test - Check permissions specifically
 * Run: npx tsx scripts/test-r2-final.ts
 */
import 'dotenv/config';
import { S3Client, ListBucketsCommand, HeadBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';

async function testR2() {
  console.log('🔍 R2 Detailed Test\n');

  const accountId = process.env.R2_ACCOUNT_ID!;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
  const bucketName = process.env.R2_BUCKET_NAME!;

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  // Test 1: List Buckets
  console.log('1. Testing ListBuckets...');
  try {
    const result = await client.send(new ListBucketsCommand({}));
    console.log('   ✅ Success! Your buckets:', result.Buckets?.map(b => b.Name).join(', ') || '(empty)');
  } catch (e: any) {
    console.log('   ❌ ListBuckets FAILED:', e.message);
    console.log('   → Token needs "List Buckets" permission');
  }

  // Test 2: Check if bucket exists (HeadBucket)
  console.log('\n2. Testing HeadBucket (checking if bucket exists)...');
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log('   ✅ Bucket exists and is accessible!');
  } catch (e: any) {
    console.log('   ❌ HeadBucket FAILED:', e.message);
    if (e.name === 'NotFound') {
      console.log('   → Bucket does not exist!');
    } else if (e.name === 'AccessDenied') {
      console.log('   → Token needs permission for this bucket');
    }
  }

  // Test 3: Try to upload a small file
  console.log('\n3. Testing PutObject (upload)...');
  try {
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: 'test/hello.txt',
      Body: Buffer.from('Hello from test!'),
      ContentType: 'text/plain',
    }));
    console.log('   ✅ Upload successful!');
  } catch (e: any) {
    console.log('   ❌ PutObject FAILED:', e.message);
    console.log('   → Token needs "Write" permission');
  }

  console.log('\n✅ Test complete!');
}

testR2();
