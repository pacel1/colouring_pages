# Asset URL Strategy

## Decision: Public CDN URL (Option A) ✅

For MVP, we use **direct CDN URLs** for serving assets.

## Why CDN (Option A)?

| Aspect | CDN (A) | Proxy (B) |
|--------|---------|-----------|
| Performance | ⭐⭐⭐ Fast (no server load) | ⭐⭐ Slower (server load) |
| Cache | CDN automatic | Manual headers |
| Cost | R2 egress $0 | R2 egress $0 |
| SEO | ⭐⭐⭐ Excellent | ⭐⭐ Good |
| Implementation | Simple | More complex |

### Key Advantages:
1. **Faster page loads** - browser connects directly to CDN
2. **Lower server load** - Next.js doesn't serve files
3. **Better SEO** - faster LCP, Core Web Vitals
4. **Zero egress cost** - R2 doesn't charge for data transfer

---

## How It Works

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Worker        │ ───► │   R2 Storage    │ ───► │   CDN           │
│   (upload)      │      │                 │      │   (Cloudflare)  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                  │                         │
                                  │                         ▼
                                  │                ┌─────────────────┐
                                  │                │   Browser        │
                                  └──────────────►│   (direct)      │
                                                   └─────────────────┘
```

### Flow:
1. Worker generates image
2. Upload to R2 with key: `assets/{variant_id}.{format}`
3. R2 returns public URL: `https://cdn.example.com/assets/abc.png`
4. Store URL in DB
5. Browser loads image directly from CDN

---

## Database Schema

The `assets` table stores:

```typescript
{
  id: uuid,
  variant_id: uuid,      // Reference to variant
  storage_key: string,    // "assets/abc123.png"
  storage_url: string,    // "https://cdn.example.com/assets/abc123.png"
  mime_type: string,     // "image/png"
  file_size: number,     // bytes
  width: number,         // pixels
  height: number,        // pixels
  checksum: string,       // for deduplication
  created_at: timestamp
}
```

### Key Fields:
- `storage_key` - path in R2 bucket
- `storage_url` - full public URL (or generated on-demand)

---

## Cache Headers

### R2 + Cloudflare CDN

Assets are cached at the CDN level with:
```
Cache-Control: public, max-age=31536000, immutable
```

This means:
- CDN caches for 1 year
- Browser caches for 1 year
- No revalidation needed

### Why Immutable?
- Content-addressed URLs (variant_id in path)
- File never changes once created
- Safe to cache forever

---

## Alternative: Proxy Route (Option B)

If you need more control, use proxy:

```typescript
// apps/web/src/app/assets/[key]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  // Validate key
  if (!isValidKey(params.key)) {
    return new Response('Invalid key', { status: 400 });
  }
  
  // Fetch from R2
  const data = await storage.getObject(params.key);
  
  // Return with cache headers
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
      'Content-Type': 'image/png',
    },
  });
}
```

**When to use proxy:**
- Need dynamic URL signing
- Want to restrict access
- A/B testing different assets

---

## Security

### What We Store
- ✅ Public URLs (safe to expose)
- ✅ Storage keys (internal only)
- ❌ Access tokens (never)

### Public Access
R2 bucket should allow public read access for the assets prefix:
- Allow: `assets/*`
- Deny: Everything else

---

## Migration Path

If we ever need proxy:
1. Add proxy route in Next.js
2. Change `storage_url` generation in upload flow
3. DB migration not needed (we store keys)

The abstraction allows swapping strategies later.
