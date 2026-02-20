/**
 * Daily Cron Job API Endpoint
 *
 * GET /api/cron/daily
 * Requires: X-Cron-Secret header
 * 
 * This is a placeholder endpoint - actual implementation coming later
 */

import { verifyCronSecret, unauthorizedResponse, notImplementedResponse } from '@/lib/api/auth';
import { headers } from 'next/headers';

/**
 * GET /api/cron/daily
 */
export async function GET(): Promise<Response> {
  const headersList = await headers();
  const headerSecret = headersList.get('x-cron-secret');

  // Verify the secret
  if (!verifyCronSecret(headerSecret)) {
    return unauthorizedResponse('Missing or invalid CRON_SECRET');
  }

  // Placeholder - not implemented yet
  return notImplementedResponse('Daily cron job not implemented yet');
}
