/**
 * Generate Image Step
 * 
 * Generates coloring page images using DALL-E.
 * Creates single image: 1024x1024 (used for both web preview and print).
 */

import { db, items, variants, eq } from '@colouring-pages/shared';
import { createOpenAIClientWrapper } from '@colouring-pages/shared/ai';

/**
 * Image generation options (single size for cost optimization)
 */
interface ImageOptions {
  size: '1024x1024';
  quality: 'standard';
}

/**
 * Default image options
 */
const IMAGE_OPTIONS: ImageOptions = {
  size: '1024x1024',
  quality: 'standard',
};

/**
 * Build image generation prompt
 */
function buildImagePrompt(item: { titlePl: string; titleEn: string; prompt?: string | null }): string {
  const subject = item.titleEn || item.titlePl;
  const basePrompt = item.prompt || `A simple ${subject} coloring page`;
  
  return `${basePrompt}, black and white line art, coloring page, simple outlines, child-friendly, suitable for kids, no text, empty areas to color, clean white background`;
}

/**
 * Generate a single image
 */
async function generateSingleImage(
  itemId: string,
  maxRetries: number = 3
): Promise<{ buffer: Buffer; width: number; height: number } | null> {
  // Fetch item
  const item = await db.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) {
    console.error('[generateImage] Item not found:', itemId);
    return null;
  }

  const prompt = buildImagePrompt(item);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[generateImage] Generating image (attempt ${attempt}/${maxRetries})`);
      
      const client = createOpenAIClientWrapper();
      
      const result = await client.generateImage(prompt, IMAGE_OPTIONS);

      if (!result.metrics.success || !result.b64Json) {
        console.error('[generateImage] Generation failed:', result.metrics.error);
        continue;
      }

      // Decode base64 to buffer
      const buffer = Buffer.from(result.b64Json, 'base64');
      
      // Dimensions
      const width = 1024;
      const height = 1024;

      console.log(`[generateImage] Generated successfully, size: ${buffer.length} bytes`);
      
      return { buffer, width, height };

    } catch (error) {
      console.error(`[generateImage] Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.error('[generateImage] All retries exhausted');
        return null;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return null;
}

/**
 * Generate image for an item
 */
export async function generateImage(itemId: string): Promise<boolean> {
  console.log('[generateImage] Starting for item:', itemId);

  // Fetch item
  const item = await db.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) {
    console.error('[generateImage] Item not found:', itemId);
    return false;
  }

  // Check moderation status
  if (item.moderationStatus !== 'approved') {
    console.log('[generateImage] Item not approved:', itemId, item.moderationStatus);
    return false;
  }

  // Check if variant exists
  const variant = await db.query.variants.findFirst({
    where: eq(variants.itemId, itemId),
  });

  if (!variant) {
    console.error('[generateImage] No variant found for item:', itemId);
    return false;
  }

  // Generate single image
  const imageResult = await generateSingleImage(itemId);
  
  if (!imageResult) {
    console.error('[generateImage] Failed to generate image');
    return false;
  }

  console.log(`[generateImage] Generated, size: ${imageResult.buffer.length} bytes`);
  return true;
}

/**
 * Generate images for multiple items
 */
export async function generateImages(itemIds: string[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  
  for (const itemId of itemIds) {
    const success = await generateImage(itemId);
    results.set(itemId, success);
  }
  
  return results;
}
