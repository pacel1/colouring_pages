/**
 * OpenAI Client Wrapper
 * 
 * Wrapper around OpenAI SDK with:
 * - Retry/backoff on rate limits
 * - Token limits
 * - Structured outputs
 * - Metrics logging (no content)
 * 
 * Usage:
 * import { createOpenAIClientWrapper } from '@colouring-pages/shared/ai';
 */

import OpenAI from 'openai';

// =============================================================================
// Configuration
// =============================================================================

export interface OpenAIClientConfig {
  apiKey: string;
  modelText?: string;
  modelImage?: string;
  maxTokensText?: number;
  maxTokensImage?: number;
  timeout?: number;
  maxRetries?: number;
}

// Default configuration
const DEFAULT_CONFIG = {
  modelText: 'gpt-4o-mini',
  modelImage: 'dall-e-2',
  maxTokensText: 1000,
  maxTokensImage: 4096,
  timeout: 30000,
  maxRetries: 3,
};

// =============================================================================
// Types
// =============================================================================

export interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface ImageOptions {
  model?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'natural' | 'vivid';
}

export interface Metrics {
  latencyMs: number;
  tokens?: number;
  costUsd?: number;
  success: boolean;
  error?: string;
}

// =============================================================================
// Client
// =============================================================================

export class OpenAIClientWrapper {
  private client: OpenAI;
  private config: typeof DEFAULT_CONFIG & OpenAIClientConfig;

  constructor(config: OpenAIClientConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeout || DEFAULT_CONFIG.timeout,
      maxRetries: config.maxRetries || DEFAULT_CONFIG.maxRetries,
    });
    
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Check if AI is enabled
   */
  static isEnabled(): boolean {
    return process.env.AI_ENABLED !== 'false';
  }

  /**
   * Create client from environment
   */
  static fromEnv(): OpenAIClientWrapper {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }

    return new OpenAIClientWrapper({
      apiKey,
      modelText: process.env.OPENAI_MODEL_TEXT || DEFAULT_CONFIG.modelText,
      modelImage: process.env.OPENAI_MODEL_IMAGE || DEFAULT_CONFIG.modelImage,
      maxTokensText: parseInt(process.env.MAX_TOKENS_TEXT || String(DEFAULT_CONFIG.maxTokensText), 10),
      maxTokensImage: parseInt(process.env.MAX_TOKENS_IMAGE || String(DEFAULT_CONFIG.maxTokensImage), 10),
    });
  }

  /**
   * Chat completion with structured output
   */
  async chat(
    userMessage: string,
    options: ChatOptions = {}
  ): Promise<{ content: string; metrics: Metrics }> {
    const startTime = Date.now();
    const model = options.model || this.config.modelText;
    const maxTokens = options.maxTokens || this.config.maxTokensText;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
          { role: 'user' as const, content: userMessage },
        ],
        max_tokens: maxTokens,
        temperature: options.temperature ?? 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '';
      const tokens = response.usage?.total_tokens;

      // Estimate cost (rough)
      const costUsd = this.estimateTextCost(tokens || 0, model);

      return {
        content,
        metrics: {
          latencyMs: Date.now() - startTime,
          tokens,
          costUsd,
          success: true,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        content: '',
        metrics: {
          latencyMs: Date.now() - startTime,
          success: false,
          error: errorMessage,
        },
      };
    }
  }

  /**
   * Image generation
   */
  async generateImage(
    prompt: string,
    options: ImageOptions = {}
  ): Promise<{ b64Json: string; metrics: Metrics }> {
    const startTime = Date.now();
    const model = options.model || this.config.modelImage;

    try {
      const response = await this.client.images.generate({
        model,
        prompt,
        n: 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        response_format: 'b64_json',
      });

      const imageData = response.data?.[0];
      const b64Json = imageData?.b64_json || '';
      const costUsd = this.estimateImageCost(model);

      return {
        b64Json,
        metrics: {
          latencyMs: Date.now() - startTime,
          costUsd,
          success: true,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        b64Json: '',
        metrics: {
          latencyMs: Date.now() - startTime,
          success: false,
          error: errorMessage,
        },
      };
    }
  }

  /**
   * Text moderation
   */
  async moderate(text: string): Promise<{ flagged: boolean; metrics: Metrics }> {
    const startTime = Date.now();

    try {
      const response = await this.client.moderations.create({
        input: text,
      });

      const flagged = response.results[0]?.flagged || false;

      return {
        flagged,
        metrics: {
          latencyMs: Date.now() - startTime,
          success: true,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        flagged: false,
        metrics: {
          latencyMs: Date.now() - startTime,
          success: false,
          error: errorMessage,
        },
      };
    }
  }

  /**
   * Estimate text generation cost (rough)
   */
  private estimateTextCost(tokens: number, model: string): number {
    const rates: Record<string, number> = {
      'gpt-4o-mini': 0.00015,
      'gpt-4o': 0.0025,
      'gpt-4': 0.03,
    };
    const rate = rates[model] || 0.00015;
    return (tokens / 1_000_000) * rate;
  }

  /**
   * Estimate image generation cost
   */
  private estimateImageCost(model: string): number {
    const rates: Record<string, number> = {
      'dall-e-2': 0.02,
      'dall-e-3': 0.04,
    };
    return rates[model] || 0.02;
  }
}

/**
 * Create client (factory)
 */
export function createOpenAIClientWrapper(): OpenAIClientWrapper {
  return OpenAIClientWrapper.fromEnv();
}
