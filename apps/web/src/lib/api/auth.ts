/**
 * API Authentication Utilities
 *
 * Shared utilities for verifying API secrets and auth headers
 */

import { constants } from 'http2';

/**
 * Get CRON_SECRET from environment
 */
export function getCronSecret(): string | undefined {
  return process.env.CRON_SECRET;
}

/**
 * Verify CRON_SECRET header against environment variable
 * Uses timing-safe comparison to prevent timing attacks
 */
export function verifyCronSecret(headerSecret: string | null): boolean {
  if (!headerSecret) {
    return false;
  }

  const cronSecret = getCronSecret();

  if (!cronSecret) {
    // If no secret configured, deny by default
    return false;
  }

  // Use timing-safe comparison
  return timingSafeEqual(headerSecret, cronSecret);
}

/**
 * Simple timing-safe string comparison
 * Note: In production, consider using crypto.timingSafeEqual()
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized'): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: constants.HTTP_STATUS_UNAUTHORIZED,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create not implemented response
 */
export function notImplementedResponse(message = 'Not Implemented'): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: constants.HTTP_STATUS_NOT_IMPLEMENTED,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create JSON response
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
