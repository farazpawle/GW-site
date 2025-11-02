# Phase 14: Media Library - MinIO File Browser

**Status:** 🚧 In Progress  
**Started:** October 17, 2025  
**Estimated Time:** 2-3 hours  
**Priority:** High  

---

## 📋 Overview

Building a custom media library page integrated into the admin panel to browse, manage, and organize files stored in MinIO buckets. This provides a professional file management interface similar to AWS S3 console or cPanel file manager.

---

## 🎯 Objectives

### Primary Goals
1. ✅ Visual file browser with thumbnail previews
2. ✅ Browse files across all 3 MinIO buckets
3. ✅ Search and filter functionality
4. ✅ File operations (delete, copy URL)
5. ✅ Storage statistics and usage metrics
6. ✅ Seamless admin panel integration

### User Benefits
- 🖼️ See all uploaded media at a glance
- 📊 Monitor storage usage and file counts
- 🔍 Quick file search and filtering
- 🗑️ Clean up unused files easily
- 📋 Copy file URLs for reference
- 🎨 Consistent admin panel experience

---

## 🏗️ Architecture

### Buckets Structure
```
MinIO (localhost:9000)
├── product-images/        # Product photos and thumbnails
│   ├── products/         # Uploaded via product form
│   └── ...
├── category-images/       # Category banner images
│   ├── categories/       # Uploaded via category form
│   └── ...
└── user-uploads/          # General admin uploads
    ├── misc/             # Miscellaneous files
    └── ...
```

### Component Structure
```
/admin/media (New Page)
├── MediaLibraryPage (Main container)
├── BucketTabs (Switch between buckets)
├── StorageStats (Usage statistics)
├── FileGrid (Thumbnail view)
├── FileList (Alternative list view)
├── FileCard (Individual file display)
├── SearchBar (Filter files)
├── UploadZone (Quick upload)
└── DeleteConfirmModal (Confirmation dialog)
```

### API Routes
```typescript
GET    /api/admin/media/buckets       // List all buckets with stats
GET    /api/admin/media/files         // List files in specific bucket
DELETE /api/admin/media/files/[key]   // Delete a file
POST   /api/admin/upload               // Already exists! ✅
```

---

## 📝 Implementation Plan

### Phase 1: Backend API (45 mins)

#### 1.1 List Buckets API
**File:** `src/app/api/admin/media/buckets/route.ts`

**Endpoint:** `GET /api/admin/media/buckets`

**Response:**
```json
{
  "success": true,
  "buckets": [
    {
      "name": "product-images",
      "fileCount": 47,
      "totalSize": 8473621,
      "lastModified": "2025-10-17T10:30:00Z"
    },
    {
      "name": "category-images",
      "fileCount": 12,
      "totalSize": 2145389,
      "lastModified": "2025-10-16T14:20:00Z"
    },
    {
      "name": "user-uploads",
      "fileCount": 5,
      "totalSize": 987234,
      "lastModified": "2025-10-15T09:15:00Z"
    }
  ],
  "stats": {
    "totalFiles": 64,
    "totalSize": 11606244,
    "totalSizeFormatted": "11.07 MB"
  }
}
```

**Functions needed:**
```typescript
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

// List all objects in bucket
async function listBucketContents(bucket: string)

// Calculate bucket statistics
async function getBucketStats(bucket: string)

// Format bytes to human readable
function formatBytes(bytes: number): string
```

---

#### 1.2 List Files API
**File:** `src/app/api/admin/media/files/route.ts`

**Endpoint:** `GET /api/admin/media/files?bucket=product-images&page=1&search=brake`

**Query Params:**
- `bucket` (required): Bucket name
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Files per page (default: 50)
- `search` (optional): Filter by filename

**Response:**
```json
{
  "success": true,
  "bucket": "product-images",
  "files": [
    {
      "key": "products/brake-pad-1729158423-a3f9d2.jpg",
      "url": "http://localhost:9000/product-images/products/brake-pad-1729158423-a3f9d2.jpg",
      "size": 187234,
      "sizeFormatted": "182.8 KB",
      "lastModified": "2025-10-17T10:30:00Z",
      "contentType": "image/jpeg",
      "isImage": true
    }
  ],
  "pagination": {
    "total": 47,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

**Functions needed:**
```typescript
import { ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';

// List files with pagination
async function listFiles(bucket: string, page: number, limit: number, search?: string)

// Get file metadata
async function getFileMetadata(bucket: string, key: string)

// Check if file is image
function isImageFile(contentType: string): boolean
```

---

#### 1.3 Delete File API
**File:** `src/app/api/admin/media/files/[key]/route.ts`

**Endpoint:** `DELETE /api/admin/media/files/[key]?bucket=product-images`

**Query Params:**
- `bucket` (required): Bucket name

**Path Params:**
- `key` (required): URL-encoded file key

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "key": "products/brake-pad-1729158423-a3f9d2.jpg"
}
```

**Functions needed:**
```typescript
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

// Delete file from bucket
async function deleteFile(bucket: string, key: string)

// Validate admin permissions
await requireAdmin();
```

---

#### 1.4 MinIO Library Updates
**File:** `src/lib/minio.ts`

**New exports needed:**
```typescript
// List all objects in bucket
export async function listObjects(
  bucket: string,
  prefix?: string,
  maxKeys?: number
): Promise<Array<{ key: string; size: number; lastModified: Date }>>

// Get object metadata
export async function getObjectMetadata(
  bucket: string,
  key: string
): Promise<{ size: number; contentType: string; lastModified: Date }>

// Format bytes to human-readable format
export function formatBytes(bytes: number, decimals = 2): string

// Get bucket from URL
export function getBucketFromUrl(url: string): string
```

---

### Phase 2: Frontend Components (1.5 hours)

#### 2.1 Media Library Page
**File:** `src/app/admin/media/page.tsx`

**Layout:**
```tsx
export default async function MediaLibraryPage() {
  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Media Library" 
        description="Browse and manage uploaded files"
      />
      
      <MediaLibraryClient />
    </div>
  );
}
```

---

#### 2.2 Media Library Client Component
**File:** `src/components/admin/media/MediaLibraryClient.tsx`

**State Management:**
```typescript
const [activeBucket, setActiveBucket] = useState('product-images');
const [files, setFiles] = useState<MediaFile[]>([]);
const [bucketStats, setBucketStats] = useState<BucketStats[]>([]);
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [searchTerm, setSearchTerm] = useState('');
const [loading, setLoading] = useState(true);
const [deleteModal, setDeleteModal] = useState<{ show: boolean; file?: MediaFile }>({ show: false });
```

**Features:**
- Fetch buckets and stats on mount
- Switch between buckets
- Toggle grid/list view
- Search files by name
- Delete file with confirmation
- Copy URL to clipboard
- Auto-refresh after operations

---

#### 2.3 Bucket Tabs Component
**File:** `src/components/admin/media/BucketTabs.tsx`

**Props:**
```typescript
interface BucketTabsProps {
  buckets: BucketInfo[];
  activeBucket: string;
  onBucketChange: (bucket: string) => void;
}
```

**Design:**
```tsx
<div className="flex gap-2 border-b border-[#2a2a2a]">
  {buckets.map(bucket => (
    <button
      key={bucket.name}
      className={`
        px-6 py-3 font-medium transition-all
        ${activeBucket === bucket.name 
          ? 'border-b-2 border-brand-maroon text-white' 
          : 'text-gray-400 hover:text-white'
        }
      `}
    >
      {formatBucketName(bucket.name)}
      <span className="ml-2 text-sm">({bucket.fileCount})</span>
    </button>
  ))}
</div>
```

---

#### 2.4 Storage Stats Component
**File:** `src/components/admin/media/StorageStats.tsx`

**Props:**
```typescript
interface StorageStatsProps {
  totalFiles: number;
  totalSize: number;
  bucketCount: number;
}
```

**Design:**
```tsx
<div className="grid grid-cols-3 gap-4">
  <StatCard
    icon={FileImage}
    label="Total Files"
    value={totalFiles.toString()}
    iconColor="#6e0000"
  />
  <StatCard
    icon={HardDrive}
    label="Storage Used"
    value={formatBytes(totalSize)}
    iconColor="#6e0000"
  />
  <StatCard
    icon={Database}
    label="Buckets"
    value={bucketCount.toString()}
    iconColor="#6e0000"
  />
</div>
```

---

#### 2.5 File Grid Component
**File:** `src/components/admin/media/FileGrid.tsx`

**Props:**
```typescript
interface FileGridProps {
  files: MediaFile[];
  onDelete: (file: MediaFile) => void;
  onCopyUrl: (url: string) => void;
}
```

**Design:**
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
  {files.map(file => (
    <FileCard
      key={file.key}
      file={file}
      onDelete={() => onDelete(file)}
      onCopyUrl={() => onCopyUrl(file.url)}
    />
  ))}
</div>
```

---

#### 2.6 File Card Component
**File:** `src/components/admin/media/FileCard.tsx`

**Design:**
```tsx
<div className="group relative aspect-square rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden hover:border-brand-maroon/50 transition-all">
  {/* Image Preview */}
  {file.isImage && (
    <Image src={file.url} alt={file.key} fill className="object-cover" />
  )}
  
  {/* Hover Overlay with Actions */}
  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
    <button onClick={onCopyUrl} title="Copy URL">
      <Copy className="w-5 h-5" />
    </button>
    <button onClick={onDelete} title="Delete">
      <Trash2 className="w-5 h-5 text-red-400" />
    </button>
  </div>
  
  {/* File Info Footer */}
  <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2">
    <p className="text-xs text-white truncate">{getFileName(file.key)}</p>
    <p className="text-xs text-gray-400">{file.sizeFormatted}</p>
  </div>
</div>
```

---

#### 2.7 File List Component (Alternative View)
**File:** `src/components/admin/media/FileList.tsx`

**Design:**
```tsx
<div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
  <table className="w-full">
    <thead className="bg-[#1a1a1a]">
      <tr>
        <th>Preview</th>
        <th>Name</th>
        <th>Size</th>
        <th>Modified</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {files.map(file => (
        <tr key={file.key}>
          <td>
            {file.isImage && (
              <Image src={file.url} width={48} height={48} />
            )}
          </td>
          <td>{file.key}</td>
          <td>{file.sizeFormatted}</td>
          <td>{formatDate(file.lastModified)}</td>
          <td>
            <button onClick={() => onCopyUrl(file.url)}>Copy URL</button>
            <button onClick={() => onDelete(file)}>Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

#### 2.8 Search Bar Component
**File:** `src/components/admin/media/SearchBar.tsx`

**Props:**
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

**Design:**
```tsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder || "Search files..."}
    className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] focus:border-brand-maroon"
  />
  {value && (
    <button
      onClick={() => onChange('')}
      className="absolute right-4 top-1/2 -translate-y-1/2"
    >
      <X className="w-5 h-5 text-gray-400" />
    </button>
  )}
</div>
```

---

#### 2.9 Delete Confirm Modal
**File:** `src/components/admin/media/DeleteConfirmModal.tsx`

**Design:**
```tsx
{show && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-md">
      <h3 className="text-xl font-bold mb-4">Delete File?</h3>
      <p className="text-gray-400 mb-6">
        Are you sure you want to delete this file? This action cannot be undone.
      </p>
      <p className="text-sm text-gray-500 mb-6 break-all">
        {file?.key}
      </p>
      <div className="flex gap-4">
        <button onClick={onCancel} className="flex-1 px-4 py-2 border rounded-lg">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-500 rounded-lg">
          Delete
        </button>
      </div>
    </div>
  </div>
)}
```

---

### Phase 3: Integration (30 mins)

#### 3.1 Update Admin Sidebar
**File:** `src/components/admin/Sidebar.tsx`

**Add new menu item:**
```tsx
{
  name: 'Media Library',
  href: '/admin/media',
  icon: FileImage, // or Image icon
  current: pathname === '/admin/media'
}
```

---

#### 3.2 Add TypeScript Types
**File:** `src/types/media.ts`

```typescript
export interface MediaFile {
  key: string;
  url: string;
  size: number;
  sizeFormatted: string;
  lastModified: string;
  contentType: string;
  isImage: boolean;
}

export interface BucketInfo {
  name: string;
  fileCount: number;
  totalSize: number;
  lastModified: string;
}

export interface BucketStats {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
}

export interface ListFilesResponse {
  success: boolean;
  bucket: string;
  files: MediaFile[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListBucketsResponse {
  success: boolean;
  buckets: BucketInfo[];
  stats: BucketStats;
}
```

---

#### 3.3 Update Documentation
**Files to update:**
- `memory-bank/systemPatterns.md` - Add Media Library pattern
- `memory-bank/techContext.md` - Add new API routes
- `memory-bank/activeContext.md` - Update current features

---

## 🎨 Design Specifications

### Color Scheme
```css
Background Primary: #0a0a0a
Background Secondary: #1a1a1a
Border Color: #2a2a2a
Brand Maroon: #6e0000
Text Primary: #ffffff
Text Secondary: #9ca3af
Success Green: #10b981
Error Red: #ef4444
```

### Spacing & Layout
- Container: `max-w-7xl mx-auto px-4 sm:px-6`
- Section Gap: `space-y-6`
- Grid Gap: `gap-4` or `gap-6`
- Card Padding: `p-4` or `p-6`

### Typography
- Page Title: `text-3xl font-bold`
- Section Title: `text-xl font-semibold`
- Body Text: `text-base`
- Small Text: `text-sm`
- Extra Small: `text-xs`

### Hover States
- Cards: `hover:scale-105 transition-all duration-300`
- Borders: `hover:border-brand-maroon/50`
- Buttons: `hover:bg-brand-maroon/10`

---

## 🧪 Testing Checklist

### Functionality Tests
- [ ] Browse each bucket (product-images, category-images, user-uploads)
- [ ] Search files by name
- [ ] Toggle between grid and list view
- [ ] Copy file URL to clipboard
- [ ] Delete file with confirmation
- [ ] Upload files through existing upload form
- [ ] View storage statistics
- [ ] Pagination works for large file lists

### UI/UX Tests
- [ ] Responsive on mobile, tablet, desktop
- [ ] Images load properly as thumbnails
- [ ] Hover states work smoothly
- [ ] Loading states display correctly
- [ ] Error messages are clear
- [ ] Success messages appear after operations
- [ ] Dark theme consistent with admin panel

### Performance Tests
- [ ] Fast loading with many files (50+)
- [ ] Smooth scrolling in grid view
- [ ] Quick search response
- [ ] Efficient API calls (no unnecessary requests)

### Security Tests
- [ ] Only admins can access `/admin/media`
- [ ] Authentication required for all API calls
- [ ] File deletion requires confirmation
- [ ] No XSS vulnerabilities in file names
- [ ] Proper error handling for invalid requests

---

## 📊 Success Metrics

### User Experience
- ✅ Admin can browse files in < 2 seconds
- ✅ Search returns results in < 1 second
- ✅ File operations complete in < 3 seconds
- ✅ Clear visual feedback for all actions

### Technical Performance
- ✅ API response time < 500ms
- ✅ Image thumbnails load progressively
- ✅ No memory leaks in client component
- ✅ Efficient file listing (pagination)

### Business Value
- ✅ Easy file management saves admin time
- ✅ Storage monitoring prevents overages
- ✅ Quick file cleanup reduces costs
- ✅ Professional interface improves confidence

---

## 🚀 Deployment Notes

### Environment Variables (Already Set ✅)
```env
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="garritwulf_minio"
MINIO_SECRET_KEY="garritwulf_minio_secure_2025"
```

### Docker Services Required
```bash
# Ensure MinIO is running
docker ps | grep minio

# If not running:
docker-compose -f docker-compose.dev.yml up -d minio
```

### Post-Deployment
1. Test all bucket access
2. Verify file operations
3. Check storage stats accuracy
4. Confirm responsive design
5. Test with real uploaded files

---

## 🔄 Future Enhancements (Optional)

### Phase 14.5 (If Needed Later)
- [ ] Bulk file operations (select multiple, delete all)
- [ ] File folders/organization within buckets
- [ ] Advanced search (by date, size, type)
- [ ] Image preview modal (full size)
- [ ] Image editing (crop, resize)
- [ ] File tags and metadata
- [ ] Usage tracking (which products use which images)
- [ ] Storage alerts (when approaching limits)
- [ ] Download multiple files as ZIP
- [ ] Direct file upload in media library

---

## 📝 Notes & Decisions

### Why This Approach?
1. **Custom UI** - Seamless admin panel integration
2. **Essential Features** - Everything needed, nothing extra
3. **Reasonable Scope** - Can complete in 2-3 hours
4. **Future-Proof** - Easy to add features later
5. **Professional** - Production-ready quality

### Trade-offs Made
- ✅ Grid view prioritized over list view (can add list later)
- ✅ Simple search (can add advanced filters later)
- ✅ Basic stats (can add charts/graphs later)
- ✅ Manual refresh (can add auto-refresh later)

### Technical Decisions
- Using AWS S3 SDK methods for MinIO compatibility
- Client-side component for interactivity
- Server-side API for security
- Pagination for performance with many files
- Image preview using Next/Image optimization

---

## ✅ Completion Criteria

Phase 14 is complete when:

1. ✅ All 3 API routes working (`/buckets`, `/files`, `/files/[key]`)
2. ✅ Media library page accessible at `/admin/media`
3. ✅ Can browse all 3 buckets
4. ✅ Can search and filter files
5. ✅ Can delete files with confirmation
6. ✅ Can copy URLs to clipboard
7. ✅ Storage statistics display correctly
8. ✅ Responsive design works on all devices
9. ✅ "Media Library" added to admin sidebar
10. ✅ All tests passing
11. ✅ Documentation updated

---

**Next Steps:** Begin implementation with Phase 1 (Backend API)

**Estimated Completion:** October 17, 2025 (Evening)
