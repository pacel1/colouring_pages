/**
 * Queue Configuration - Cost-optimized settings for BullMQ
 * 
 * @see docs/REDIS_COST_NOTES.md
 */

// =============================================================================
// Polling Settings
// =============================================================================

/**
 * How often workers check for new jobs (in milliseconds)
 * 
 * Higher values = fewer Redis operations = lower cost (Upstash PAYG)
 * Lower values = faster job pickup = higher cost
 * 
 * Default: 500ms
 * Recommended for cost optimization: 5000ms (5 seconds)
 */
export const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '5000', 10);

// =============================================================================
// Lock Settings  
// =============================================================================

/**
 * How long a job is locked while being processed (in milliseconds)
 * 
 * Should match expected job processing time
 * Too short = job marked as stalled
 * Too long = delayed error detection
 * 
 * Default: 30000ms (30 seconds)
 */
export const LOCK_DURATION_MS = parseInt(process.env.LOCK_DURATION_MS || '30000', 10);

// =============================================================================
// Concurrency Settings
// =============================================================================

/**
 * Maximum number of concurrent jobs per worker
 */
export const MAX_CONCURRENT_WORKERS = parseInt(process.env.MAX_CONCURRENT_WORKERS || '5', 10);

// =============================================================================
// Retry Settings
// =============================================================================

/**
 * Maximum number of retry attempts for failed jobs
 */
export const MAX_JOB_RETRIES = parseInt(process.env.MAX_JOB_RETRIES || '3', 10);

/**
 * Job timeout in seconds
 */
export const JOB_TIMEOUT_SECONDS = parseInt(process.env.JOB_TIMEOUT_SECONDS || '30', 10);

// =============================================================================
// Cleanup Settings
// =============================================================================

/**
 * Age in seconds before completed jobs are automatically removed
 * Default: 24 hours (86400 seconds)
 */
export const REMOVE_COMPLETED_AGE_SECONDS = parseInt(process.env.REMOVE_COMPLETED_AGE_SECONDS || '86400', 10);

/**
 * Age in seconds before failed jobs are automatically removed
 * Default: 7 days (604800 seconds)
 */
export const REMOVE_FAILED_AGE_SECONDS = parseInt(process.env.REMOVE_FAILED_AGE_SECONDS || '604800', 10);

// =============================================================================
// Backoff Settings
// =============================================================================

/**
 * Backoff configuration for retries
 */
export const BACKOFF_CONFIG = {
  type: 'exponential' as const,
  firstDelay: 1000,  // 1 second
  maxDelay: 60000,   // 60 seconds
};

// =============================================================================
// Stalled Job Settings
// =============================================================================

/**
 * Maximum number of times a job can be stalled before being marked as failed
 */
export const MAX_STALLED_COUNT = parseInt(process.env.MAX_STALLED_COUNT || '2', 10);

// =============================================================================
// Complete Config Export
// =============================================================================

/**
 * Full queue configuration object for BullMQ
 */
export const QUEUE_CONFIG = {
  // Worker settings
  concurrency: MAX_CONCURRENT_WORKERS,
  lockDuration: LOCK_DURATION_MS,
  maxStalledCount: MAX_STALLED_COUNT,
  
  // Job settings
  timeout: JOB_TIMEOUT_SECONDS * 1000,
  attempts: MAX_JOB_RETRIES,
  backoff: BACKOFF_CONFIG,
  
  // Cleanup settings
  removeOnComplete: {
    age: REMOVE_COMPLETED_AGE_SECONDS,
  },
  removeOnFail: {
    age: REMOVE_FAILED_AGE_SECONDS,
  },
} as const;
