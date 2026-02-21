# Storage Decision - Cloudflare R2

## Decision: R2 ✅

After evaluating options, we chose **Cloudflare R2** as our primary storage provider.

## Why R2?

### Pricing
| Feature | R2 | Vercel Blob |
|---------|-----|-------------|
| Storage | $0.015/GB | $0.015/GB |
| PUT | $0.00 | $0.19/1M |
| GET | $0.09/1M | $0.19/1M |
| Egress | **$0.00** | Standard bandwidth |

**Key advantage**: No egress fees - critical for serving many images!

### Features
- S3-compatible API
- 1GB free storage
- 1M GET requests/month free
- Zero egress fees
- Global CDN

## Architecture

```
┌─────────────────┐      ┌─────────────────┐
│   Worker        │ ───► │   Cloudflare    │
│   (generates)   │      │   R2 Storage   │
└─────────────────┘      └─────────────────┘
                                   │
                                   ▼
                            ┌─────────────────┐
                            │   Public URL    │
                            │   (CDN cached)  │
                            └─────────────────┘
```

## Implementation

The storage is abstracted through a unified interface:

```typescript
import { createStorageClient } from '@colouring-pages/shared/storage';

const storage = createStorageClient();

// Upload
const url = await storage.putObject('images/foo.png', data, 'image/png');

// Get URL
const publicUrl = storage.getPublicUrl('images/foo.png');

// Check exists
const exists = await storage.exists('images/foo.png');

// Delete
await storage.delete('images/foo.png');
```

## Environment Variables

```env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=colouring-pages-assets
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

## Security

- Token has write-only permissions to R2 bucket
- No token exposed to client
- Public URL served through CDN

## Future Considerations

If we ever need to migrate:
- R2 is S3-compatible → easy migration
- Abstract interface allows swapping providers
- Just implement `StorageClient` interface for new provider
