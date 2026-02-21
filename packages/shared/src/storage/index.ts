/**
 * Storage Module - Factory and exports
 * 
 * Unified storage interface for object storage operations.
 * Currently supports Cloudflare R2.
 * 
 * Usage:
 * import { createStorageClient } from '@colouring-pages/shared/storage';
 * 
 * const storage = createStorageClient();
 */

import type { StorageClient } from './types';
import { createR2Storage } from './r2';

export type { StorageClient, StorageConfig } from './types';
export { createR2Storage } from './r2';

/**
 * Create a storage client based on environment configuration
 * 
 * Currently only R2 is supported. This function will be extended
 * to support other providers (Blob, S3, etc.) in the future.
 */
export function createStorageClient(): StorageClient {
  // For now, always use R2
  // In the future, could check STORAGE_PROVIDER env var
  return createR2Storage();
}
