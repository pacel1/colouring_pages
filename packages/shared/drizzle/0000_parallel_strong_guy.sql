CREATE TYPE "public"."format" AS ENUM('svg', 'png', 'html');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('generate', 'publish', 'sitemap', 'regenerate');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('pl', 'en');--> statement-breakpoint
CREATE TYPE "public"."log_level" AS ENUM('debug', 'info', 'warn', 'error');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"storage_key" varchar(500) NOT NULL,
	"storage_url" varchar(500) NOT NULL,
	"mime_type" varchar(50) NOT NULL,
	"file_size" integer,
	"width" integer,
	"height" integer,
	"checksum" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "assets_checksum_unique" UNIQUE("checksum")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name_pl" varchar(255) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"description_pl" text,
	"description_en" text,
	"parent_id" uuid,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title_pl" varchar(255) NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"category_id" uuid NOT NULL,
	"prompt" text,
	"keywords" text[],
	"age_min" integer DEFAULT 3,
	"age_max" integer DEFAULT 10,
	"difficulty" integer DEFAULT 1,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"job_type" "job_type" NOT NULL,
	"item_id" uuid,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"priority" integer DEFAULT 100,
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 3,
	"last_error" text,
	"backoff_seconds" integer DEFAULT 1,
	"started_at" timestamp,
	"completed_at" timestamp,
	"scheduled_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" "log_level" NOT NULL,
	"source" varchar(100) NOT NULL,
	"job_id" uuid,
	"message" text NOT NULL,
	"context" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"format" "format" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"canonical_url" varchar(500) NOT NULL,
	"meta_title" varchar(70),
	"meta_description" varchar(160),
	"og_image" varchar(500),
	"created_at" timestamp DEFAULT now()
);
