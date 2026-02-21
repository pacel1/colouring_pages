/**
 * Upload Assets Step
 * 
 * Uploads generated assets to R2 storage and saves records to DB.
 * 
 * Flow:
 * 1. Generate preview + print assets (placeholder for now)
 * 2. Upload to R2
 * 3. Save asset records to DB
 * 4. Return storage URLs
 */

import { db, assets, variants, eq } from '@colouring-pages/shared';
import { createStorageClient } from '@colouring-pages/shared/storage';
import type { Asset } from '@colouring-pages/shared';

// Max file size: 10MB
const MAX_ASSET_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Asset types we generate
 */
export type AssetType = 'preview' | 'print';

/**
 * Upload result
 */
export interface UploadResult {
  previewUrl?: string;
  printUrl?: string;
  assets: Asset[];
}

/**
 * Generate storage key for an asset
 * Format: {category_slug}/{item_slug}/{locale}_{type}.{format}
 */
function generateStorageKey(
  itemSlug: string,
  locale: string,
  type: AssetType,
  format: string
): string {
  return `assets/${itemSlug}/${locale}_${type}.${format}`;
}

/**
 * Generate placeholder image data (simple colored square)
 * In production, this would be replaced with actual AI-generated images
 */
function generatePlaceholderImage(_width: number, _height: number): Uint8Array {
  // Create a simple PNG placeholder (1x1 pixel)
  // In production, this would be actual generated content
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, // bit depth, color type (RGB)
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F, 0x00, 0x05, 0xFE, 0x02, 0xFE, // compressed data
    0xDC, 0xDD, 0xB4, 0x19, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82, // CRC
  ]);
  
  return new Uint8Array(pngHeader);
}

/**
 * Upload a single asset to storage
 */
async function uploadAsset(
  storageKey: string,
  data: Uint8Array,
  mimeType: string,
  variantId: string
): Promise<Asset> {
  // Check if asset already exists (idempotency)
  const existing = await db.query.assets.findFirst({
    where: eq(assets.storageKey, storageKey),
  });
  
  if (existing) {
    console.log(`[upload] Asset already exists: ${storageKey}`);
    return existing;
  }
  
  // Initialize storage client
  const storage = createStorageClient();
  
  // Upload to R2
  const url = await storage.putObject(storageKey, data, mimeType);
  
  // Calculate checksum (simple hash for now)
  const checksum = Buffer.from(data).toString('base64').slice(0, 64);
  
  // Save to DB
  const [asset] = await db.insert(assets).values({
    variantId,
    storageKey,
    storageUrl: url,
    mimeType,
    fileSize: data.length,
    width: mimeType.includes('png') ? 800 : null,
    height: mimeType.includes('png') ? 800 : null,
    checksum,
  }).returning();
  
  console.log(`[upload] Uploaded asset: ${storageKey} -> ${url}`);
  
  return asset;
}

/**
 * Upload assets for a variant
 * 
 * Generates and uploads:
 * - preview: smaller image for thumbnails
 * - print: full-size image for printing
 */
export async function uploadVariantAssets(
  itemSlug: string,
  variantId: string,
  locale: string,
  format: 'png' | 'svg' | 'html'
): Promise<UploadResult> {
  const result: UploadResult = {
    assets: [],
  };
  
  // Determine mime type
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    svg: 'image/svg+xml',
    html: 'text/html',
  };
  const mimeType = mimeTypes[format] || 'image/png';
  
  // Generate placeholder data
  // In production, this would be actual generated content
  const placeholderData = generatePlaceholderImage(800, 800);
  
  // Validate size
  if (placeholderData.length > MAX_ASSET_SIZE_BYTES) {
    throw new Error(`Asset too large: ${placeholderData.length} bytes (max: ${MAX_ASSET_SIZE_BYTES})`);
  }
  
  // Upload preview
  const previewKey = generateStorageKey(itemSlug, locale, 'preview', format);
  const previewAsset = await uploadAsset(previewKey, placeholderData, mimeType, variantId);
  result.previewUrl = previewAsset.storageUrl;
  result.assets.push(previewAsset);
  
  // Upload print version (same for now, in production would be different size)
  const printKey = generateStorageKey(itemSlug, locale, 'print', format);
  const printAsset = await uploadAsset(printKey, placeholderData, mimeType, variantId);
  result.printUrl = printAsset.storageUrl;
  result.assets.push(printAsset);
  
  // Update variant with ogImage (preview URL)
  await db.update(variants)
    .set({
      ogImage: result.previewUrl,
    })
    .where(eq(variants.id, variantId));
  
  return result;
}
