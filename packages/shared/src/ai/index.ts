/**
 * AI Module - Factory and exports
 * 
 * Usage:
 * import { createAIClient } from '@colouring-pages/shared/ai';
 * const ai = createAIClient();
 * 
 * For low-level access with metrics:
 * import { createOpenAIClientWrapper } from '@colouring-pages/shared/ai';
 * const client = createOpenAIClientWrapper();
 */

import type { AIClient } from './types';
import { createOpenAIClient } from './openai';

// Re-export client wrapper
export { createOpenAIClientWrapper, OpenAIClientWrapper } from './openaiClient';

export type {
  AIClient,
  AIProvider,
  AIConfig,
  GenerateVariantsInput,
  GenerateTextInput,
  TextContent,
  ModerationResult,
} from './types';

export { DEFAULT_MODELS } from './types';

/**
 * Create high-level AI client
 */
export function createAIClient(): AIClient {
  return createOpenAIClient();
}

/**
 * Check if AI is available (has API key)
 */
export function isAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
