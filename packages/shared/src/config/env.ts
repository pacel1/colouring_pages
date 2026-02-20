/**
 * Environment Variables Validation
 * 
 * Walidacja zmiennych środowiskowych z fail-fast.
 * Użyj na początku aplikacji aby uniknąć cichych błędów.
 * 
 * @example
 * import { validateEnv } from '@colouring-pages/shared/config/env';
 * 
 * // Na początku app/worker
 * validateEnv();
 */

import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env file if exists
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// =============================================================================
// Schema - zdefiniuj tutaj wszystkie zmienne
// =============================================================================

const envSchema = z.object({
  // === APP / WEB ===
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  
  // === DATABASE (wymagane) ===
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // === QUEUE / REDIS (opcjonalne) ===
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // === STORAGE - R2 (opcjonalne) ===
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_PUBLIC_URL: z.string().optional(),
  
  // === AI - OpenAI (opcjonalne) ===
  OPENAI_API_KEY: z.string().optional(),
  
  // === LIMITY I KONTROLA KOSZTÓW ===
  GENERATION_ENABLED: z.string().default('true'),
  MAX_PAGES_PER_DAY: z.string().default('300'),
  MAX_JOB_RETRIES: z.string().default('3'),
  MAX_CONCURRENT_WORKERS: z.string().default('5'),
  MAX_ASSET_SIZE_BYTES: z.string().default('10485760'),
  MAX_QUEUE_SIZE: z.string().default('1000'),
  JOB_TIMEOUT_SECONDS: z.string().default('30'),
  BATCH_SIZE: z.string().default('300'),
  DAILY_BUDGET_USD: z.string().default('10'),
  
  // === SECURITY ===
  API_RATE_LIMIT: z.string().default('100'),
  JWT_SECRET: z.string().optional(),
  
  // === LOGGING ===
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// =============================================================================
// Typy - wygenerowane ze schemy
// =============================================================================

export type Env = z.infer<typeof envSchema>;

// =============================================================================
// Wymagane zmienne per komponent
// =============================================================================

/** Zmienne wymagane dla Web */
export const webRequired = ['DATABASE_URL'] as const;

/** Zmienne wymagane dla Worker */
export const workerRequired = ['DATABASE_URL', 'GENERATION_ENABLED'] as const;

/** Wszystkie opcjonalne z default */
export const optionalWithDefaults = [
  'NODE_ENV',
  'PORT',
  'GENERATION_ENABLED',
  'MAX_PAGES_PER_DAY',
  'MAX_JOB_RETRIES',
  'MAX_CONCURRENT_WORKERS',
  'MAX_ASSET_SIZE_BYTES',
  'MAX_QUEUE_SIZE',
  'JOB_TIMEOUT_SECONDS',
  'BATCH_SIZE',
  'DAILY_BUDGET_USD',
  'API_RATE_LIMIT',
  'LOG_LEVEL',
] as const;

// =============================================================================
// Walidacja
// =============================================================================

/**
 * Sprawdza czy wszystkie wymagane zmienne są ustawione
 * 
 * @param required - lista wymaganych zmiennych
 * @throws Error z czytelnym komunikatem jeśli brakuje zmiennych
 */
export function validateEnv(required: readonly string[] = webRequired): Env {
  // Parsuj ze schemy
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    // Formatuj błędy
    const errors = result.error.issues.map(issue => issue.path.join('.')).join(', ');
    throw new Error(`❌ Invalid environment variables: ${errors}`);
  }
  
  // Sprawdź wymagane
  const missing: string[] = [];
  
  for (const key of required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }
  
  // Jeśli brakuje wymaganych - fail-fast!
  if (missing.length > 0) {
    throw new Error(
      `❌ MISSING REQUIRED ENVIRONMENT VARIABLES:\n` +
      `   - ${missing.join('\n   - ')}\n\n` +
      `   Please copy .env.example to .env and fill in the values.\n` +
      `   See docs/SETUP_PORTALS.md for instructions.`
    );
  }
  
  // Zwróć zwalidowane środowisko
  return result.data;
}

/**
 * Sprawdza czy generacja jest włączona
 * Użyj przed uruchomieniem workera
 */
export function isGenerationEnabled(): boolean {
  return process.env.GENERATION_ENABLED === 'true';
}

/**
 * Pobiera limit z zmiennej środowiskowej jako liczbę
 */
export function getLimit(key: string, defaultValue: number): number {
  const value = process.env[key];
  const parsed = parseInt(value || '', 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// =============================================================================
// Helper do debugowania (bez sekretów!)
// =============================================================================

/**
 * Zwraca listę dostępnych zmiennych (bez wartości - bezpieczne do logowania)
 */
export function listEnvVars(): string[] {
  return Object.keys(process.env).filter(key => key !== 'PATH');
}

/**
 * Sprawdza czy zmienna istnieje (bezpieczne - nie loguje wartości)
 */
export function hasEnvVar(name: string): boolean {
  const value = process.env[name];
  return !!value && value.trim() !== '';
}

// =============================================================================
// Przykład użycia
// =============================================================================

/**
 * Przykład użycia w web app:
 * 
 * import { validateEnv, webRequired } from '@colouring-pages/shared/config/env';
 * 
 * // Na początku pliku index.ts
 * const env = validateEnv(webRequired);
 * console.log('Environment validated, NODE_ENV:', env.NODE_ENV);
 */

/**
 * Przykład użycia w worker:
 * 
 * import { validateEnv, workerRequired, isGenerationEnabled } from '@colouring-pages/shared/config/env';
 * 
 * const env = validateEnv(workerRequired);
 * 
 * if (!isGenerationEnabled()) {
 *   console.log('Generation is disabled via GENERATION_ENABLED env var');
 *   process.exit(0);
 * }
 */
