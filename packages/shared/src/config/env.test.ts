/**
 * Environment Validation Tests
 * 
 * Test env validation logic without using real secrets.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateEnv, webRequired, isGenerationEnabled, getLimit } from './env';

describe('env validation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should validate with required vars set', () => {
    // Set required env vars
    process.env.DATABASE_URL = 'postgres://localhost:5432/test';
    process.env.NODE_ENV = 'test';

    const result = validateEnv(webRequired);
    
    expect(result.DATABASE_URL).toBe('postgres://localhost:5432/test');
    expect(result.NODE_ENV).toBe('test');
  });

  it('should throw on missing required vars', () => {
    // Clear env
    delete process.env.DATABASE_URL;
    delete process.env.NODE_ENV;
    
    // Should throw - either schema error or missing required vars
    expect(() => validateEnv(webRequired)).toThrow();
  });

  it('should use defaults for optional vars', () => {
    process.env.DATABASE_URL = 'postgres://localhost:5432/test';
    process.env.NODE_ENV = 'test';
    
    const result = validateEnv(webRequired);
    
    expect(result.PORT).toBe('3000');
    expect(result.MAX_PAGES_PER_DAY).toBe('300');
  });

  it('should validate NODE_ENV enum', () => {
    process.env.DATABASE_URL = 'postgres://localhost:5432/test';
    process.env.NODE_ENV = 'invalid';
    
    expect(() => validateEnv(webRequired)).toThrow('Invalid environment variables');
  });

  it('should accept valid NODE_ENV values', () => {
    process.env.DATABASE_URL = 'postgres://localhost:5432/test';
    
    const envs = ['development', 'production', 'test'] as const;
    
    for (const env of envs) {
      process.env.NODE_ENV = env;
      const result = validateEnv(webRequired);
      expect(result.NODE_ENV).toBe(env);
    }
  });
});

describe('isGenerationEnabled', () => {
  it('should return true when GENERATION_ENABLED is "true"', () => {
    process.env.GENERATION_ENABLED = 'true';
    expect(isGenerationEnabled()).toBe(true);
  });

  it('should return false when GENERATION_ENABLED is "false"', () => {
    process.env.GENERATION_ENABLED = 'false';
    expect(isGenerationEnabled()).toBe(false);
  });

  it('should return false when GENERATION_ENABLED is not set', () => {
    delete process.env.GENERATION_ENABLED;
    expect(isGenerationEnabled()).toBe(false);
  });
});

describe('getLimit', () => {
  it('should parse numeric limit', () => {
    process.env.TEST_LIMIT = '100';
    expect(getLimit('TEST_LIMIT', 50)).toBe(100);
  });

  it('should return default for missing env', () => {
    delete process.env.TEST_LIMIT;
    expect(getLimit('TEST_LIMIT', 50)).toBe(50);
  });

  it('should return default for invalid value', () => {
    process.env.TEST_LIMIT = 'invalid';
    expect(getLimit('TEST_LIMIT', 50)).toBe(50);
  });
});
