#!/usr/bin/env npx tsx
/**
 * Content Validation CLI
 * 
 * Validate content JSON files for quality and safety.
 * 
 * Usage:
 *   pnpm validate-content --file data.json
 *   pnpm validate-content --dir ./content
 */

import { parseArgs } from 'util';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { validatePageText, logValidationResult } from '../packages/shared/src/validation/content';

async function main() {
  const { values } = parseArgs({
    options: {
      file: { type: 'string', short: 'f' },
      dir: { type: 'string', short: 'd' },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  if (values.help) {
    console.log(`
Content Validation CLI

Usage:
  pnpm validate-content --file <path>   Validate single file
  pnpm validate-content --dir <path>    Validate all JSON files in directory

Options:
  -f, --file   Path to JSON file
  -d, --dir    Path to directory with JSON files
  -h, --help   Show this help
    `);
    process.exit(0);
  }

  const results: { file: string; valid: boolean }[] = [];

  if (values.file) {
    console.log(`Validating: ${values.file}`);
    const content = readFileSync(values.file, 'utf-8');
    const data = JSON.parse(content);
    
    const result = validatePageText(data);
    logValidationResult(content, result);
    
    results.push({ file: values.file, valid: result.valid });
  } else if (values.dir) {
    console.log(`Scanning: ${values.dir}`);
    
    const files = readdirSync(values.dir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = join(values.dir, file);
      const stat = statSync(filePath);
      
      if (stat.isFile()) {
        console.log(`\n--- ${file} ---`);
        const content = readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        
        const result = validatePageText(data);
        logValidationResult(content, result);
        
        results.push({ file, valid: result.valid });
      }
    }
  } else {
    console.error('Error: Provide --file or --dir');
    process.exit(1);
  }

  // Summary
  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.length - validCount;
  
  console.log('\n========== SUMMARY ==========');
  console.log(`Total: ${results.length}`);
  console.log(`Valid: ${validCount}`);
  console.log(`Invalid: ${invalidCount}`);
  
  if (invalidCount > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
