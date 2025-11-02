# Logo URL Bucket Integration - Complete

## Overview
Updated the Site Branding settings to allow users to select the logo URL from bucket storage (MinIO) instead of only manually entering URLs.

## Changes Made

### File Modified
- `src/components/admin/settings/GeneralSettings.tsx`

### Modifications

1. **Added State Management**
   - Added `logoMediaPickerOpen` state to control the media picker modal for site logo
   - Separated from the existing `mediaPickerOpen` used for footer logo (egh_logo)

2. **Enhanced Logo URL Section**
   - Added "Select from Media Library" button to open media picker
   - Improved logo preview display with remove button
   - Preview now shows before the selection button (better UX)
   - Updated placeholder text to indicate both manual and media library options
   - Kept manual URL input as optional fallback

3. **Added Media Picker Modal**
   - Created separate MediaPickerModal instance for site logo (`logoMediaPickerOpen`)
   - Modal allows selecting images from any bucket folder
   - Displays with title "Select Site Logo"
   - Automatically updates the logo_url field when an image is selected

## Benefits

### 1. **Database Independence**
   - Logo images now stored in MinIO bucket
   - If database is erased/reset, logo files persist in bucket
   - Only URL reference stored in database (lightweight)

### 2. **Better User Experience**
   - Visual image picker instead of typing URLs
   - Preview of all available images in bucket
   - Search functionality within media library
   - Immediate visual feedback

### 3. **Consistency**
   - Matches the implementation already used for footer logo (egh_logo)
   - Same bucket management workflow across all image fields
   - Unified media management approach

## How It Works

1. User clicks "Select from Media Library" button
2. MediaPickerModal opens showing all images from bucket
3. User can search and browse images
4. Click on desired image to select it
5. Click "Select Image" to confirm
6. Logo URL field updates with bucket URL automatically
7. Preview displays immediately

## Fallback Options

Users still have flexibility:
- Can use Media Library (recommended)
- Can manually enter external URLs
- Can paste URLs from other sources
- Can clear and change logo anytime

## Related Components

- `MediaPickerModal` - Image selection modal
- `MediaLibraryClient` - Full media management
- MinIO bucket storage backend
- Settings API for saving logo URL

## Testing Recommendations

1. ✅ Open Settings → General tab
2. ✅ Click "Select from Media Library" under Logo URL
3. ✅ Verify modal opens with images from bucket
4. ✅ Select an image and confirm
5. ✅ Verify logo_url field updates
6. ✅ Verify preview displays correctly
7. ✅ Save settings and check logo displays on site
8. ✅ Test remove button functionality
9. ✅ Test manual URL input still works

## Notes

- Logo files should be uploaded to appropriate bucket folder (e.g., 'logos', 'branding', or 'products')
- Recommended logo formats: PNG, SVG, WebP (with transparency)
- Maximum recommended height: 100px for header display
- URLs are validated on load with error handling

---
**Status:** ✅ Complete  
**Date:** October 27, 2025  
**Files Changed:** 1  
**Lines Modified:** ~60
