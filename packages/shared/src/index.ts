/**
 * @colouring-pages/shared
 * 
 * Współdzielone konfiguracje, typy i narzędzia.
 * 
 * Eksporty:
 * - config/env: walidacja zmiennych środowiskowych
 * - logger: standard logowania
 * - types: wspólne typy (Job, Content, Asset interfaces)
 * - db: schemat Drizzle (Category, Item, Variant, Asset, Job, Log)
 */

export * from './config/env';
export * from './logger';

// Re-export types with explicit names to avoid conflicts with DB types
export {
  type JobType,
  type JobStatus,
  type JobPriority,
  type JobPayload,
  type JobResult,
  JOB_TYPE_LABELS,
  JOB_STATUS_LABELS,
  DEFAULT_JOB_CONFIG,
} from './types/job';

export {
  type ContentLanguage,
  type ContentFormat,
  type Difficulty,
  type Category as ContentCategory,
  type Item as ContentItem,
  type Variant as ContentVariant,
  SUPPORTED_LANGUAGES,
  SUPPORTED_FORMATS,
  LANGUAGE_LABELS,
  FORMAT_LABELS,
  DIFFICULTY_LABELS,
} from './types/content';

export {
  type AssetType,
  type MimeType,
  type Asset as FileAsset,
  type AssetMetadata,
  MIME_TYPE_MAP,
  MIME_TYPE_EXTENSIONS,
  MAX_ASSET_SIZES,
  ASSET_TYPE_LABELS,
} from './types/asset';

// DB exports
export { db, schema, client, checkDatabaseHealth } from './db/index';
export type { Database } from './db/index';

// Drizzle ORM operators
export { eq, ne, gt, gte, lt, lte, like, ilike, inArray, notInArray, isNull, isNotNull, and, or, asc, desc, sql } from 'drizzle-orm';

// DB Schema exports
export {
  localeEnum,
  formatEnum,
  jobTypeEnum,
  jobStatusEnum,
  logLevelEnum,
  categories,
  items,
  variants,
  assets,
  jobs,
  logs,
  type Category,
  type NewCategory,
  type Item,
  type NewItem,
  type Variant,
  type NewVariant,
  type Asset,
  type NewAsset,
  type Job,
  type NewJob,
  type Log,
  type NewLog,
} from './db/schema';

// Queue exports
export * from './queue/index.js';

// Net exports (retry, http utilities)
export * from './net/retry.js';
