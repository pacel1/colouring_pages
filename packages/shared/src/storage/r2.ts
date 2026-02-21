/**
 * Cloudflare R2 Storage Implementation
 * 
 * S3-compatible API for object storage with no egress fees.
 * 
 * Required environment variables:
 * - R2_ACCOUNT_ID
 * - R2_ACCESS_KEY_ID
 * - R2_SECRET_ACCESS_KEY
 * - R2_BUCKET_NAME
 * - R2_PUBLIC_URL
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import type { StorageClient } from './types';

/**
 * Create an R2 storage client
 */
export function createR2Storage(): StorageClient {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    throw new Error('Missing required R2 environment variables');
  }

  // Create S3 client configured for R2
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return {
    async putObject(key: string, data: Uint8Array, contentType: string): Promise<string> {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: Buffer.from(data),
        ContentType: contentType,
      });

      await client.send(command);
      
      // Return the public URL
      return `${publicUrl}/${key}`;
    },

    getPublicUrl(key: string): string {
      return `${publicUrl}/${key}`;
    },

    async exists(key: string): Promise<boolean> {
      try {
        const command = new HeadObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        
        await client.send(command);
        return true;
      } catch {
        return false;
      }
    },

    async delete(key: string): Promise<void> {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await client.send(command);
    },
  };
}
