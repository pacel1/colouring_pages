/**
 * Moderation Step
 * 
 * Checks if content is safe using OpenAI moderation API.
 * Fail-closed: if moderation fails, don't publish.
 */

import { db, items, eq } from '@colouring-pages/shared';
import { createOpenAIClientWrapper } from '@colouring-pages/shared/ai';

/**
 * Result of moderation check
 */
export interface ModerationResult {
  approved: boolean;
  reason?: string;
}

/**
 * Moderate an item's text content
 * 
 * Checks title, description, prompt using OpenAI moderation API.
 * Returns approved=false if any content is flagged.
 * 
 * FAIL-CLOSED: If moderation API fails, returns approved=false
 */
export async function moderateItem(itemId: string): Promise<ModerationResult> {
  // Fetch item
  const item = await db.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) {
    return { approved: false, reason: 'Item not found' };
  }

  // Combine all text to check
  const textToCheck = [
    item.titlePl,
    item.titleEn,
    item.prompt || '',
  ].filter(Boolean).join(' ');

  if (!textToCheck.trim()) {
    // No text to moderate - approve
    return { approved: true };
  }

  try {
    // Use the client wrapper with metrics
    const client = createOpenAIClientWrapper();
    
    const result = await client.moderate(textToCheck);
    
    // Log metrics (no content!)
    console.log('[moderate] result:', {
      flagged: result.flagged,
      latencyMs: result.metrics.latencyMs,
      success: result.metrics.success,
    });

    if (!result.metrics.success) {
      // API failed - fail-closed
      console.error('[moderate] Moderation API failed:', result.metrics.error);
      return { approved: false, reason: 'Moderation check failed' };
    }

    if (result.flagged) {
      // Content flagged - needs review
      console.log('[moderate] Content flagged for review:', itemId);
      
      await db.update(items)
        .set({
          moderationStatus: 'needs_review',
          moderationNote: 'Flagged by AI moderation',
        })
        .where(eq(items.id, itemId));

      return { approved: false, reason: 'Content flagged by moderation' };
    }

    // Content is clean - approve
    console.log('[moderate] Content approved:', itemId);
    
    await db.update(items)
      .set({
        moderationStatus: 'approved',
      })
      .where(eq(items.id, itemId));

    return { approved: true };

  } catch (error) {
    // Fail-closed: any error = don't publish
    console.error('[moderate] Error during moderation:', error);
    
    return { 
      approved: false, 
      reason: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Moderate multiple items (batch)
 */
export async function moderateItems(itemIds: string[]): Promise<Map<string, ModerationResult>> {
  const results = new Map<string, ModerationResult>();
  
  for (const itemId of itemIds) {
    const result = await moderateItem(itemId);
    results.set(itemId, result);
  }
  
  return results;
}
