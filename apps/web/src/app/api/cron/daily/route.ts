/**
 * Daily Cron Job API Endpoint
 *
 * POST /api/cron/daily
 * Requires: X-Cron-Secret header
 * 
 * Generates daily batch of jobs for content generation.
 * Idempotent: running twice on same day only adds missing jobs.
 */

import { verifyCronSecret, unauthorizedResponse, jsonResponse } from '@/lib/api/auth';
import { headers } from 'next/headers';
import { db, jobs, items, eq, and, isNull, sql, desc } from '@colouring-pages/shared';
import { addJob, QUEUE_NAMES, JOB_TYPES, generateJobId } from '@colouring-pages/shared/queue';

// Default daily target
const DEFAULT_DAILY_TARGET = 300;

/**
 * POST /api/cron/daily
 */
export async function POST(): Promise<Response> {
  const headersList = await headers();
  const headerSecret = headersList.get('x-cron-secret');

  // Verify the secret
  if (!verifyCronSecret(headerSecret)) {
    return unauthorizedResponse('Missing or invalid CRON_SECRET');
  }

  const startTime = Date.now();
  
  try {
    // Get today's date string
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    
    // Generate batch ID: {date}-{shortuuid}
    const batchId = `${today}-${crypto.randomUUID().slice(0, 8)}`;
    
    // Check if we've already run today - find any jobs with this date prefix
    const existingBatchJobs = await db.query.jobs.findMany({
      where: sql`${jobs.batchId} LIKE ${today + '%'}`,
      limit: 1,
    });
    
    const alreadyRunToday = existingBatchJobs.length > 0;
    const existingBatchId = existingBatchJobs[0]?.batchId;
    
    // Get daily target from env
    const dailyTarget = parseInt(process.env.DAILY_TARGET || String(DEFAULT_DAILY_TARGET), 10);
    
    // Get items that need processing (not published, no failed jobs in last batch)
    const itemsToProcess = await db.query.items.findMany({
      where: and(
        eq(items.isPublished, false),
        isNull(items.publishedAt)
      ),
      orderBy: [desc(items.createdAt)],
      limit: dailyTarget,
    });
    
    // Filter out items that already have pending/processing jobs in today's batch
    let newJobsAdded = 0;
    let skippedAlreadyQueued = 0;
    
    if (alreadyRunToday && existingBatchId) {
      // Get items that already have jobs in today's batch
      const existingJobsForToday = await db.query.jobs.findMany({
        where: sql`${jobs.batchId} = ${existingBatchId}`,
      });
      const processedItemIds = new Set(existingJobsForToday.map(j => j.itemId));
      
      // Filter items - only process those not already queued today
      const itemsToAdd = itemsToProcess.filter(item => !processedItemIds.has(item.id));
      
      for (const item of itemsToAdd) {
        await createJobForItem(item, existingBatchId);
        newJobsAdded++;
      }
      skippedAlreadyQueued = itemsToProcess.length - itemsToAdd.length;
    } else {
      // First run today - create all jobs
      for (const item of itemsToProcess) {
        await createJobForItem(item, batchId);
        newJobsAdded++;
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`[cron/daily] batchId=${alreadyRunToday ? existingBatchId : batchId}, added=${newJobsAdded}, skipped=${skippedAlreadyQueued}, duration=${duration}ms`);
    
    return jsonResponse({
      success: true,
      batchId: alreadyRunToday ? existingBatchId : batchId,
      added: newJobsAdded,
      skipped: skippedAlreadyQueued,
      date: today,
      durationMs: duration,
    });
    
  } catch (error) {
    console.error('[cron/daily] Error:', error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
}

/**
 * Create a job for an item
 */
async function createJobForItem(item: { id: string; slug: string; prompt: string | null }, batchId: string): Promise<void> {
  // Insert job into DB
  await db.insert(jobs).values({
    batchId,
    jobType: 'generate',
    itemId: item.id,
    status: 'pending',
    priority: 100,
    attempts: 0,
    maxAttempts: 3,
    scheduledAt: new Date(),
  });
  
  // Also add to queue (optional - worker can pick from DB)
  // This provides real-time processing if worker is running
  try {
    await addJob(QUEUE_NAMES.GENERATION, JOB_TYPES.GENERATE, {
      itemId: item.id,
      prompt: item.prompt || '',
    }, {
      jobId: generateJobId(JOB_TYPES.GENERATE, { itemId: item.id, prompt: item.prompt || '' }),
    });
  } catch (queueError) {
    // Queue might not be available - that's ok, jobs are in DB
    console.warn('[cron/daily] Queue error (non-fatal):', queueError);
  }
}

/**
 * GET method - for health checks
 */
export async function GET(): Promise<Response> {
  return jsonResponse({
    status: 'ok',
    endpoint: '/api/cron/daily',
    method: 'POST with X-Cron-Secret header',
  });
}
