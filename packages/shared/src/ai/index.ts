/**
 * AI Module - Factory and exports
 * 
 * Unified AI interface for generating coloring pages.
 * Currently supports OpenAI (DALL-E).
 * 
 * Usage:
 * import { createAIClient } from '@colouring-pages/shared/ai';
 * 
 * const ai = createAIClient();
 * const image = await ai.generateImage('a cat coloring page');
 */

import type { AIClient } from './types';
import { createOpenAIClient } from './openai';

export type {
  AIClient,
  AIProvider,
  AIConfig,
  GenerateVariantsInput,
  GenerateTextInput,
  ImageOptions,
  TextContent,
  ModerationResult,
} from './types';

export { DEFAULT_MODELS } from './types';

/**
 * Create AI client based on configuration
 * 
 * Currently only OpenAI is implemented.
 * For local models, use Ollama provider.
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
