/**
 * Health Check API Endpoint
 *
 * GET /api/health
 * Returns: { status: 'ok', timestamp: ISO string, uptime: number }
 */

// Track application start time
const startTime = Date.now();

/**
 * GET /api/health
 */
export function GET(): Response {
  const now = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  return Response.json({
    status: 'ok',
    timestamp: now,
    uptime: uptime,
  });
}
