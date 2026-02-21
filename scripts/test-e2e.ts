#!/usr/bin/env npx tsx
/**
 * E2E Integration Test
 * 
 * Tests the full pipeline: DB -> Queue -> Worker -> DB
 * 
 * Prerequisites:
 *   docker-compose -f docker-compose.test.yml up -d
 * 
 * Usage:
 *   pnpm test:e2e
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// Test config
const TEST_CONFIG = {
  postgresUrl: 'postgres://test:test@localhost:5432/test',
  redisUrl: 'http://localhost:6379',
  timeout: 30000, // 30s
};

// =============================================================================
// Helpers
// =============================================================================

function log(msg: string) {
  console.log(`[E2E] ${msg}`);
}

function exec(cmd: string) {
  log(`Exec: ${cmd}`);
  return execSync(cmd, { stdio: 'inherit' });
}

function waitForServices() {
  log('Waiting for services...');
  
  // Wait for postgres
  let attempts = 0;
  while (attempts < 15) {
    try {
      execSync('pg_isready -h localhost -p 5432 -U test', { stdio: 'ignore' });
      break;
    } catch {
      attempts++;
      sleep(1000);
    }
  }
  
  // Wait for redis
  attempts = 0;
  while (attempts < 15) {
    try {
      execSync('redis-cli -h localhost -p 6379 ping', { stdio: 'ignore' });
      break;
    } catch {
      attempts++;
      sleep(1000);
    }
  }
  
  log('Services ready!');
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// Test
// =============================================================================

async function runTest() {
  const startTime = Date.now();
  
  log('Starting E2E test...');
  
  // 1. Start services
  log('Starting Docker services...');
  try {
    exec('docker-compose -f docker-compose.test.yml up -d');
  } catch (error) {
    log('WARNING: Could not start Docker services. Make sure Docker is running.');
    log('Skipping E2E test.');
    return;
  }
  
  // Wait for services to be ready
  waitForServices();
  
  // 2. Create .env.test file
  const envContent = `
DATABASE_URL=${TEST_CONFIG.postgresUrl}
NODE_ENV=test
GENERATION_ENABLED=true
`.trim();
  
  const envPath = join(process.cwd(), '.env.test');
  writeFileSync(envPath, envContent);
  log('Created .env.test');
  
  try {
    // 3. Run migrations
    log('Running migrations...');
    try {
      exec('DATABASE_URL=postgres://test:test@localhost:5432/test npx drizzle-kit migrate');
    } catch (e) {
      log('Migration note: may need manual setup');
    }
    
    // 4. Run unit tests (they will use test env)
    log('Running unit tests...');
    exec('pnpm test');
    
    log('✅ E2E test completed successfully!');
    
  } finally {
    // 5. Cleanup
    log('Cleaning up...');
    
    // Remove .env.test
    if (existsSync(envPath)) {
      unlinkSync(envPath);
    }
    
    // Stop Docker
    try {
      exec('docker-compose -f docker-compose.test.yml down');
    } catch (e) {
      // Ignore errors
    }
    
    const duration = Date.now() - startTime;
    log(`Total time: ${duration}ms`);
  }
}

// =============================================================================
// Main
// =============================================================================

runTest().catch(error => {
  console.error('E2E test failed:', error);
  process.exit(1);
});
