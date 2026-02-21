import { pgTable, unique, uuid, varchar, integer, timestamp, text, boolean, serial, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const format = pgEnum("format", ['svg', 'png', 'html'])
export const jobStatus = pgEnum("job_status", ['pending', 'processing', 'completed', 'failed'])
export const jobStepStatus = pgEnum("job_step_status", ['pending', 'processing', 'completed', 'failed'])
export const jobType = pgEnum("job_type", ['generate', 'publish', 'sitemap', 'regenerate'])
export const locale = pgEnum("locale", ['pl', 'en'])
export const logLevel = pgEnum("log_level", ['debug', 'info', 'warn', 'error'])
export const moderationStatus = pgEnum("moderation_status", ['pending', 'approved', 'rejected', 'needs_review'])
export const stepName = pgEnum("step_name", ['generate_image', 'process_image', 'generate_text', 'upload_storage', 'finalize'])


export const assets = pgTable("assets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	variantId: uuid("variant_id").notNull(),
	storageKey: varchar("storage_key", { length: 500 }).notNull(),
	storageUrl: varchar("storage_url", { length: 500 }).notNull(),
	mimeType: varchar("mime_type", { length: 50 }).notNull(),
	fileSize: integer("file_size"),
	width: integer(),
	height: integer(),
	checksum: varchar({ length: 64 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("assets_checksum_unique").on(table.checksum),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: varchar({ length: 100 }).notNull(),
	namePl: varchar("name_pl", { length: 255 }).notNull(),
	nameEn: varchar("name_en", { length: 255 }).notNull(),
	descriptionPl: text("description_pl"),
	descriptionEn: text("description_en"),
	parentId: uuid("parent_id"),
	displayOrder: integer("display_order").default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("categories_slug_unique").on(table.slug),
]);

export const jobs = pgTable("jobs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	batchId: uuid("batch_id").notNull(),
	jobType: jobType("job_type").notNull(),
	itemId: uuid("item_id"),
	status: jobStatus().default('pending').notNull(),
	priority: integer().default(100),
	attempts: integer().default(0),
	maxAttempts: integer("max_attempts").default(3),
	lastError: text("last_error"),
	backoffSeconds: integer("backoff_seconds").default(1),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	scheduledAt: timestamp("scheduled_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const logs = pgTable("logs", {
	id: serial().primaryKey().notNull(),
	level: logLevel().notNull(),
	source: varchar({ length: 100 }).notNull(),
	jobId: uuid("job_id"),
	message: text().notNull(),
	context: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const variants = pgTable("variants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	itemId: uuid("item_id").notNull(),
	locale: locale().notNull(),
	format: format().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	canonicalUrl: varchar("canonical_url", { length: 500 }).notNull(),
	metaTitle: varchar("meta_title", { length: 70 }),
	metaDescription: varchar("meta_description", { length: 160 }),
	ogImage: varchar("og_image", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const items = pgTable("items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: varchar({ length: 255 }).notNull(),
	titlePl: varchar("title_pl", { length: 255 }).notNull(),
	titleEn: varchar("title_en", { length: 255 }).notNull(),
	categoryId: uuid("category_id").notNull(),
	prompt: text(),
	keywords: text().array(),
	ageMin: integer("age_min").default(3),
	ageMax: integer("age_max").default(10),
	difficulty: integer().default(1),
	isPublished: boolean("is_published").default(false),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	moderationStatus: moderationStatus("moderation_status").default('pending'),
	moderationNote: text("moderation_note"),
}, (table) => [
	unique("items_slug_unique").on(table.slug),
]);

export const jobSteps = pgTable("job_steps", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	jobId: uuid("job_id").notNull(),
	stepName: stepName("step_name").notNull(),
	status: jobStepStatus().default('pending').notNull(),
	checkpointData: jsonb("checkpoint_data"),
	errorMessage: text("error_message"),
	retryCount: integer("retry_count").default(0),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});
