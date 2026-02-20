/**
 * Retry Module - Exponential backoff with jitter for external API calls
 * 
 * Provides unified retry logic for external API calls (AI models, storage, etc.)
 * 
 * Usage:
 * import { withRetry, RetryError, isRetryableError } from '@colouring-pages/shared/net/retry';
 * 
 * const result = await withRetry(() => callExternalAPI(), {
 *   maxAttempts: 3,
 *   timeout: 30000,
 * });
 */

// =============================================================================
// Error Types
// =============================================================================

/**
 * Base class for retry-related errors
 */
export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Error types that can trigger retry
 */
export const ErrorType = {
  RATE_LIMIT: 'RateLimitError',
  TIMEOUT: 'TimeoutError',
  SERVER_ERROR: 'ServerError',
  NETWORK_ERROR: 'NetworkError',
} as const;

export type ErrorTypeValue = typeof ErrorType[keyof typeof ErrorType];

/**
 * Classify error type from response or exception
 */
export function classifyError(error: unknown): ErrorTypeValue {
  if (error instanceof Error) {
    // Check for timeout errors
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      return ErrorType.TIMEOUT;
    }
    
    // Check for network errors
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      return ErrorType.NETWORK_ERROR;
    }
  }
  
  // Default to server error for unknown cases
  return ErrorType.SERVER_ERROR;
}

/**
 * Check if error is retryable based on HTTP status
 */
export function isRetryableHttpStatus(status: number): boolean {
  // Retry on rate limit (429) or server errors (5xx)
  return status === 429 || (status >= 500 && status < 600);
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors are always retryable
  const errorType = classifyError(error);
  if (errorType === ErrorType.TIMEOUT || errorType === ErrorType.NETWORK_ERROR) {
    return true;
  }
  
  // Check if it's an HTTP error with retryable status
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return isRetryableHttpStatus(status);
  }
  
  return false;
}

// =============================================================================
// Configuration
// =============================================================================

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 60000,
  jitterFactor: 0.3,
} as const;

export interface RetryConfig {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitterFactor?: number;
  timeoutMs?: number;
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

// =============================================================================
// Delay Calculation
// =============================================================================

/**
 * Calculate delay with exponential backoff and jitter
 * 
 * Formula: min(baseDelay * 2^attempt + random(0, baseDelay * jitter), maxDelay)
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const baseDelay = config.baseDelayMs ?? DEFAULT_RETRY_CONFIG.baseDelayMs;
  const maxDelay = config.maxDelayMs ?? DEFAULT_RETRY_CONFIG.maxDelayMs;
  const jitterFactor = config.jitterFactor ?? DEFAULT_RETRY_CONFIG.jitterFactor;
  
  // Exponential backoff
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * exponentialDelay * jitterFactor;
  
  // Cap at max delay
  return Math.min(exponentialDelay + jitter, maxDelay);
}

// =============================================================================
// Main Retry Function
// =============================================================================

/**
 * Execute function with retry logic
 * 
 * @param fn - Function to execute
 * @param config - Retry configuration
 * @returns Result of function execution
 * @throws RetryError if all retries exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const maxAttempts = config.maxAttempts ?? DEFAULT_RETRY_CONFIG.maxAttempts;
  const timeoutMs = config.timeoutMs;
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Execute with optional timeout
      if (timeoutMs) {
        return await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout exceeded')), timeoutMs)
          ),
        ]);
      }
      
      return await fn();
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorType = classifyError(error);
      
      // Check if we should retry
      if (attempt < maxAttempts - 1 && isRetryableError(error)) {
        const delayMs = calculateDelay(attempt, config);
        
        // Call onRetry callback if provided
        config.onRetry?.(attempt + 1, lastError, delayMs);
        
        // Log retry attempt
        console.log(`[retry] attempt=${attempt + 1}/${maxAttempts}, wait_ms=${Math.round(delayMs)}, error_type=${errorType}, error=${lastError.message}`);
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        // No more retries or non-retryable error
        throw lastError;
      }
    }
  }
  
  // Should not reach here, but just in case
  throw new RetryError(
    'All retry attempts exhausted',
    maxAttempts,
    lastError ?? new Error('Unknown error')
  );
}

// =============================================================================
// Timeout Helper
// =============================================================================

/**
 * Execute function with timeout
 * 
 * @param fn - Function to execute
 * @param timeoutMs - Timeout in milliseconds
 * @returns Result of function execution
 * @throws Error if timeout exceeded
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}
