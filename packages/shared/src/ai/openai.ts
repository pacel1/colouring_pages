/**
 * OpenAI Client Implementation
 * 
 * Uses DALL-E for image generation and GPT for text.
 * 
 * Required env:
 * - OPENAI_API_KEY
 */

import OpenAI from 'openai';
import type { AIClient, GenerateVariantsInput, GenerateTextInput, ImageOptions, TextContent, ModerationResult } from './types';
import type { Variant } from '../types';
import { DEFAULT_MODELS } from './types';

/**
 * Create OpenAI client
 */
export function createOpenAIClient(): AIClient {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }
  
  const client = new OpenAI({ apiKey });
  
  return {
    async generateVariants(input: GenerateVariantsInput): Promise<Variant[]> {
      const variants: Variant[] = [];
      
      for (const format of input.formats) {
        variants.push({
          id: crypto.randomUUID(),
          itemId: input.itemId,
          locale: input.locale,
          format: format as 'png' | 'svg' | 'html',
          title: `Variant ${format}`,
          description: `Generated variant in ${format} format`,
          canonicalUrl: `/kolorowanki/${input.itemId}/${format}`,
          metaTitle: '',
          metaDescription: '',
          ogImage: undefined,
          createdAt: new Date(),
        });
      }
      
      return variants;
    },
    
    async generateText(input: GenerateTextInput): Promise<TextContent> {
      const model = DEFAULT_MODELS.openai.text;
      
      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a SEO expert for a Polish coloring pages website. 
Generate SEO-friendly title and description in ${input.locale === 'pl' ? 'Polish' : 'English'}.
Keywords: ${input.keywords.join(', ')}`,
          },
          {
            role: 'user',
            content: `Title: ${input.title}. 
Generate: title, description, metaTitle (max 70 chars), metaDescription (max 160 chars).
Return as JSON.`,
          },
        ],
        response_format: { type: 'json_object' },
      });
      
      const content = response.choices[0]?.message?.content;
      const parsed = JSON.parse(content || '{}');
      
      return {
        title: parsed.title || input.title,
        description: parsed.description || '',
        metaTitle: parsed.metaTitle || input.title,
        metaDescription: parsed.metaDescription || '',
      };
    },
    
    async generateImage(prompt: string, options?: ImageOptions): Promise<Uint8Array> {
      const model = DEFAULT_MODELS.openai.image;
      
      const requestOptions: {
        model: string;
        prompt: string;
        n: number;
        size: '1024x1024' | '1792x1024' | '1024x1792';
        quality: 'standard' | 'hd';
        style?: 'natural' | 'vivid';
        response_format: 'b64_json';
      } = {
        model,
        prompt,
        n: 1,
        size: options?.size || '1024x1024',
        quality: options?.quality || 'standard',
        response_format: 'b64_json',
      };
      
      // Only add style if explicitly provided
      if (options?.style) {
        requestOptions.style = options.style;
      }
      
      const response = await client.images.generate(requestOptions);
      
      const imageData = response.data?.[0];
      const b64 = imageData?.b64_json;
      if (!b64) {
        throw new Error('No image returned from OpenAI');
      }
      
      // Convert base64 to Uint8Array
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      return bytes;
    },
    
    async moderateText(text: string): Promise<ModerationResult> {
      const response = await client.moderations.create({
        input: text,
      });
      
      const result = response.results[0];
      return {
        flagged: result.flagged,
        categories: result.categories as unknown as Record<string, boolean>,
        categoryScores: result.category_scores as unknown as Record<string, number>,
      };
    },
    
    async moderateImage(_image: Uint8Array): Promise<ModerationResult> {
      // OpenAI doesn't have image moderation via API
      // For MVP, return safe
      return {
        flagged: false,
        categories: {},
        categoryScores: {},
      };
    },
  };
}
