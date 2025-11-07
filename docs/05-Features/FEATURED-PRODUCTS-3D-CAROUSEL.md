# Featured Products Section - 3D Carousel

## Overview
An interactive 3D carousel showcasing featured products on the homepage, positioned after the Categories Section.

## Features
- **3D Rotation**: Drag horizontally to rotate the carousel in 3D space
- **Click to Expand**: Click on any product to view detailed information in a modal
- **Responsive Design**: Automatically adjusts cylinder width for mobile devices
- **Smooth Animations**: Powered by Framer Motion for fluid transitions
- **Database Integration**: Fetches featured products from the database

## Components

### 1. ThreeDPhotoCarousel (`src/components/ui/3d-carousel.tsx`)
Reusable UI component that creates a 3D cylindrical carousel.

**Props:**
- `items`: Array of CarouselItem objects
- `onItemClick`: Optional callback when an item is clicked

**CarouselItem Interface:**
```typescript
interface CarouselItem {
  id: string
  imageUrl: string
  title: string
  price?: string
  partNumber?: string
}
```

### 2. FeaturedProductsSection (`src/components/sections/FeaturedProductsSection.tsx`)
Server component that fetches featured products and renders the carousel.

**Features:**
- Fetches up to 12 published featured products
- Orders by `showcaseOrder` field
- Transforms product data to carousel format
- Includes stats bar and call-to-action

### 3. FeaturedProductsClient (`src/components/sections/FeaturedProductsClient.tsx`)
Client component wrapper for handling navigation.

## Database Requirements

Products must have:
- `published: true`
- `featured: true`
- At least one image in the `images` array (uses Unsplash placeholder if none)

## Marking Products as Featured

### Via Prisma Studio:
```bash
npm run db:studio
```
Then edit products and set `featured = true`

### Via SQL:
```sql
UPDATE parts 
SET featured = true, showcase_order = 1 
WHERE part_number = 'YOUR-PART-NUMBER';
```

### Via API/Admin Panel:
Use the admin dashboard to mark products as featured.

## Customization

### Change Number of Products:
Edit `FeaturedProductsSection.tsx`:
```typescript
take: 12, // Change this number
```

### Adjust Carousel Size:
Edit `3d-carousel.tsx`:
```typescript
const cylinderWidth = isScreenSizeSm ? 1100 : 1800
```

### Modify Colors:
The section uses the brand color `#6e0000` (burgundy red). Search and replace to change.

## Usage Example

```tsx
import FeaturedProductsSection from "@/components/sections/FeaturedProductsSection";

export default function HomePage() {
  return (
    <div>
      {/* Other sections */}
      <FeaturedProductsSection />
      {/* More sections */}
    </div>
  );
}
```

## Performance Notes
- Server-side data fetching (no client-side loading)
- Images should be optimized (consider using Next.js Image component)
- Carousel uses CSS 3D transforms for smooth performance
- Limited to 12 products to maintain performance

## Dependencies
- `framer-motion`: ^12.23.24 (already installed)
- `lucide-react`: For icons (already installed)
- `@prisma/client`: Database access (already installed)

## Troubleshooting

**No products showing?**
- Ensure products have `published: true` AND `featured: true`
- Check database connection
- View console for errors

**Images not loading?**
- Verify product `images` array has valid URLs
- Check if images are publicly accessible
- Fallback uses Unsplash placeholder

**Carousel not dragging?**
- Ensure JavaScript is enabled
- Check browser console for Framer Motion errors
- Verify client component is properly hydrated
