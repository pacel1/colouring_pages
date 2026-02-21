/**
 * Content Validation Tests
 */

import { describe, it, expect } from 'vitest';
import { 
  validatePageText, 
  validateImageVariant,
  isValidJson,
  safeParseJson,
} from './content';

describe('validatePageText', () => {
  const validContent = {
    title: 'Lion coloring page',
    description: 'This is a fun lion coloring page for kids. They can color the lion in any color they want. It helps develop fine motor skills and creativity. The lion has a beautiful mane and a friendly face that children will love to color. This printable coloring page is perfect for young artists who are learning about animals and nature.',
    keywords: ['lion', 'animal', 'coloring'],
    metaTitle: 'Lion coloring page',
    metaDescription: 'Free lion coloring page for kids',
  };

  it('should fail on invalid JSON structure', () => {
    const result = validatePageText({ title: 'ab' }); // too short
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should fail on forbidden words in title', () => {
    const result = validatePageText({
      ...validContent,
      title: 'Lion with gun',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'FORBIDDEN_CONTENT')).toBe(true);
  });

  it('should fail on forbidden words in description', () => {
    const result = validatePageText({
      ...validContent,
      description: 'This lion is covered in blood and gore while shooting.',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'FORBIDDEN_CONTENT')).toBe(true);
  });
});

describe('validateImageVariant', () => {
  const validVariant = {
    size: 'large' as const,
    format: 'png' as const,
    width: 1024,
    height: 1024,
    url: 'https://example.com/image.png',
  };

  it('should pass valid variant', () => {
    const result = validateImageVariant(validVariant);
    expect(result.valid).toBe(true);
  });

  it('should warn on small dimensions', () => {
    const result = validateImageVariant({
      ...validVariant,
      width: 400,
      height: 300,
    });
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should fail on invalid format', () => {
    const result = validateImageVariant({
      ...validVariant,
      format: 'invalid' as any,
    });
    expect(result.valid).toBe(false);
  });
});

describe('JSON validation', () => {
  it('should validate valid JSON', () => {
    expect(isValidJson('{"a": 1}')).toBe(true);
  });

  it('should reject invalid JSON', () => {
    expect(isValidJson('not json')).toBe(false);
  });

  it('should parse JSON safely', () => {
    const result = safeParseJson<{ a: number }>('{"a": 1}');
    expect(result?.a).toBe(1);
  });

  it('should return null on invalid JSON', () => {
    const result = safeParseJson('invalid');
    expect(result).toBeNull();
  });
});
