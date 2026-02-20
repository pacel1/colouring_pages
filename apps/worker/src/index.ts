/**
 * Worker Entry Point
 * 
 * Background worker for processing BullMQ queue jobs.
 * Placeholder - gotowy do integracji z kolejką zadań.
 * 
 * @see docs/WORKER_HOSTING_OPTIONS.md
 */

import { validateEnv, workerRequired, isGenerationEnabled } from '@colouring-pages/shared/config/env';

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
  
  // TODO: Initialize BullMQ worker here
  // import { Worker } from 'bullmq';
  // const worker = new Worker('queue-name', async job => { ... });
  
  console.log('✅ worker started');
  
  // Keep worker running
  // In production, this would be replaced by actual queue processing
  console.log('📬 Waiting for jobs...');
}

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Run worker
main().catch((error) => {
  console.error('❌ Worker failed to start:', error);
  process.exit(1);
});
