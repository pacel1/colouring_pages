/**
 * Database Connection - Połączenie z bazą danych
 * 
 * Użycie:
 * import { db } from '@colouring-pages/shared';
 * 
 * Zmienne środowiskowe:
 * - DATABASE_URL - dla serverless/web (z connection pool)
 * - DATABASE_URL_DIRECT - dla narzędzi/migracji (bez pool)
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Timeout settings for database connections
const DB_TIMEOUT = 5000; // 5 seconds
const DB_IDLE_TIMEOUT = 30000; // 30 seconds

/**
 * Get database connection string from environment
 * Falls back to default local connection for development
 */
function getConnectionString(): string {
  // Check for direct URL first (for tools/migrations)
  if (process.env.DATABASE_URL_DIRECT) {
    return process.env.DATABASE_URL_DIRECT;
  }
  
  // Then check for pooled URL (for web/serverless)
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Fallback to local development
  return 'postgresql://devuser:devpassword@localhost:5432/colouring_dev';
}

/**
 * Create PostgreSQL client with appropriate settings
 */
function createPostgresClient(connectionString: string, isServerless: boolean = true) {
  return postgres(connectionString, {
    // Connection pool settings
    max: isServerless ? 1 : 10,
    
    // Timeouts (in milliseconds)
    idle_timeout: DB_IDLE_TIMEOUT,
    connect_timeout: DB_TIMEOUT,
    
    // For serverless: prepare statements
    prepare: !isServerless,
    
    // Maximum lifetime of a connection (in milliseconds)
    // For serverless: close connections faster
    max_lifetime: isServerless ? 60000 : 3600000, // 1 min / 1 hour
  });
}

// Determine if we're in serverless mode (default true for safety)
const isServerless = process.env.NODE_ENV === 'production' || 
                     process.env.VERCEL === '1' ||
                     !process.env.DATABASE_URL_DIRECT;

// Create the client
const connectionString = getConnectionString();
const client = createPostgresClient(connectionString, isServerless);

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export schema
export { schema };

// Export types
export type Database = typeof db;

// Export client for direct queries if needed
export { client };

/**
 * Health check function - simple SELECT 1
 * Returns latency in milliseconds
 */
export async function checkDatabaseHealth(): Promise<{ ok: boolean; latency: number; error?: string }> {
  const start = Date.now();
  
  try {
    await client`SELECT 1`;
    const latency = Date.now() - start;
    
    return { ok: true, latency };
  } catch (error) {
    const latency = Date.now() - start;
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return { ok: false, latency, error: message };
  }
}
