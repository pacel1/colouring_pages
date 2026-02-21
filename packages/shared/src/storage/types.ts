/**
 * Storage Module - Abstraction layer for object storage
 * 
 * This module provides a unified interface for object storage operations.
 * Currently implemented with Cloudflare R2.
 * 
 * Usage:
 * import { createStorageClient } from '@colouring-pages/shared/storage';
 * 
 * const storage = createStorageClient();
 * const url = await storage.putObject('images/foo.png', data, 'image/png');
 */

export interface StorageClient {
  /**
   * Upload a file to storage
   * @param key - The key/path of the object in storage
   * @param data - The binary data to upload
   * @param contentType - The MIME type of the file
   * @returns The public URL of the uploaded file
   */
  putObject(key: string, data: Uint8Array, contentType: string): Promise<string>;
  
  /**
   * Get the public URL for a stored file
   * @param key - The key/path of the object
   * @returns The public URL
   */
  getPublicUrl(key: string): string;
  
  /**
   * Check if a file exists in storage
   * @param key - The key/path of the object
   * @returns True if the file exists
   */
  exists(key: string): Promise<boolean>;
  
  /**
   * Delete a file from storage
   * @param key - The key/path of the object
   */
  delete(key: string): Promise<void>;
}

/**
 * Configuration for storage client
 */
export interface StorageConfig {
  /**
   * The storage provider to use
   * Currently only 'r2' is supported
   */
  provider: 'r2';
  
  /**
   * The name of the bucket
   */
  bucketName: string;
  
  /**
   * The public URL prefix for serving files
   */
  publicUrl: string;
  
  /**
   * Cloudflare R2 specific configuration
   */
  r2?: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}
