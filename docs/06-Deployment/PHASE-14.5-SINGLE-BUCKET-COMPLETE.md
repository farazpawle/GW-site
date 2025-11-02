# Phase 14.5: Single Bucket Migration - Complete

## 🎯 Overview

Successfully migrated from 3-bucket architecture to single-bucket with folder structure for simplified MinIO storage management.

---

## 📋 What Changed

### **Architecture Transformation**

**Before (3 Separate Buckets):**
```
MinIO Storage
├── product-images/
│   └── file.jpg
├── category-images/
│   └── file.jpg
└── user-uploads/
    └── file.pdf
```

**After (Single Bucket + Folders):**
```
MinIO Storage
└── garritwulf-media/
    ├── products/
    │   └── file.jpg
    ├── categories/
    │   └── file.jpg
    └── general/
        └── file.pdf
```

---

## 🔧 Technical Changes

### **1. Core MinIO Library** (`src/lib/minio.ts`)

**New Constants:**
```typescript
export const BUCKET_NAME = 'garritwulf-media';

export const FOLDERS = {
  PRODUCTS: 'products/',
  CATEGORIES: 'categories/',
  GENERAL: 'general/',
} as const;
```

**Updated Functions:**
- `uploadFile(key, file, contentType)` - Now accepts full key with folder prefix
- `deleteFile(key)` - Simplified to single bucket
- `listObjects(prefix?, maxKeys?)` - Lists files with optional folder filtering
- `fileExists(key)` - Checks file existence in single bucket
- `getBucketFromUrl(url)` - Always returns `BUCKET_NAME`

**New Helper:**
- `generateUniqueFilename(originalName)` - Creates timestamped unique filenames

**Legacy Support:**
- All old bucket-based functions retained with `@deprecated` tags
- Backward compatibility maintained for existing code

---

### **2. Upload API** (`src/app/api/admin/upload/route.ts`)

**Changes:**
```typescript
// Old
uploadFile(BUCKETS.PRODUCT_IMAGES, key, buffer, contentType)

// New
const key = `${FOLDERS.PRODUCTS}${uniqueFilename}`;
uploadFile(key, buffer, contentType)
```

**Benefits:**
- Simpler function signature
- Automatic folder prefix handling
- Consistent file organization

---

### **3. Media Library APIs**

#### **Buckets API** (`/api/admin/media/buckets/route.ts`)
- Lists folders instead of buckets
- Returns folder statistics (file count, size, last modified)
- Maps folder names: `products`, `categories`, `general`

#### **Files API** (`/api/admin/media/files/route.ts`)
- Supports `folder` query parameter (backward compatible with `bucket`)
- Folder mapping supports both new and legacy names
- Returns files with correct `garritwulf-media` bucket URLs

**Folder Name Mapping:**
```typescript
const folderMap = {
  'products': 'products/',
  'categories': 'categories/',
  'general': 'general/',
  // Legacy support
  'product-images': 'products/',
  'category-images': 'categories/',
  'user-uploads': 'general/',
};
```

---

### **4. UI Components**

#### **StorageStats Component**
- **Removed:** Bucket count stat
- **Kept:** Total Files and Storage Used
- **Changed:** 3-column grid → 2-column grid

#### **BucketTabs → FolderFilter**
- **Old:** Horizontal tabs for bucket switching
- **New:** Dropdown selector for folder filtering
- **UI:** Compact design with Folder icon
- **Shows:** File count per folder in dropdown options

#### **MediaLibraryClient**
- Updated terminology: `bucket` → `folder`
- Default folder: `products`
- API calls use `folder` parameter
- Delete operation includes folder context

---

## 🚀 Migration Scripts

### **1. Main Migration** (`scripts/migrate-minio-to-single-bucket.ts`)

**Features:**
- ✅ Creates new `garritwulf-media` bucket
- ✅ Copies all files from old buckets to new structure
- ✅ Deletes files from old buckets after successful copy
- ✅ Detailed progress logging with color-coded output
- ✅ Error handling and summary report

**Usage:**
```bash
npx tsx scripts/migrate-minio-to-single-bucket.ts
```

**Output:**
```
✓ Total files migrated: 9
✨ Migration completed!

New structure:
  garritwulf-media/
    ├── products/
    ├── categories/
    └── general/
```

---

### **2. Cleanup Script** (`scripts/fix-minio-double-prefix.ts`)

**Purpose:** Fixes double folder prefix issue (e.g., `products/products/file.jpg`)

**Features:**
- ✅ Detects files with duplicate folder prefixes
- ✅ Moves files to correct location
- ✅ Cleans up old duplicated paths

**Usage:**
```bash
npx tsx scripts/fix-minio-double-prefix.ts
```

---

## ✅ Completed Tasks

1. ✅ **Refactored MinIO core library** - Single bucket with folder prefixes
2. ✅ **Updated upload API** - Uses `FOLDERS.PRODUCTS` prefix
3. ✅ **Refactored media library APIs** - Folder-based filtering
4. ✅ **Updated UI components** - Removed bucket count, added folder dropdown
5. ✅ **Created migration scripts** - Automated data migration with cleanup

---

## 🧪 Testing Checklist

### **Media Library UI**
- [ ] Navigate to `/admin/media`
- [ ] Verify StorageStats shows 2 cards (Total Files, Storage Used)
- [ ] Check folder dropdown appears instead of tabs
- [ ] Select different folders and verify files display
- [ ] Search for files within a folder
- [ ] Copy file URL and verify format: `http://localhost:9000/garritwulf-media/products/file.jpg`
- [ ] Delete a file and verify removal

### **Product Upload**
- [ ] Navigate to `/admin/products/create`
- [ ] Upload product images
- [ ] Verify files saved to `garritwulf-media/products/`
- [ ] Check MinIO console to confirm correct structure

### **API Endpoints**
- [ ] `GET /api/admin/media/buckets` - Returns folder statistics
- [ ] `GET /api/admin/media/files?folder=products` - Lists product files
- [ ] `POST /api/admin/upload` - Uploads to products folder
- [ ] `DELETE /api/admin/media/files/:key?folder=products` - Deletes file

---

## 📊 Migration Results

**Files Migrated:** 9 product images  
**Buckets Cleaned:** 3 (product-images, category-images, user-uploads)  
**New Bucket Created:** `garritwulf-media`  
**Folder Structure:** ✅ Verified  

---

## 🔮 Next Steps

### **Phase 14.6: Upload Source Selection**
- [ ] Add "Upload from Device" vs "Select from Internal Storage" option
- [ ] Create media library picker modal
- [ ] Integrate with product/category image upload forms
- [ ] Allow selecting existing files from media library

---

## 🐛 Known Issues & Notes

1. **Old buckets still exist** - They are empty but not deleted. Can be manually removed from MinIO Console if desired.
2. **Backward compatibility** - Legacy API parameter `bucket` still works, maps to `folder` internally.
3. **URL format** - All file URLs now use `garritwulf-media` bucket name.

---

## 📝 Code Quality

- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ All functions properly typed
- ✅ Legacy functions marked `@deprecated`
- ✅ Comprehensive error handling
- ✅ Detailed logging in migration scripts

---

## 🎉 Success Metrics

- **Simplified Architecture:** 3 buckets → 1 bucket
- **Better Organization:** Flat structure → Folder-based hierarchy
- **Improved UX:** Tabs → Dropdown (cleaner interface)
- **Future-Ready:** Easier to add "Select from Internal Storage" feature
- **Maintainability:** Centralized storage management

---

**Completion Date:** October 17, 2025  
**Status:** ✅ **COMPLETE**  
**Migration:** ✅ **SUCCESSFUL**  
**Testing:** ⏳ **READY FOR USER TESTING**
