/**
 * Asset Types - Typy dla plików (assets)
 * 
 * Definicje typów plików, MIME types i rozmiarów.
 */

export type AssetType = 'image' | 'document' | 'archive';

export type MimeType = 
  | 'image/svg+xml'
  | 'image/png'
  | 'image/jpeg'
  | 'text/html'
  | 'application/zip';

export interface Asset {
  id: string;
  variantId: string;
  storageKey: string;
  storageUrl: string;
  mimeType: MimeType;
  fileSize?: number;
  width?: number;
  height?: number;
  checksum: string;
  createdAt: Date;
}

export interface AssetMetadata {
  width?: number;
  height?: number;
  colorSpace?: string;
  hasTransparency?: boolean;
}

export const MIME_TYPE_MAP: Record<string, MimeType> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.html': 'text/html',
  '.zip': 'application/zip',
};

export const MIME_TYPE_EXTENSIONS: Record<MimeType, string> = {
  'image/svg+xml': '.svg',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'text/html': '.html',
  'application/zip': '.zip',
};

export const MAX_ASSET_SIZES: Record<string, number> = {
  svg: 1024 * 1024,        // 1 MB
  png: 10 * 1024 * 1024,   // 10 MB
  html: 512 * 1024,        // 512 KB
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  image: 'Obraz',
  document: 'Dokument',
  archive: 'Archiwum',
};
