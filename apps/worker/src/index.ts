/**
 * Worker Entry Point
 * 
 * Background worker for processing BullMQ queue jobs.
 * Processes generate jobs: pending → processing → completed/failed
 * 
 * @see docs/WORKER_HOSTING_OPTIONS.md
 */

import { Worker } from 'bullmq';
import { validateEnv, workerRequired, isGenerationEnabled } from '@colouring-pages/shared/config/env';
import { db, jobs, items, eq } from '@colouring-pages/shared';
import { QUEUE_NAMES, RETRY_CONFIG } from '@colouring-pages/shared/queue';

/**
 * Get Redis connection config
 */
function getRedisConfig() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL is required for worker');
  }
  return { url: redisUrl };
}

/**
 * Process a generate coloring page job
 */
async function processGenerateJob(jobId: string, data: { itemId: string; prompt: string }): Promise<void> {
  console.log(`[${jobId}] Processing job for item: ${data.itemId}`);
  
  try {
    // Update job status to processing
    await db.update(jobs)
      .set({
        status: 'processing',
        startedAt: new Date(),
        attempts: 1,
      })
      .where(eq(jobs.id, jobId));
    
    console.log(`[${jobId}] Status updated to: processing`);
    
    // Get the item to process
    const item = await db.query.items.findFirst({
      where: eq(items.id, data.itemId),
    });
    
    if (!item) {
      throw new Error(`Item not found: ${data.itemId}`);
    }
    
    console.log(`[${jobId}] Processing item: ${item.titlePl}`);
    
    // Placeholder generation (replace with AI later)
    // For now, just mark as completed with placeholder data
    console.log(`[${jobId}] Generated placeholder result:`, {
      status: 'placeholder',
      generatedAt: new Date().toISOString(),
      itemId: data.itemId,
      prompt: data.prompt || item.prompt || '',
    });
    
    // Update job as completed
    await db.update(jobs)
      .set({
        status: 'completed',
        completedAt: new Date(),
        lastError: null,
      })
      .where(eq(jobs.id, jobId));
    
    // Mark item as published (for now - in real implementation this would be done after asset creation)
    // await db.update(items)
    //   .set({ isPublished: true, publishedAt: new Date() })
    //   .where(eq(items.id, data.itemId));
    
    console.log(`[${jobId}] Job completed successfully`);
    
  } catch (error) {
    console.error(`[${jobId}] Error processing job:`, error);
    
    // Update job status to failed
    await db.update(jobs)
      .set({
        status: 'failed',
        lastError: error instanceof Error ? error.message : String(error),
      })
      .where(eq(jobs.id, jobId));
    
    throw error; // Re-throw to trigger BullMQ retry
  }
}

/**
 * Main worker function
 */
async function main(): Promise<void> {
  console.log('🔄 Starting worker...');
  
  // Validate environment variables (fail-fast)
  const env = validateEnv(workerRequired);
  console.log('✅ Environment validated');
  console.log('📍 Node environment:', env.NODE_ENV);
  
  // Check if generation is enabled
  if (!isGenerationEnabled()) {
    console.log('⚠️  Generation is disabled via GENERATION_ENABLED env var');
    console.log('🛑 Worker shutting down');
    process.exit(0);
  }
  
  console.log('✅ Generation is enabled');
  
  // Initialize BullMQ worker
  const worker = new Worker(
    QUEUE_NAMES.GENERATION,
    async (job) => {
      console.log(`📥 Received job: ${job.id}, type: ${job.name}`);
      await processGenerateJob(job.id!, job.data);
    },
    {
      connection: getRedisConfig(),
      concurrency: parseInt(process.env.MAX_CONCURRENT_WORKERS || '5', 10),
      limiter: {
        max: parseInt(process.env.MAX_JOB_RETRIES || String(RETRY_CONFIG.maxAttempts), 10),
        duration: 60000, // 1 minute
      },
    }
  );
  
  // Worker event handlers
  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });
  
  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });
  
  worker.on('error', (err) => {
    console.error('💥 Worker error:', err);
  });
  
  console.log(`✅ Worker started, listening to queue: ${QUEUE_NAMES.GENERATION}`);
  console.log('📬 Waiting for jobs...');
}

/**
 * Handle graceful shutdown
 */
async function shutdown() {
  console.log('📴 Received shutdown signal, stopping worker...');
  
  try {
    // Close worker connections
    // Note: In a full implementation, we'd track the worker instance
    console.log('✅ Worker stopped');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Run worker
main().catch((error) => {
  console.error('❌ Worker failed to start:', error);
  process.exit(1);
});
