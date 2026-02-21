# Storage Maintenance

## Problem

When jobs fail or are retried, we can end up with:

1. **Orphaned files**: File in R2 but no DB record
2. **Orphaned records**: DB record but file doesn't exist in R2

This can happen due to:
- Job failures during upload
- Retry after partial upload
- Database rollback
- Network errors

---

## Maintenance Strategy

### Approach: Monitor First, Delete Later

For MVP, we **don't auto-delete** anything. Instead:

1. **Dry-run by default** - find issues and report
2. **Manual cleanup** - admin decides what to delete
3. **Logging** - everything is logged for audit

---

## Maintenance Script

```bash
# Dry run - find issues without deleting
pnpm run cleanup-assets

# Execute cleanup (requires confirmation)
pnpm run cleanup-assets --execute
```

### What it checks:

1. **DB → Storage consistency**:
   - For each asset in DB, check if file exists in R2
   - Report: "Asset record exists but file missing: {storage_key}"

2. **Storage → DB consistency**:
   - List files in R2 bucket
   - Check if each has a DB record
   - Report: "File exists but no DB record: {storage_key}"

---

## Output Example

```
=== Storage Maintenance Report ===
Timestamp: 2024-01-15T03:00:00Z

=== DB → Storage Check ===
✅ All 150 DB records have corresponding files

=== Storage → DB Check ===
⚠️  Found 3 orphaned files:
  - assets/lion/pl_preview.png (created: 2024-01-14)
  - assets/cat/pl_preview.png (created: 2024-01-14)
  - assets/dog/pl_preview.png (created: 2024-01-13)

=== Summary ===
Orphaned files: 3
Orphaned records: 0
```

---

## Cron Job

Run daily at 3:00 AM:

```env
# .env
CRON_MAINTENANCE_SCHEDULE=0 3 * * *
```

### Endpoint:
```
GET /api/cron/maintenance
Headers:
  Authorization: Bearer <CRON_SECRET>
```

This endpoint runs the dry-run and logs results to console/DB.

---

## Manual Cleanup

If you need to delete orphaned files:

1. **Export the list** from maintenance report
2. **Review** each file manually
3. **Delete** via R2 dashboard or CLI:

```bash
# Cloudflare R2 CLI
r2 object delete colouring-pages-assets assets/lion/pl_preview.png
```

---

## Safety Features

- ✅ **No auto-delete** in MVP
- ✅ **Dry-run default** - no changes made
- ✅ **Confirmation required** for actual deletion
- ✅ **Full logging** - audit trail
- ✅ **Timestamp tracking** - know when issues occurred

---

## Future: Auto-Cleanup (Post-MVP)

After MVP, we could add:

```typescript
// Auto-cleanup config
AUTO_DELETE_ORPHANS=false  // default: disabled
AUTO_DELETE_AFTER_DAYS=30  // only delete files older than 30 days
```

But for now, manual review is safer.
