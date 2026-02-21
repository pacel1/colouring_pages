/**
 * Simple R2 Connection Test
 * Run: npx tsx scripts/test-r2-debug.ts
 */
import 'dotenv/config';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

async function testConnection() {
  console.log('🔍 Debug: Testing R2 Connection...\n');

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  
  console.log('Config:');
  console.log('  Account ID:', accountId);
  console.log('  Access Key ID:', accessKeyId?.substring(0, 8) + '...');
  console.log('  Endpoint:', `https://${accountId}.r2.cloudflarestorage.com`);
  console.log('');

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
    forcePathStyle: true,
  });

  try {
    console.log('Sending ListBucketsCommand...');
    const result = await client.send(new ListBucketsCommand({}));
    console.log('✅ Success! Buckets:', result.Buckets?.map(b => b.Name));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.$metadata?.httpStatusCode);
  }
}

testConnection();
