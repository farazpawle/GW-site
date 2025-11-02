# Waves Background Integration

## Overview
Successfully integrated an interactive animated waves background into the Hero section of the Garrit Wulf website.

## Files Created/Modified

### 1. Created: `src/lib/utils.ts`
- Added the `cn()` utility function for conditional class merging
- Uses `clsx` and `tailwind-merge` for efficient className handling

### 2. Created: `src/components/ui/waves-background.tsx`
- Interactive animated waves component using Canvas API
- Features:
  - Perlin noise-based wave animation
  - Mouse/touch interaction with cursor following
  - Configurable wave properties (speed, amplitude, friction, tension)
  - TypeScript support with proper typing
  - Responsive design

### 3. Modified: `src/components/sections/HeroSection.tsx`
- Integrated Waves component as background
- Maintains all existing hero functionality:
  - Interactive text with mouse proximity effects
  - Premium badge
  - Statistics component
  - CTA buttons
- Waves animation runs behind all content

### 4. Modified: `tailwind.config.ts`
- Added `wave-pulse` animation keyframes
- Extended animation utilities

### 5. Installed Dependencies
- `clsx` - Utility for constructing className strings
- `tailwind-merge` - Merge Tailwind CSS classes without conflicts

## Wave Configuration
The waves are configured with brand colors:
- **Line Color**: `rgba(110, 0, 0, 0.2)` (brand red with transparency)
- **Wave Speed**: Slow, subtle movement
- **Amplitude**: Medium wave height
- **Cursor Interaction**: 120px radius with smooth following

## How It Works
1. The Waves component renders an HTML5 canvas
2. Perlin noise creates natural, flowing wave patterns
3. Mouse/touch movement influences wave behavior in proximity
4. Animation runs on requestAnimationFrame for smooth 60fps performance
5. Automatically resizes with viewport changes

## Benefits
- ✅ Enhances hero section with dynamic, interactive background
- ✅ Maintains brand colors (dark theme with red accents)
- ✅ Lightweight canvas-based animation
- ✅ Fully responsive and touch-enabled
- ✅ No performance impact on existing features
- ✅ Professional, modern aesthetic

## Usage
The Hero section is now a complete, self-contained component with:
- Animated wave background
- Interactive text effects
- Statistics display
- Call-to-action buttons
- Decorative blur elements

No additional configuration needed - it works out of the box!

## Customization
To adjust wave behavior, modify props in `HeroSection.tsx`:
```tsx
<Waves
  lineColor="rgba(110, 0, 0, 0.2)"  // Wave line color
  waveSpeedX={0.015}                 // Horizontal movement speed
  waveSpeedY={0.008}                 // Vertical movement speed
  waveAmpX={35}                      // Horizontal amplitude
  waveAmpY={18}                      // Vertical amplitude
  friction={0.92}                    // Cursor drag friction
  tension={0.008}                    // Wave tension/springiness
  maxCursorMove={120}                // Max cursor influence radius
  xGap={12}                          // Horizontal line spacing
  yGap={36}                          // Vertical line spacing
/>
```
