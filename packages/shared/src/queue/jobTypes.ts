/**
 * Job Types for Queue
 * 
 * Centralized job type definitions for BullMQ queue.
 */

export const JOB_TYPES = {
  GENERATE: 'generate',
  PUBLISH: 'publish',
  SITEMAP: 'sitemap',
  REGENERATE: 'regenerate',
} as const;

export type JobType = typeof JOB_TYPES[keyof typeof JOB_TYPES];

/**
 * Job payloads for each job type
 */
export interface GenerateJobData {
  itemId: string;
  prompt: string;
}

export interface PublishJobData {
  itemId: string;
  locale: 'pl' | 'en';
  format: 'svg' | 'png' | 'html';
}

export interface SitemapJobData {
  // Empty payload for sitemap generation
}

export interface RegenerateJobData {
  itemId: string;
}

export type JobData = GenerateJobData | PublishJobData | SitemapJobData | RegenerateJobData;

/**
 * Generate deterministic job ID for idempotency
 * Format: {type}-{date}-{slug/id}
 */
export function generateJobId(type: JobType, data: JobData): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
  switch (type) {
    case JOB_TYPES.GENERATE: {
      const generateData = data as GenerateJobData;
      return `${type}-${date}-${generateData.itemId}`;
    }
    case JOB_TYPES.PUBLISH: {
      const publishData = data as PublishJobData;
      return `${type}-${date}-${publishData.itemId}-${publishData.locale}-${publishData.format}`;
    }
    case JOB_TYPES.SITEMAP: {
      return `${type}-${date}`;
    }
    case JOB_TYPES.REGENERATE: {
      const regenData = data as RegenerateJobData;
      return `${type}-${date}-${regenData.itemId}`;
    }
    default:
      return `${type}-${date}-${Date.now()}`;
  }
}

/**
 * Job priority levels
 */
export const JOB_PRIORITIES = {
  HIGH: 1,
  NORMAL: 100,
  LOW: 200,
} as const;

export type JobPriority = typeof JOB_PRIORITIES[keyof typeof JOB_PRIORITIES];

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  maxAttempts: 3,
  firstDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
} as const;
