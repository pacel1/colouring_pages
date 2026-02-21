/**
 * R2 Storage Test Script
 * Run: npx tsx scripts/test-r2.ts
 */
import 'dotenv/config';
import { createStorageClient } from '../packages/shared/src/storage';

async function testR2() {
  console.log('🧪 Testing R2 Storage Connection...\n');

  try {
    // Create storage client
    console.log('1. Creating storage client...');
    const storage = createStorageClient();
    console.log('   ✅ Storage client created successfully\n');

    // Test file content
    const testContent = 'Hello from R2 test! ' + new Date().toISOString();
    const testKey = `test/${Date.now()}-test.txt`;

    // Upload test
    console.log(`2. Uploading test file: ${testKey}`);
    const url = await storage.putObject(
      testKey,
      new TextEncoder().encode(testContent),
      'text/plain'
    );
    console.log(`   ✅ File uploaded: ${url}\n`);

    // Check if exists
    console.log('3. Checking if file exists...');
    const exists = await storage.exists(testKey);
    console.log(`   ✅ File exists: ${exists}\n`);

    // Get public URL
    console.log('4. Getting public URL...');
    const publicUrl = storage.getPublicUrl(testKey);
    console.log(`   ✅ Public URL: ${publicUrl}\n`);

    // Delete test
    console.log('5. Deleting test file...');
    await storage.delete(testKey);
    console.log('   ✅ File deleted\n');

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testR2();
