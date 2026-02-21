/**
 * Test Worker Script
 * 
 * Tests the AI generation pipeline without using Redis queue.
 * Run: npx tsx scripts/test-worker.ts
 */

import 'dotenv/config';
import { db, categories, items, variants, assets, eq } from '../packages/shared/src/index.js';
import { createOpenAIClientWrapper } from '../packages/shared/src/ai/index.js';
import { createR2Storage } from '../packages/shared/src/storage/r2.js';
import crypto from 'crypto';

async function main() {
  console.log('🧪 Testing Worker Pipeline\n');
  
  const r2 = createR2Storage();
  const openai = createOpenAIClientWrapper();

  // Step 1: Get or create test category (IDEMPOTENT)
  console.log('📁 Step 1: Getting/creating test category...');
  const categorySlug = 'test-animals';
  
  let existingCategory = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });
  
  let category;
  if (existingCategory) {
    category = existingCategory;
    console.log('   ℹ️  Category already exists:', category.id);
  } else {
    [category] = await db.insert(categories).values({
      slug: categorySlug,
      namePl: 'Testowe Zwierzęta',
      nameEn: 'Test Animals',
      descriptionPl: 'Testowa kategoria dla kolorowanek',
      descriptionEn: 'Test category for coloring pages',
      isActive: true,
    }).returning();
    console.log('   ✅ Category created:', category.id);
  }
  
  // Step 2: Get or create test item (IDEMPOTENT)
  console.log('📝 Step 2: Getting/creating test item...');
  const itemSlug = 'test-lion';
  
  let existingItem = await db.query.items.findFirst({
    where: eq(items.slug, itemSlug),
  });
  
  let item;
  if (existingItem) {
    item = existingItem;
    console.log('   ℹ️  Item already exists:', item.id);
  } else {
    [item] = await db.insert(items).values({
      slug: itemSlug,
      titlePl: 'Lew',
      titleEn: 'Lion',
      categoryId: category.id,
      prompt: 'A simple lion coloring page',
      keywords: ['lew', 'zwierzę', 'dzikie zwierzęta', 'lion', 'animal', 'wild animal'],
      ageMin: 3,
      ageMax: 10,
      difficulty: 2,
      moderationStatus: 'approved',
    }).returning();
    console.log('   ✅ Item created:', item.id);
  }
  
  // Step 3: Generate text using AI (PL)
  console.log('📄 Step 3: Generating text (PL)...');
  
  const plPrompt = `You are a SEO content writer for a Polish coloring pages website.

Generate SEO content for a coloring page in Polish.

## Input
- Title: ${item.titlePl}
- Category: coloring page
- Keywords: ${item.keywords?.join(', ') || 'coloring, drawing, kids'}

## Requirements
1. Title: 50-255 characters, engaging
2. Description: 150-300 characters
3. Meta title: max 70 characters
4. Meta description: max 160 characters
5. Keywords: 5-10 relevant keywords
6. Language: Polish

Return JSON:
{
  "title": "string",
  "description": "string", 
  "metaTitle": "string",
  "metaDescription": "string",
  "keywords": ["string"]
}`;

  const plResult = await openai.chat(plPrompt, { maxTokens: 1500, temperature: 0.7 });
  
  if (!plResult.metrics.success || !plResult.content) {
    console.error('   ❌ PL text generation failed:', plResult.metrics.error);
    process.exit(1);
  }
  
  let plText: any;
  try {
    plText = JSON.parse(plResult.content);
  } catch {
    console.error('   ❌ Failed to parse PL response');
    process.exit(1);
  }
  
  console.log('   ✅ PL text generated:', plText.title?.slice(0, 50));
  
  // Step 4: Generate text using AI (EN)
  console.log('📄 Step 4: Generating text (EN)...');
  
  const enPrompt = plPrompt.replace('in Polish', 'in English').replace('Polish', 'English').replace('język: polski', 'language: English');
  
  const enResult = await openai.chat(enPrompt, { maxTokens: 1500, temperature: 0.7 });
  
  if (!enResult.metrics.success || !enResult.content) {
    console.error('   ❌ EN text generation failed:', enResult.metrics.error);
    process.exit(1);
  }
  
  let enText: any;
  try {
    enText = JSON.parse(enResult.content);
  } catch {
    console.error('   ❌ Failed to parse EN response');
    process.exit(1);
  }
  
  console.log('   ✅ EN text generated:', enText.title?.slice(0, 50));
  
  // Step 5: Save variants to database
  console.log('💾 Step 5: Saving variants to database...');
  
  const [variantPl] = await db.insert(variants).values({
    itemId: item.id,
    locale: 'pl',
    format: 'png',
    title: plText.title,
    description: plText.description,
    canonicalUrl: `/kolorowanki/${item.slug}/pl`,
    metaTitle: plText.metaTitle,
    metaDescription: plText.metaDescription,
  }).returning();
  
  const [variantEn] = await db.insert(variants).values({
    itemId: item.id,
    locale: 'en',
    format: 'png',
    title: enText.title,
    description: enText.description,
    canonicalUrl: `/kolorowanki/${item.slug}/en`,
    metaTitle: enText.metaTitle,
    metaDescription: enText.metaDescription,
  }).returning();
  
  console.log('   ✅ Variants saved (PL:', variantPl.id, ', EN:', variantEn.id, ')');
  
  // Step 6: Generate image using DALL-E
  console.log('🎨 Step 6: Generating image with DALL-E...');
  
  const imagePrompt = `${item.prompt}, black and white line art, coloring page, simple outlines, child-friendly, suitable for kids, no text, empty areas to color, clean white background`;
  
  const imageResult = await openai.generateImage(imagePrompt, {
    size: '1024x1024',
    model: 'dall-e-3',
  });
  
  if (!imageResult.metrics.success || !imageResult.b64Json) {
    console.error('   ❌ Image generation failed:', imageResult.metrics.error);
    process.exit(1);
  }
  
  const imageBuffer = Buffer.from(imageResult.b64Json, 'base64');
  console.log('   ✅ Image generated, size:', imageBuffer.length, 'bytes');
  
  // Step 7: Upload to R2
  console.log('☁️  Step 7: Uploading to R2...');
  
  const storageKey = `test/${item.slug}-${Date.now()}.png`;
  const storageUrl = await r2.putObject(storageKey, imageBuffer, 'image/png');
  
  console.log('   ✅ Image uploaded:', storageUrl);
  
  // Step 8: Save asset to database
  console.log('💾 Step 8: Saving asset to database...');
  
  const checksum = crypto.createHash('sha256').update(imageBuffer).digest('hex');
  
  await db.insert(assets).values({
    variantId: variantPl.id,
    storageKey,
    storageUrl,
    mimeType: 'image/png',
    fileSize: imageBuffer.length,
    width: 1024,
    height: 1024,
    checksum,
  });
  
  console.log('   ✅ Asset saved');
  
  // Summary
  console.log('\n🎉 Test completed successfully!');
  console.log('\n📊 Summary:');
  console.log('   Category:', category.namePl);
  console.log('   Item:', item.titlePl);
  console.log('   Image URL:', storageUrl);
  console.log('\n🌐 Test URLs:');
  console.log('   PL:', `http://localhost:3000/kolorowanki/${item.slug}`);
  console.log('   EN:', `http://localhost:3000/kolorowanki/${item.slug}?lang=en`);
  
  // Close database connection
  const client = (db as any).$client;
  if (client?.end) {
    await client.end();
  }
}

main().catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
