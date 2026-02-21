#!/usr/bin/env npx ts-node
/**
 * Prompt Harness - Test and iterate prompts
 * 
 * Usage:
 *   pnpm prompt:harness --topics=10
 *   pnpm prompt:harness --dry-run
 *   pnpm prompt:harness --topics=5 --prompt="custom prompt"
 */

import { parseArgs } from 'util';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// =============================================================================
// Types
// =============================================================================

interface HarnessResult {
  topic: string;
  status: 'success' | 'failed' | 'skipped';
  cost: number;
  timeMs: number;
  error: string | null;
  details?: Record<string, unknown>;
}

interface HarnessReport {
  timestamp: string;
  totalTopics: number;
  successful: number;
  failed: number;
  skipped: number;
  totalCost: number;
  totalTimeMs: number;
  dryRun: boolean;
  results: HarnessResult[];
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_TOPICS = [
  'lion',
  'cat',
  'dog',
  'butterfly',
  'flower',
  'car',
  'house',
  'tree',
  'fish',
  'bird',
];

const OUTPUT_DIR = 'reports';

// Cost per operation (approximate)
const COSTS = {
  image: 0.02,
  textPl: 0.0001,
  textEn: 0.0001,
};

// =============================================================================
// Mock Functions (for DRY_RUN)
// =============================================================================

async function mockGenerateText(topic: string, locale: string): Promise<{ cost: number; timeMs: number }> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    cost: COSTS[`text${locale === 'pl' ? 'Pl' : 'En'}` as keyof typeof COSTS] || 0.0001,
    timeMs: 100,
  };
}

async function mockGenerateImage(topic: string): Promise<{ cost: number; timeMs: number }> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    cost: COSTS.image,
    timeMs: 200,
  };
}

// =============================================================================
// Real Functions (when not DRY_RUN)
// =============================================================================

async function realGenerateText(topic: string, locale: string): Promise<{ cost: number; timeMs: number }> {
  // TODO: Call actual generateText function
  // For now, use mock
  return mockGenerateText(topic, locale);
}

async function realGenerateImage(topic: string): Promise<{ cost: number; timeMs: number }> {
  // TODO: Call actual generateImage function
  // For now, use mock
  return mockGenerateImage(topic);
}

// =============================================================================
// Main Harness
// =============================================================================

async function runHarness(options: {
  topics?: string[];
  dryRun: boolean;
  count?: number;
  prompt?: string;
}) {
  const { dryRun, count = 10, prompt } = options;
  const topics = options.topics || DEFAULT_TOPICS.slice(0, count);

  console.log(`
========================================
  PROMPT HARNESS - ${dryRun ? 'DRY RUN' : 'LIVE'}
========================================
  Topics: ${topics.length}
  Dry Run: ${dryRun}
  Prompt: ${prompt || 'default'}
========================================
  `);

  const results: HarnessResult[] = [];
  let totalCost = 0;
  let totalTimeMs = 0;

  for (const topic of topics) {
    const startTime = Date.now();
    console.log(`\n[${topic}] Starting...`);

    try {
      if (dryRun) {
        // Mock execution
        const textPl = await mockGenerateText(topic, 'pl');
        const textEn = await mockGenerateText(topic, 'en');
        const image = await mockGenerateImage(topic);

        const cost = textPl.cost + textEn.cost + image.cost;
        const timeMs = Date.now() - startTime;

        results.push({
          topic,
          status: 'success',
          cost,
          timeMs,
          error: null,
          details: {
            textPlCost: textPl.cost,
            textEnCost: textEn.cost,
            imageCost: image.cost,
          },
        });

        totalCost += cost;
        totalTimeMs += timeMs;

        console.log(`[${topic}] ✓ (mock) cost: $${cost.toFixed(4)}, time: ${timeMs}ms`);
      } else {
        // Real execution
        const textPl = await realGenerateText(topic, 'pl');
        const textEn = await realGenerateText(topic, 'en');
        const image = await realGenerateImage(topic);

        const cost = textPl.cost + textEn.cost + image.cost;
        const timeMs = Date.now() - startTime;

        results.push({
          topic,
          status: 'success',
          cost,
          timeMs,
          error: null,
        });

        totalCost += cost;
        totalTimeMs += timeMs;

        console.log(`[${topic}] ✓ cost: $${cost.toFixed(4)}, time: ${timeMs}ms`);
      }
    } catch (error) {
      const timeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      results.push({
        topic,
        status: 'failed',
        cost: 0,
        timeMs,
        error: errorMessage,
      });

      console.error(`[${topic}] ✗ Error:`, errorMessage);
    }
  }

  // Generate report
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;

  const report: HarnessReport = {
    timestamp: new Date().toISOString(),
    totalTopics: topics.length,
    successful,
    failed,
    skipped,
    totalCost,
    totalTimeMs,
    dryRun,
    results,
  };

  // Save report
  saveReport(report);

  console.log(`
========================================
  SUMMARY
========================================
  Total: ${topics.length}
  Success: ${successful}
  Failed: ${failed}
  Skipped: ${skipped}
  Cost: $${totalCost.toFixed(4)}
  Time: ${totalTimeMs}ms
========================================
  `);

  return report;
}

// =============================================================================
// Report Saving
// =============================================================================

function saveReport(report: HarnessReport) {
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const basePath = join(OUTPUT_DIR, `harness-${timestamp}`);

  // Save JSON
  const jsonPath = `${basePath}.json`;
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 JSON report: ${jsonPath}`);

  // Save Markdown
  const mdPath = `${basePath}.md`;
  const mdContent = generateMarkdownReport(report);
  writeFileSync(mdPath, mdContent);
  console.log(`📄 MD report: ${mdPath}`);
}

function generateMarkdownReport(report: HarnessReport): string {
  const lines = [
    `# Prompt Harness Report`,
    '',
    `**Timestamp:** ${report.timestamp}`,
    `**Dry Run:** ${report.dryRun ? 'Yes' : 'No'}`,
    '',
    `## Summary`,
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total Topics | ${report.totalTopics} |`,
    `| Successful | ${report.successful} |`,
    `| Failed | ${report.failed} |`,
    `| Total Cost | $${report.totalCost.toFixed(4)} |`,
    `| Total Time | ${report.totalTimeMs}ms |`,
    '',
    `## Results`,
    '',
    `| Topic | Status | Cost | Time | Error |`,
    `|-------|--------|------|------|-------|`,
  ];

  for (const result of report.results) {
    const statusIcon = result.status === 'success' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
    const error = result.error ? result.error.slice(0, 50) : '-';
    lines.push(`| ${result.topic} | ${statusIcon} | $${result.cost.toFixed(4)} | ${result.timeMs}ms | ${error} |`);
  }

  lines.push('');
  return lines.join('\n');
}

// =============================================================================
// CLI
// =============================================================================

async function main() {
  try {
    const { values } = parseArgs({
      options: {
        topics: { type: 'string', short: 't' },
        count: { type: 'string', short: 'c', default: '10' },
        dryRun: { type: 'boolean', short: 'd', default: false },
        prompt: { type: 'string', short: 'p' },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });

    if (values.help) {
      console.log(`
Prompt Harness - Test and iterate prompts

Usage:
  pnpm prompt:harness                    Run with default 10 topics
  pnpm prompt:harness --count 5         Run with 5 topics
  pnpm prompt:harness --dry-run          Run without AI (mock)
  pnpm prompt:harness --topics=lion,cat  Run with specific topics

Options:
  -c, --count     Number of topics (default: 10)
  -d, --dry-run   Run without AI calls (mock)
  -p, --prompt    Custom prompt template
  -t, --topics    Comma-separated topics
  -h, --help      Show this help
      `);
      process.exit(0);
    }

    let topics: string[] | undefined;
    if (values.topics) {
      topics = values.topics.split(',').map(t => t.trim());
    }

    await runHarness({
      topics,
      dryRun: values.dryRun ?? false,
      count: parseInt(values.count ?? '10', 10),
      prompt: values.prompt,
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
