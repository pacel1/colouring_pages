/**
 * Job Types - Typy zadań dla kolejki BullMQ
 * 
 * Definicje typów zadań, statusów i priorytetów.
 */

export type JobType = 'generate' | 'publish' | 'sitemap' | 'regenerate';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type JobPriority = 0 | 10 | 20 | 50 | 100;

export interface JobPayload {
  batchId: string;
  itemId?: string;
  variantId?: string;
  locale?: string;
  format?: string;
}

export interface JobResult {
  success: boolean;
  assetId?: string;
  storageUrl?: string;
  error?: string;
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  generate: 'Generowanie kolorowanki',
  publish: 'Publikacja',
  sitemap: 'Generowanie sitemap',
  regenerate: 'Regeneracja',
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'Oczekujące',
  processing: 'W trakcie',
  completed: 'Zakończone',
  failed: 'Niepowodzenie',
};

export const DEFAULT_JOB_CONFIG = {
  maxAttempts: 3,
  backoffBase: 1,
  maxBackoff: 30,
  priority: 100,
} as const;
