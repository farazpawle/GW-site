# 🚀 Media Library - Quick Start Guide

**Phase 14 Complete** - Your MinIO Media Library is ready to use!

---

## ✅ What's Ready

Your admin panel now has a **professional Media Library** where you can:
- 🖼️ Browse all uploaded files
- 🔍 Search files by name
- 📋 Copy URLs to clipboard
- 🗑️ Delete files with confirmation
- 📊 View storage statistics

---

## 🎯 Quick Access

1. **Open Admin Panel:**
   ```
   http://localhost:3001/admin
   ```

2. **Click "Media Library"** in the sidebar (Image icon)

3. **You're in!** Browse your files across all buckets.

---

## 📁 Buckets Available

### 1. Product Images
- Files uploaded via Product forms
- Location: `product-images/products/`
- Used for: Product photos and thumbnails

### 2. Category Images
- Files uploaded via Category forms
- Location: `category-images/categories/`
- Used for: Category banner images

### 3. User Uploads
- General admin uploads
- Location: `user-uploads/misc/`
- Used for: Miscellaneous files

---

## 🎨 Features

### Browse Files
- Switch between buckets using tabs
- Responsive grid (2-5 columns based on screen)
- Automatic image thumbnails
- File info on hover

### Search Files
- Type in search bar to filter
- Case-insensitive search
- Instant results
- Clear with X button

### Copy URL
- Hover over file card
- Click copy icon (📋)
- URL copied to clipboard
- Success message appears

### Delete File
- Hover over file card
- Click trash icon (🗑️)
- Confirm in modal
- File deleted & lists refresh

### View Stats
- Total files across all buckets
- Storage used (human-readable)
- Number of buckets

---

## 🐛 Troubleshooting

### No Files Showing?
- Make sure MinIO container is running: `docker ps | findstr minio`
- Upload files via Product or Category forms first
- Check MinIO console: `http://localhost:9001`

### Can't Delete Files?
- Ensure you're logged in as ADMIN
- Check browser console for errors
- Verify MinIO credentials in `.env.local`

### Images Not Loading?
- Check MinIO is accessible: `http://localhost:9000`
- Verify buckets exist (should auto-create)
- Run setup script: `npx tsx scripts/setup-minio.ts`

---

## 📸 Screenshots

### Main View
```
┌─────────────────────────────────────────────────┐
│  Media Library                                   │
├─────────────────────────────────────────────────┤
│  📊 Total Files: 47 | Storage: 11.07 MB         │
├─────────────────────────────────────────────────┤
│  [Product Images]  [Category Images]  [Uploads] │
├─────────────────────────────────────────────────┤
│  [Search: _______________]                       │
├─────────────────────────────────────────────────┤
│  [Grid of thumbnails with hover actions]         │
└─────────────────────────────────────────────────┘
```

---

## 🔗 Useful Links

- **Admin Panel:** http://localhost:3001/admin
- **Media Library:** http://localhost:3001/admin/media
- **MinIO Console:** http://localhost:9001
  - Username: `garritwulf_minio`
  - Password: `garritwulf_minio_secure_2025`

---

## 📚 Full Documentation

For complete technical details, see:
- `docs/MINIO-INTEGRATION-ANALYSIS.md` - Integration overview
- `docs/04-Implementation/PHASE-14-MEDIA-LIBRARY.md` - Full specification
- `docs/04-Implementation/PHASE-14-COMPLETE.md` - Completion report

---

## 🎉 You're All Set!

Your Media Library is production-ready. Start managing your files like a pro!

**Need help?** Check the full documentation or MinIO console for advanced features.
