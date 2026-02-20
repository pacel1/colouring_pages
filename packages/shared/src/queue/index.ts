/**
 * Queue Module - BullMQ integration
 * 
 * Centralized queue configuration and helpers.
 * 
 * Usage:
 * import { createQueue, getQueue, QUEUE_NAMES } from '@colouring-pages/shared/queue';
 */

import { Queue, QueueOptions } from 'bullmq';
import { RETRY_CONFIG, type JobData, type JobType } from './jobTypes.js';

// Queue names
export const QUEUE_NAMES = {
  GENERATION: 'generation',
  PUBLISHING: 'publishing',
  SITEMAP: 'sitemap',
} as const;

export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];

/**
 * Get Redis connection string from environment
 */
function getRedisUrl(): string {
  return process.env.REDIS_URL || 'redis://localhost:6379';
}

/**
 * Create a queue with standard configuration
 */
export function createQueue(name: QueueName, options?: QueueOptions): Queue<JobData> {
  const connection = {
    url: getRedisUrl(),
    // Don't log connection URL with password
    maxRetriesPerRequest: null,
  };

  return new Queue<JobData>(name, {
    connection,
    defaultJobOptions: {
      // Retry configuration
      attempts: RETRY_CONFIG.maxAttempts,
      backoff: {
        type: 'exponential' as const,
        firstDelay: RETRY_CONFIG.firstDelay,
        maxDelay: RETRY_CONFIG.maxDelay,
      },
      // Remove completed jobs after 24 hours
      removeOnComplete: {
        age: 86400,
      },
      // Remove failed jobs after 7 days
      removeOnFail: {
        age: 604800,
      },
    },
    ...options,
  });
}

// In-memory queue cache
const queueCache = new Map<QueueName, Queue<JobData>>();

/**
 * Get or create a queue instance
 * Caches queues to avoid creating multiple connections
 */
export function getQueue(name: QueueName): Queue<JobData> {
  if (!queueCache.has(name)) {
    queueCache.set(name, createQueue(name));
  }
  return queueCache.get(name)!;
}

/**
 * Add a job to the queue with idempotent job ID
 */
export async function addJob(
  queueName: QueueName,
  jobType: JobType,
  data: JobData,
  options?: {
    jobId?: string;
    priority?: number;
  }
): Promise<void> {
  const queue = getQueue(queueName);
  
  // Generate deterministic job ID for idempotency
  // Import dynamically to avoid circular deps
  const { generateJobId } = await import('./jobTypes.js');
  const jobId = options?.jobId || generateJobId(jobType, data);
  
  await queue.add(jobType, data, {
    jobId,
    priority: options?.priority,
  });
}

/**
 * Get queue health status
 */
export async function getQueueHealth(queueName: QueueName): Promise<{
  isHealthy: boolean;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}> {
  try {
    const queue = getQueue(queueName);
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);
    
    return {
      isHealthy: true,
      waiting,
      active,
      completed,
      failed,
    };
  } catch (error) {
    return {
      isHealthy: false,
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
    };
  }
}

/**
 * Close all queue connections
 * Call this during graceful shutdown
 */
export async function closeQueues(): Promise<void> {
  for (const queue of queueCache.values()) {
    await queue.close();
  }
  queueCache.clear();
}

// Export job types
export * from './jobTypes.js';
