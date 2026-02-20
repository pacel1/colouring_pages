/**
 * Admin Jobs Retry API
 * 
 * POST /api/admin/jobs/retry
 * Retry failed jobs manually
 */

import { headers } from 'next/headers';
import { jsonResponse, unauthorizedResponse } from '@/lib/api/auth';
import { db, jobs, logs, eq } from '@colouring-pages/shared';
import { addJob, QUEUE_NAMES, generateJobId } from '@colouring-pages/shared/queue';
import { MAX_JOB_RETRIES } from '@colouring-pages/shared/queue/config';

/**
 * Verify admin secret from header
 */
function verifyAdminSecret(headerSecret: string | null): boolean {
  if (!headerSecret) return false;
  
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;
  
  return headerSecret === adminSecret;
}

/**
 * POST - Retry failed jobs
 */
export async function POST(request: Request): Promise<Response> {
  const headersList = await headers();
  const adminSecret = headersList.get('x-admin-secret');
  
  // Verify admin secret
  if (!verifyAdminSecret(adminSecret)) {
    return unauthorizedResponse('Invalid or missing admin secret');
  }
  
  try {
    // Parse request body
    const contentType = headersList.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await request.json()
      : {};
    
    const { jobIds } = body as { jobIds?: string[] };
    
    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return jsonResponse({ error: 'jobIds array is required' }, 400);
    }
    
    const results: Array<{ jobId: string; success: boolean; message: string }> = [];
    
    for (const jobId of jobIds) {
      // Get the job
      const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, jobId),
      });
      
      if (!job) {
        results.push({ jobId, success: false, message: 'Job not found' });
        continue;
      }
      
      // Check if job is in failed status
      if (job.status !== 'failed') {
        results.push({ jobId, success: false, message: `Job status is ${job.status}, not failed` });
        continue;
      }
      
      // Check retry limit
      const currentAttempts = job.attempts || 0;
      const maxAttempts = job.maxAttempts || MAX_JOB_RETRIES;
      
      if (currentAttempts >= maxAttempts) {
        results.push({ jobId, success: false, message: `Max retries (${maxAttempts}) exceeded` });
        continue;
      }
      
      // Reset job status to pending and increment attempts
      await db.update(jobs)
        .set({
          status: 'pending',
          lastError: null,
          attempts: currentAttempts + 1,
          startedAt: null,
          completedAt: null,
        })
        .where(eq(jobs.id, jobId));
      
      // Add to queue
      try {
        const jobType = job.jobType as 'generate' | 'publish' | 'sitemap' | 'regenerate';
        
        await addJob(QUEUE_NAMES.GENERATION, jobType, {
          itemId: job.itemId || '',
          prompt: '',
        }, {
          jobId: generateJobId(jobType, { itemId: job.itemId || '', prompt: '' }),
        });
      } catch (queueError) {
        // Queue might not be available - still update DB
        console.warn('[admin/jobs/retry] Queue error:', queueError);
      }
      
      results.push({ jobId, success: true, message: 'Job requeued successfully' });
    }
    
    // Log to audit
    const successCount = results.filter(r => r.success).length;
    await db.insert(logs).values({
      level: 'info',
      source: 'admin',
      message: `Retried ${successCount}/${jobIds.length} jobs by manual`,
      context: { jobIds, results },
    });
    
    return jsonResponse({
      success: true,
      retried: successCount,
      failed: jobIds.length - successCount,
      results,
    });
    
  } catch (error) {
    console.error('[admin/jobs/retry] Error:', error);
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
}

/**
 * GET - Health check
 */
export async function GET(): Promise<Response> {
  return jsonResponse({
    status: 'ok',
    endpoint: '/api/admin/jobs/retry',
    method: 'POST with x-admin-secret header',
  });
}
