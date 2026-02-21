/**
 * Job Types Tests
 * 
 * Test job ID generation and types.
 */

import { describe, it, expect } from 'vitest';
import { 
  JOB_TYPES, 
  generateJobId, 
  JOB_PRIORITIES,
  RETRY_CONFIG 
} from './jobTypes';

describe('JOB_TYPES', () => {
  it('should have correct job type values', () => {
    expect(JOB_TYPES.GENERATE).toBe('generate');
    expect(JOB_TYPES.PUBLISH).toBe('publish');
    expect(JOB_TYPES.SITEMAP).toBe('sitemap');
    expect(JOB_TYPES.REGENERATE).toBe('regenerate');
  });
});

describe('generateJobId', () => {
  it('should generate deterministic IDs for GENERATE jobs', () => {
    const data = { itemId: '123', prompt: 'test' };
    const id1 = generateJobId(JOB_TYPES.GENERATE, data);
    const id2 = generateJobId(JOB_TYPES.GENERATE, data);
    
    // Same input should produce same ID on same day
    expect(id1).toBe(id2);
    expect(id1).toContain('generate');
    expect(id1).toContain('123');
  });

  it('should generate deterministic IDs for PUBLISH jobs', () => {
    const data = { itemId: '456', locale: 'pl' as const, format: 'png' as const };
    const id1 = generateJobId(JOB_TYPES.PUBLISH, data);
    const id2 = generateJobId(JOB_TYPES.PUBLISH, data);
    
    expect(id1).toBe(id2);
    expect(id1).toContain('publish');
    expect(id1).toContain('456');
    expect(id1).toContain('pl');
    expect(id1).toContain('png');
  });

  it('should generate deterministic IDs for SITEMAP jobs', () => {
    const data = {};
    const id1 = generateJobId(JOB_TYPES.SITEMAP, data);
    const id2 = generateJobId(JOB_TYPES.SITEMAP, data);
    
    expect(id1).toBe(id2);
    expect(id1).toContain('sitemap');
  });

  it('should generate deterministic IDs for REGENERATE jobs', () => {
    const data = { itemId: '789' };
    const id1 = generateJobId(JOB_TYPES.REGENERATE, data);
    const id2 = generateJobId(JOB_TYPES.REGENERATE, data);
    
    expect(id1).toBe(id2);
    expect(id1).toContain('regenerate');
    expect(id1).toContain('789');
  });

  it('should include date in job ID', () => {
    const data = { itemId: '123', prompt: 'test' };
    const id = generateJobId(JOB_TYPES.GENERATE, data);
    const today = new Date().toISOString().slice(0, 10);
    
    expect(id).toContain(today);
  });
});

describe('JOB_PRIORITIES', () => {
  it('should have correct priority values', () => {
    expect(JOB_PRIORITIES.HIGH).toBe(1);
    expect(JOB_PRIORITIES.NORMAL).toBe(100);
    expect(JOB_PRIORITIES.LOW).toBe(200);
  });

  it('should have HIGH as lowest number (highest priority)', () => {
    expect(JOB_PRIORITIES.HIGH).toBeLessThan(JOB_PRIORITIES.NORMAL);
    expect(JOB_PRIORITIES.NORMAL).toBeLessThan(JOB_PRIORITIES.LOW);
  });
});

describe('RETRY_CONFIG', () => {
  it('should have valid retry configuration', () => {
    expect(RETRY_CONFIG.maxAttempts).toBeGreaterThan(0);
    expect(RETRY_CONFIG.firstDelay).toBeGreaterThan(0);
    expect(RETRY_CONFIG.maxDelay).toBeGreaterThan(RETRY_CONFIG.firstDelay);
  });
});
