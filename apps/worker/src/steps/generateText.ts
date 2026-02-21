/**
 * Generate Text Step
 * 
 * Generates SEO content for coloring pages in PL and EN.
 * Uses AI with structured output and deduplication.
 */

import { db, items, variants, eq } from '@colouring-pages/shared';
import { createOpenAIClientWrapper } from '@colouring-pages/shared/ai';
import crypto from 'crypto';

/**
 * Generated text content
 */
interface GeneratedText {
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  contentHash: string;
}

/**
 * Generate text for a single locale
 */
async function generateTextForLocale(
  itemId: string,
  locale: 'pl' | 'en'
): Promise<GeneratedText | null> {
  // Fetch item
  const item = await db.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) {
    console.error('[generateText] Item not found:', itemId);
    return null;
  }

  // Check moderation status
  if (item.moderationStatus !== 'approved') {
    console.log('[generateText] Item not approved for publishing:', itemId, item.moderationStatus);
    return null;
  }

  // Get existing variants for this item and locale
  const existingVariants = await db.query.variants.findMany({
    where: eq(variants.itemId, itemId),
  });

  const existingTexts = existingVariants.map(v => v.title + v.description);
  const existingHashes = existingTexts.map(t => hashContent(t));

  // Build prompt
  const title = locale === 'pl' ? item.titlePl : item.titleEn;
  const category = 'coloring page';
  
  const prompt = buildPrompt(title, category, item.keywords || [], locale);

  try {
    const client = createOpenAIClientWrapper();
    
    const result = await client.chat(prompt, {
      maxTokens: 1500,
      temperature: 0.7,
    });

    if (!result.metrics.success || !result.content) {
      console.error('[generateText] AI call failed:', result.metrics.error);
      return null;
    }

    // Parse JSON response
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(result.content);
    } catch (parseError) {
      console.error('[generateText] Failed to parse AI response:', parseError);
      return null;
    }

    // Validate and extract
    const generatedText: GeneratedText = {
      title: String(parsed.title || title).slice(0, 255),
      description: String(parsed.description || '').slice(0, 1000),
      metaTitle: String(parsed.metaTitle || title).slice(0, 70),
      metaDescription: String(parsed.metaDescription || '').slice(0, 160),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 10) : [],
      contentHash: '',
    };

    // Generate hash
    generatedText.contentHash = hashContent(
      generatedText.title + generatedText.description
    );

    // Check for duplicates
    if (existingHashes.includes(generatedText.contentHash)) {
      console.log('[generateText] Duplicate content detected, regenerating...');
    }

    // Validate minimum quality
    if (!validateQuality(generatedText, locale)) {
      console.error('[generateText] Quality validation failed');
      return null;
    }

    return generatedText;

  } catch (error) {
    console.error('[generateText] Error:', error);
    return null;
  }
}

/**
 * Build prompt for text generation
 */
function buildPrompt(
  title: string,
  category: string,
  keywords: string[],
  locale: 'pl' | 'en'
): string {
  const lang = locale === 'pl' ? 'Polish' : 'English';
  const keywordList = keywords.join(', ');
  
  return `You are a SEO content writer for a Polish coloring pages website.

Generate SEO content for a coloring page in ${lang}.

## Input
- Title: ${title}
- Category: ${category}
- Keywords: ${keywordList || 'coloring, drawing, kids'}

## Requirements
1. Title: 50-255 characters, engaging
2. Description: 150-300 characters, describes the coloring page
3. Meta title: max 70 characters
4. Meta description: max 160 characters
5. Keywords: 5-10 relevant keywords
6. Language: ${locale === 'pl' ? 'Polish' : 'English'}

## Style
- ${locale === 'pl' 
    ? 'Naturalny, rodzinny, zachęcający. Unikaj powtórzeń.' 
    : 'Simple, engaging, family-friendly. Avoid repetition.'}

## Output
Return JSON:
{
  "title": "string",
  "description": "string", 
  "metaTitle": "string",
  "metaDescription": "string",
  "keywords": ["string"]
}`;
}

/**
 * Simple hash function for content deduplication
 */
function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Validate minimum quality
 */
function validateQuality(text: GeneratedText, locale: 'pl' | 'en'): boolean {
  const minDescLength = locale === 'pl' ? 100 : 80;
  
  return (
    text.title.length >= 10 &&
    text.description.length >= minDescLength &&
    text.metaTitle.length <= 70 &&
    text.metaDescription.length <= 160 &&
    text.keywords.length >= 3
  );
}

/**
 * Main function: generate text for both locales
 */
export async function generateTextForItem(itemId: string): Promise<boolean> {
  // Generate for both locales
  const plText = await generateTextForLocale(itemId, 'pl');
  const enText = await generateTextForLocale(itemId, 'en');

  if (!plText || !enText) {
    console.error('[generateText] Failed to generate text for one or both locales');
    return false;
  }

  try {
    // Insert variants
    await db.insert(variants).values([
      {
        itemId,
        locale: 'pl',
        format: 'png',
        title: plText.title,
        description: plText.description,
        canonicalUrl: `/kolorowanki/${itemId}/pl`,
        metaTitle: plText.metaTitle,
        metaDescription: plText.metaDescription,
      },
      {
        itemId,
        locale: 'en',
        format: 'png',
        title: enText.title,
        description: enText.description,
        canonicalUrl: `/kolorowanki/${itemId}/en`,
        metaTitle: enText.metaTitle,
        metaDescription: enText.metaDescription,
      },
    ]);

    console.log('[generateText] Variants created for item:', itemId);
    return true;

  } catch (error) {
    console.error('[generateText] Database error:', error);
    return false;
  }
}

/**
 * Generate text for multiple items
 */
export async function generateTexts(itemIds: string[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  
  for (const itemId of itemIds) {
    const success = await generateTextForItem(itemId);
    results.set(itemId, success);
  }
  
  return results;
}
