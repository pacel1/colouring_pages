/**
 * Database Health Check Endpoint
 * 
 * GET /api/health/db
 * 
 * Returns database connection status with latency.
 * Does not expose sensitive information.
 */

import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@colouring-pages/shared';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  
  try {
    // Run health check with timeout
    const timeoutPromise = new Promise<{ ok: false; latency: number; error: string }>(
      (_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
    );
    
    const healthResult = await Promise.race([
      checkDatabaseHealth(),
      timeoutPromise
    ]);
    
    if (healthResult.ok) {
      return NextResponse.json({
        status: 'ok',
        database: {
          connected: true,
          latency: healthResult.latency,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        status: 'error',
        database: {
          connected: false,
          latency: healthResult.latency,
          // Don't expose actual error message in production
          error: process.env.NODE_ENV === 'production' 
            ? 'Database connection failed' 
            : healthResult.error,
        },
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }
  } catch (error) {
    const latency = Date.now() - start;
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      status: 'error',
      database: {
        connected: false,
        latency,
        error: process.env.NODE_ENV === 'production' 
          ? 'Database connection failed' 
          : message,
      },
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
