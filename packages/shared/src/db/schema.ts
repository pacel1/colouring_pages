/**
 * Database Schema - Schemat bazy danych Drizzle
 * 
 * Definicje tabel na podstawie docs/DATA_MODEL.md
 */

import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  boolean, 
  timestamp, 
  integer, 
  jsonb,
  pgEnum,
  serial
} from 'drizzle-orm/pg-core';

// =============================================================================
// Enums
// =============================================================================

export const localeEnum = pgEnum('locale', ['pl', 'en']);
export const formatEnum = pgEnum('format', ['svg', 'png', 'html']);
export const jobTypeEnum = pgEnum('job_type', ['generate', 'publish', 'sitemap', 'regenerate']);
export const jobStatusEnum = pgEnum('job_status', ['pending', 'processing', 'completed', 'failed']);
export const jobStepStatusEnum = pgEnum('job_step_status', ['pending', 'processing', 'completed', 'failed']);
export const stepNameEnum = pgEnum('step_name', ['generate_image', 'process_image', 'generate_text', 'upload_storage', 'finalize']);
export const logLevelEnum = pgEnum('log_level', ['debug', 'info', 'warn', 'error']);
export const moderationStatusEnum = pgEnum('moderation_status', ['pending', 'approved', 'rejected', 'needs_review']);

// =============================================================================
// Tables
// =============================================================================

// Categories table (forward declaration to avoid circular reference)
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  namePl: varchar('name_pl', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  descriptionPl: text('description_pl'),
  descriptionEn: text('description_en'),
  parentId: uuid('parent_id'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  titlePl: varchar('title_pl', { length: 255 }).notNull(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  categoryId: uuid('category_id').notNull(),
  prompt: text('prompt'),
  keywords: text('keywords').array(),
  ageMin: integer('age_min').default(3),
  ageMax: integer('age_max').default(10),
  difficulty: integer('difficulty').default(1),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  moderationStatus: moderationStatusEnum('moderation_status').default('pending'),
  moderationNote: text('moderation_note'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const variants = pgTable('variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  itemId: uuid('item_id').notNull(),
  locale: localeEnum('locale').notNull(),
  format: formatEnum('format').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  canonicalUrl: varchar('canonical_url', { length: 500 }).notNull(),
  metaTitle: varchar('meta_title', { length: 70 }),
  metaDescription: varchar('meta_description', { length: 160 }),
  ogImage: varchar('og_image', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  variantId: uuid('variant_id').notNull(),
  storageKey: varchar('storage_key', { length: 500 }).notNull(),
  storageUrl: varchar('storage_url', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 50 }).notNull(),
  fileSize: integer('file_size'),
  width: integer('width'),
  height: integer('height'),
  checksum: varchar('checksum', { length: 64 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  batchId: uuid('batch_id').notNull(),
  jobType: jobTypeEnum('job_type').notNull(),
  itemId: uuid('item_id'),
  status: jobStatusEnum('status').default('pending').notNull(),
  priority: integer('priority').default(100),
  attempts: integer('attempts').default(0),
  maxAttempts: integer('max_attempts').default(3),
  lastError: text('last_error'),
  backoffSeconds: integer('backoff_seconds').default(1),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  scheduledAt: timestamp('scheduled_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Job steps table - for pipeline checkpoint tracking
export const jobSteps = pgTable('job_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull(),
  stepName: stepNameEnum('step_name').notNull(),
  status: jobStepStatusEnum('status').default('pending').notNull(),
  checkpointData: jsonb('checkpoint_data'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Unique constraint for idempotency - each job can only run each step once
  uniqueJobStep: { columns: [table.jobId, table.stepName] },
}));

export const logs = pgTable('logs', {
  id: serial('id').primaryKey(),
  level: logLevelEnum('level').notNull(),
  source: varchar('source', { length: 100 }).notNull(),
  jobId: uuid('job_id'),
  message: text('message').notNull(),
  context: jsonb('context'),
  createdAt: timestamp('created_at').defaultNow(),
});

// =============================================================================
// Type Exports
// =============================================================================

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Variant = typeof variants.$inferSelect;
export type NewVariant = typeof variants.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Log = typeof logs.$inferSelect;
export type NewLog = typeof logs.$inferInsert;
