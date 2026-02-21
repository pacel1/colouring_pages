#!/usr/bin/env npx tsx
/**
 * Daily Batch Simulation
 * 
 * Simulates 300 jobs/day to test pipeline throughput.
 * Uses MOCK AI - no real API calls.
 * 
 * Usage:
 *   pnpm simulate:batch
 *   tsx scripts/simulate-daily-batch.ts --jobs 300 --workers 3
 */

import { parseArgs } from 'util';

// =============================================================================
// Config
// =============================================================================

const DEFAULT_JOBS = 300;
const DEFAULT_WORKERS = 3;
const MOCK_DELAY_MS = 200; // Simulated AI delay

// =============================================================================
// Types
// =============================================================================

interface JobResult {
  jobId: string;
  status: 'success' | 'failed';
  durationMs: number;
  error?: string;
}

interface SimulationReport {
  timestamp: string;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  totalDurationMs: number;
  avgDurationPerJob: number;
  throughput: number; // jobs per second
  throughputPerMinute: number;
  workers: number;
  results: JobResult[];
}

// =============================================================================
// Mock Job Processing
// =============================================================================

async function processMockJob(jobId: string): Promise<JobResult> {
  const startTime = Date.now();
  
  try {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
    
    // Simulate occasional failures (5%)
    if (Math.random() < 0.05) {
      throw new Error('Mock AI failure');
    }
    
    return {
      jobId,
      status: 'success',
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      jobId,
      status: 'failed',
      durationMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// Run Simulation
// =============================================================================

async function runSimulation(options: {
  jobs: number;
  workers: number;
}) {
  const { jobs, workers } = options;
  
  console.log(`
========================================
  DAILY BATCH SIMULATION
========================================
  Jobs: ${jobs}
  Workers: ${workers}
  Mock delay: ${MOCK_DELAY_MS}ms
========================================
  `);
  
  const results: JobResult[] = [];
  const startTime = Date.now();
  
  // Create job queue
  const jobIds = Array.from({ length: jobs }, (_, i) => `job-${i + 1}`);
  
  // Process in batches (worker concurrency)
  for (let i = 0; i < jobIds.length; i += workers) {
    const batch = jobIds.slice(i, i + workers);
    
    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(jobId => processMockJob(jobId))
    );
    
    results.push(...batchResults);
    
    // Progress
    const progress = Math.min(i + workers, jobs);
    const percent = Math.round((progress / jobs) * 100);
    process.stdout.write(`\rProgress: ${progress}/${jobs} (${percent}%)`);
  }
  
  console.log('\n');
  
  const totalDurationMs = Date.now() - startTime;
  const successfulJobs = results.filter(r => r.status === 'success').length;
  const failedJobs = results.filter(r => r.status === 'failed').length;
  
  // Calculate metrics
  const throughput = jobs / (totalDurationMs / 1000); // jobs per second
  const throughputPerMinute = throughput * 60;
  const avgDurationPerJob = totalDurationMs / jobs;
  
  const report: SimulationReport = {
    timestamp: new Date().toISOString(),
    totalJobs: jobs,
    successfulJobs,
    failedJobs,
    totalDurationMs,
    avgDurationPerJob,
    throughput,
    throughputPerMinute,
    workers,
    results,
  };
  
  // Print summary
  console.log(`
========================================
  SUMMARY
========================================
  Total Jobs:      ${jobs}
  Successful:      ${successfulJobs} (${Math.round(successfulJobs/jobs*100)}%)
  Failed:          ${failedJobs} (${Math.round(failedJobs/jobs*100)}%)
  
  Duration:        ${(totalDurationMs / 1000).toFixed(1)}s
  Avg per job:     ${avgDurationPerJob.toFixed(0)}ms
  Throughput:      ${throughput.toFixed(1)} jobs/sec
  Throughput/min:  ${throughputPerMinute.toFixed(0)} jobs/min
========================================
  `);
  
  // Recommendations
  console.log('RECOMMENDATIONS:');
  console.log('');
  console.log(`| Workers | Est. time for 300 jobs |`);
  console.log(`|---------|------------------------|`);
  console.log(`| 1       | ~${Math.round(300 * 60 / 60)} min           |`);
  console.log(`| 3       | ~${Math.round(300 * 60 / 180)} min           |`);
  console.log(`| 5       | ~${Math.round(300 * 60 / 300)} min           |`);
  console.log(`| 10      | ~${Math.round(300 * 60 / 600)} min           |`);
  console.log('');
  console.log('✅ Suggested: 3-5 workers for 300 jobs/day');
  console.log('');
  
  return report;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const { values } = parseArgs({
    options: {
      jobs: { type: 'string', short: 'j', default: String(DEFAULT_JOBS) },
      workers: { type: 'string', short: 'w', default: String(DEFAULT_WORKERS) },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  if (values.help) {
    console.log(`
Daily Batch Simulation

Usage:
  pnpm simulate:batch                    Run with defaults (300 jobs, 3 workers)
  pnpm simulate:batch --jobs 100        Run with 100 jobs
  pnpm simulate:batch --workers 5       Run with 5 workers

Options:
  -j, --jobs     Number of jobs (default: 300)
  -w, --workers  Number of parallel workers (default: 3)
  -h, --help     Show this help
    `);
    process.exit(0);
  }

  const jobs = parseInt(values.jobs ?? String(DEFAULT_JOBS), 10);
  const workers = parseInt(values.workers ?? String(DEFAULT_WORKERS), 10);

  await runSimulation({ jobs, workers });
}

main().catch(console.error);
