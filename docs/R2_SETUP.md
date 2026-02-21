# Cloudflare R2 Setup Guide

## Quick Setup

### 1. Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **R2** from the sidebar
3. Click **Create Bucket**
4. Name: `colouring-pages-assets` (or your preferred name)
5. Click **Create Bucket**

### 2. Add Custom Domain (Optional)

If you want a custom domain:

1. Go to your bucket settings
2. Click **Settings** → **Public Access**
3. Click **Connect Domain**
4. Enter your subdomain (e.g., `assets.yourdomain.com`)
5. Follow the instructions to add CNAME record

### 3. Generate API Token

1. Go to **R2** → **Manage API Tokens**
2. Click **Create API Token**
3. Use **Edit** template or create custom with:
   - **Object Read** ✅
   - **Object Write** ✅
   - **Object Delete** ✅
   - **List Buckets** ✅
4. Click **Create**
5. **IMPORTANT**: Copy the token immediately - it won't be shown again!

### 4. Get Account ID

1. Go to **Overview** page in Cloudflare sidebar
2. Copy the **Account ID** from the URL or overview

### 5. Configure Environment Variables

Add to your `.env` file:

```env
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=colouring-pages-assets
R2_PUBLIC_URL=https://pub-your-account.r2.dev
```

**Note**: Replace values with your actual credentials. Never commit these to Git!

### 6. Get Public URL

**Option A: Custom Domain** (recommended for production)
```
R2_PUBLIC_URL=https://assets.yourdomain.com
```

**Option B: R2 Generated URL**
```
R2_PUBLIC_URL=https://pub-your-account.r2.dev
```

**Option C: No Public URL** - Use proxy
If you don't configure public URL, files will be served through your Next.js API.

---

## Testing Locally

1. Set the environment variables in `.env`
2. Test upload:
```typescript
import { createStorageClient } from '@colouring-pages/shared/storage';

const storage = createStorageClient();
const url = await storage.putObject('test/hello.txt', new TextEncoder().encode('Hello'), 'text/plain');
console.log('Uploaded to:', url);
```

---

## Security Best Practices

### Token Permissions
- Use minimum required permissions
- Restrict to specific bucket if possible
- Rotate tokens periodically

### Environment Variables
- Never commit to Git
- Use `.env.example` for template
- Use secrets management in production (Vercel, etc.)

### Bucket Settings
- Enable versioning if needed
- Set lifecycle rules for cleanup
- Consider CORS settings for web access

---

## Troubleshooting

### "Access Denied"
- Check token has correct permissions
- Verify bucket name matches

### "No public access"
- Check Public Access settings in bucket
- Or configure custom domain

### "Invalid credentials"
- Verify Account ID is correct
- Check token hasn't expired

---

## Costs

R2 Pricing:
- Storage: $0.015/GB/month
- Class A Operations (PUT, COPY, POST, LIST): $0.00
- Class B Operations (GET, SELECT, HEAD): $0.09/1M requests
- **Egress: $0.00** (no bandwidth fees!)

Free Tier:
- 1 GB storage
- 1M Class A operations
- 1M Class B operations
