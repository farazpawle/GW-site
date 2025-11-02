# Phase 14.5 Quick Reference

## Migration Summary
✅ **Completed:** October 17, 2025  
✅ **Status:** Fully functional single-bucket architecture

## Quick Commands

### Run Migration (if needed again)
```bash
npx tsx scripts/migrate-minio-to-single-bucket.ts
```

### Fix Double Prefix Issue (if needed)
```bash
npx tsx scripts/fix-minio-double-prefix.ts
```

### Access Media Library
Navigate to: **http://localhost:3000/admin/media**

## New Structure

```
garritwulf-media/
├── products/       (product images)
├── categories/     (category images)
└── general/        (general uploads)
```

## Key Changes

| Component | Old | New |
|-----------|-----|-----|
| **Buckets** | 3 separate | 1 with folders |
| **UI** | Bucket tabs | Folder dropdown |
| **Stats** | 3 cards | 2 cards |
| **Upload** | `uploadFile(bucket, key, ...)` | `uploadFile(key, ...)` |

## API Examples

### List Folders
```bash
GET /api/admin/media/buckets
```

### List Files in Folder
```bash
GET /api/admin/media/files?folder=products
```

### Upload File
```typescript
const key = `${FOLDERS.PRODUCTS}${filename}`;
await uploadFile(key, buffer, contentType);
```

## Testing Checklist

- [ ] Media library loads and shows folder dropdown
- [ ] Can switch between folders
- [ ] Search works within folders
- [ ] File URLs are correct
- [ ] Upload saves to correct folder
- [ ] Delete removes file properly

## Next Feature: Upload Source Selection

Goal: Add option to "Select from Internal Storage" when uploading product/category images.

This will allow users to:
1. Browse existing files in media library
2. Select and reuse uploaded images
3. Avoid duplicate uploads
