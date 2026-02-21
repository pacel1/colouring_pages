/**
 * R2 Connection Test - Alternative with different TLS settings
 * Run: npx tsx scripts/test-r2-v2.ts
 */
import 'dotenv/config';
import { S3Client, ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';

async function testR2() {
  console.log('🔍 R2 Connection Test v2...\n');

  const accountId = process.env.R2_ACCOUNT_ID!;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
  const bucketName = process.env.R2_BUCKET_NAME!;

  console.log('Config:');
  console.log('  Account ID:', accountId);
  console.log('  Bucket:', bucketName);
  console.log('');

  // Try different client configurations
  const configs = [
    {
      name: 'Standard',
      client: new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      }),
    },
    {
      name: 'Force Path Style',
      client: new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
      }),
    },
  ];

  for (const config of configs) {
    console.log(`Testing with ${config.name}...`);
    try {
      // Try ListBuckets
      const result = await config.client.send(new ListBucketsCommand({}));
      console.log(`  ✅ ListBuckets success! Buckets:`, result.Buckets?.map((b: any) => b.Name));
      
      // Try PutObject
      const testKey = `test/${Date.now()}.txt`;
      await config.client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: testKey,
        Body: Buffer.from('Hello R2!'),
        ContentType: 'text/plain',
      }));
      console.log(`  ✅ PutObject success! Key: ${testKey}`);
      
      console.log(`\n🎉 ${config.name} works!`);
      return;
    } catch (error: any) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
  }

  console.log('\n⚠️ All configs failed. The issue may be:');
  console.log('  1. Firewall/antivirus blocking HTTPS');
  console.log('  2. Token permissions');
  console.log('  3. Wrong credentials');
  console.log('  4. Bucket not accessible');
}

testR2();
