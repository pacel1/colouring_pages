/**
 * AI Module - Types and Interfaces
 * 
 * Unified interface for AI providers (OpenAI, local, etc.)
 * 
 * Usage:
 * import { createAIClient } from '@colouring-pages/shared/ai';
 */

import type { Variant } from '../types';

/**
 * Input for generating variants
 */
export interface GenerateVariantsInput {
  itemId: string;
  prompt: string;
  locale: 'pl' | 'en';
  formats: Array<'png' | 'svg' | 'html'>;
  count?: number;
}

/**
 * Input for generating SEO text
 */
export interface GenerateTextInput {
  itemId: string;
  title: string;
  keywords: string[];
  locale: 'pl' | 'en';
}

/**
 * Options for image generation
 */
export interface ImageOptions {
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'natural' | 'vivid';
}

/**
 * Generated text content
 */
export interface TextContent {
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
}

/**
 * Moderation result
 */
export interface ModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  categoryScores: Record<string, number>;
}

/**
 * AI Client interface
 */
export interface AIClient {
  generateVariants(input: GenerateVariantsInput): Promise<Variant[]>;
  generateText(input: GenerateTextInput): Promise<TextContent>;
  generateImage(prompt: string, options?: ImageOptions): Promise<Uint8Array>;
  moderateText(text: string): Promise<ModerationResult>;
  moderateImage(image: Uint8Array): Promise<ModerationResult>;
}

/**
 * AI Provider type
 */
export type AIProvider = 'openai' | 'ollama';

/**
 * Configuration for AI client
 */
export interface AIConfig {
  provider: AIProvider;
  model?: string;
  openai?: { apiKey: string; organization?: string };
  ollama?: { host: string; model: string };
  dailyBudgetUsd?: number;
  maxPagesPerDay?: number;
}

/**
 * Default models
 */
export const DEFAULT_MODELS = {
  openai: {
    image: 'dall-e-2',
    text: 'gpt-4o-mini',
  },
  ollama: {
    image: 'llama3.2',
    text: 'llama3.2',
  },
} as const;
