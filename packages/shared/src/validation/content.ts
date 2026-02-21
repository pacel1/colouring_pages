/**
 * Content Validation
 * 
 * Validates AI-generated content for quality and safety.
 */

import { z } from 'zod';

// =============================================================================
// Forbidden Words (from CONTENT_POLICY)
// =============================================================================

const FORBIDDEN_PATTERNS = [
  // Violence
  /blood|gore|knife|gun|weapon|shooting|murder|kill/gi,
  // Adult content
  /nude|naked|erotic|sexy|adult/gi,
  // Drugs
  /drug|cocaine|heroin|marijuana|cigarette|alcohol|weed/gi,
  // Political/Religious (optional - can be relaxed)
  /politics|religion|church|mosque|temple/gi,
];

// =============================================================================
// Schema - Page Text
// =============================================================================

export const pageTextSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(50).max(1000),
  keywords: z.array(z.string().max(50)).min(3).max(10),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

export type PageText = z.infer<typeof pageTextSchema>;

// =============================================================================
// Validation Result
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

// =============================================================================
// Validate Page Text
// =============================================================================

/**
 * Validate page text content
 */
export function validatePageText(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Schema validation
  const schemaResult = pageTextSchema.safeParse(data);
  
  if (!schemaResult.success) {
    for (const issue of schemaResult.error.issues) {
      errors.push({
        field: issue.path.join('.'),
        message: issue.message,
        code: 'SCHEMA_ERROR',
      });
    }
    return { valid: false, errors, warnings };
  }

  const text = schemaResult.data;

  // 2. Check for forbidden words in title
  const titleLower = text.title.toLowerCase();
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(titleLower)) {
      errors.push({
        field: 'title',
        message: 'Title contains forbidden content',
        code: 'FORBIDDEN_CONTENT',
      });
    }
  }

  // 3. Check for forbidden words in description
  const descLower = text.description.toLowerCase();
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(descLower)) {
      errors.push({
        field: 'description',
        message: 'Description contains forbidden content',
        code: 'FORBIDDEN_CONTENT',
      });
    }
  }

  // 4. Check description word count
  const wordCount = text.description.split(/\s+/).filter(Boolean).length;
  if (wordCount < 50) {
    errors.push({
      field: 'description',
      message: `Description too short: ${wordCount} words (min: 50)`,
      code: 'TOO_SHORT',
    });
  }

  // 5. Check meta lengths
  if (text.metaTitle && text.metaTitle.length > 70) {
    warnings.push({
      field: 'metaTitle',
      message: `metaTitle too long: ${text.metaTitle.length} chars (max: 70)`,
    });
  }

  if (text.metaDescription && text.metaDescription.length > 160) {
    warnings.push({
      field: 'metaDescription',
      message: `metaDescription too long: ${text.metaDescription.length} chars (max: 160)`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// =============================================================================
// Validate JSON Structure
// =============================================================================

/**
 * Check if data is valid JSON
 */
export function isValidJson(data: string): boolean {
  try {
    JSON.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse JSON safely
 */
export function safeParseJson<T>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

// =============================================================================
// Validate Image Variants
// =============================================================================

export const imageVariantSchema = z.object({
  size: z.enum(['small', 'medium', 'large', 'xlarge']),
  format: z.enum(['png', 'svg', 'pdf']),
  width: z.number().positive(),
  height: z.number().positive(),
  url: z.string().url(),
});

export type ImageVariant = z.infer<typeof imageVariantSchema>;

/**
 * Validate image variant
 */
export function validateImageVariant(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const result = imageVariantSchema.safeParse(data);
  
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push({
        field: issue.path.join('.'),
        message: issue.message,
        code: 'SCHEMA_ERROR',
      });
    }
  }

  // Check minimum dimensions
  if (result.data) {
    if (result.data.width < 800 || result.data.height < 600) {
      warnings.push({
        field: 'dimensions',
        message: `Image too small: ${result.data.width}x${result.data.height} (min: 800x600)`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// =============================================================================
// Logging Helpers (no secrets!)
// =============================================================================

/**
 * Get short hash of content for logging (no secrets!)
 */
export function getContentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).slice(0, 8);
}

/**
 * Log validation result (safe - no secrets)
 */
export function logValidationResult(
  content: string,
  result: ValidationResult
): void {
  const hash = getContentHash(content);
  
  if (result.valid) {
    console.log(`[VALID] Content ${hash}: OK`);
  } else {
    console.error(`[INVALID] Content ${hash}:`);
    for (const error of result.errors) {
      console.error(`  - ${error.field}: ${error.message} (${error.code})`);
    }
  }
  
  if (result.warnings.length > 0) {
    console.warn(`[WARN] Content ${hash}:`);
    for (const warning of result.warnings) {
      console.warn(`  - ${warning.field}: ${warning.message}`);
    }
  }
}
