# Splash Cursor WebGL Fluid Simulation Integration

## Overview
Successfully integrated a WebGL-powered fluid simulation cursor effect that appears globally across the entire website. The effect creates beautiful, interactive liquid-like trails that follow mouse/touch movements.

## Files Created/Modified

### 1. Created: `src/components/ui/splash-cursor.tsx`
- WebGL fluid dynamics simulation component
- Features:
  - Real-time fluid physics simulation
  - Perlin noise-based color generation
  - Mouse and touch interaction support
  - Configurable simulation parameters
  - Transparent overlay that doesn't block interactions
  - Optimized rendering with WebGL2 fallback to WebGL1

### 2. Modified: `src/app/layout.tsx`
- Added `SplashCursor` import
- Inserted component at root level to appear on all pages
- Component positioned as fixed overlay with `z-50` and `pointer-events-none`

## Technical Details

### WebGL Fluid Simulation
The component uses advanced WebGL shaders to simulate:
- **Velocity field**: Tracks fluid movement
- **Dye/color field**: Visual representation with colors
- **Pressure field**: Maintains incompressibility
- **Curl/vorticity**: Creates swirling motion
- **Advection**: Moves properties through the fluid

### Shader Programs
- `baseVertexShader`: Position and texture coordinate calculations
- `splatShader`: Creates colored splashes at cursor position
- `advectionShader`: Moves fluid properties through velocity field
- `divergenceShader`: Calculates velocity divergence
- `curlShader`: Computes vorticity for swirling effects
- `vorticityShader`: Applies vorticity force
- `pressureShader`: Iteratively solves pressure equation
- `gradientSubtractShader`: Makes fluid incompressible
- `displayShader`: Renders final visual output

### Configuration Parameters
```typescript
{
  SIM_RESOLUTION: 128,          // Simulation grid resolution
  DYE_RESOLUTION: 1440,          // Color texture resolution
  DENSITY_DISSIPATION: 3.5,     // How fast colors fade
  VELOCITY_DISSIPATION: 2,      // How fast motion slows
  PRESSURE: 0.1,                 // Pressure strength
  PRESSURE_ITERATIONS: 20,       // Pressure solver accuracy
  CURL: 3,                       // Vorticity strength (swirl)
  SPLAT_RADIUS: 0.2,            // Size of cursor splashes
  SPLAT_FORCE: 6000,            // Force of cursor interaction
  SHADING: true,                 // Enable 3D-like shading
  COLOR_UPDATE_SPEED: 10,        // How often colors change
  TRANSPARENT: true              // Transparent background
}
```

## How It Works

1. **Initialization**
   - Creates WebGL context (WebGL2 with WebGL1 fallback)
   - Compiles GLSL shaders
   - Sets up framebuffers for double-buffering
   - Initializes pointer tracking

2. **Animation Loop**
   - Updates delta time
   - Resizes canvas if needed
   - Generates new colors periodically
   - Applies user input (mouse/touch)
   - Runs fluid simulation steps:
     - Calculate curl
     - Apply vorticity
     - Compute divergence
     - Solve pressure (Jacobi iterations)
     - Subtract pressure gradient
     - Advect velocity and dye fields
   - Renders to screen

3. **User Interaction**
   - Tracks mouse/touch position
   - Creates splashes on click/touch
   - Applies continuous force during movement
   - Generates random colors for each splat

## Performance Optimizations

- **Double Buffering**: Read from one framebuffer while writing to another
- **Half-Float Textures**: Reduces memory bandwidth
- **Resolution Scaling**: Lower simulation resolution than display
- **Efficient Shaders**: Optimized GLSL code
- **RequestAnimationFrame**: Smooth 60fps rendering
- **Pixel Ratio Scaling**: Adapts to device pixel density

## Browser Compatibility

- ✅ Chrome/Edge (WebGL2)
- ✅ Firefox (WebGL2)
- ✅ Safari (WebGL2 with fallbacks)
- ✅ Mobile browsers (WebGL with touch support)
- ✅ Legacy browsers (WebGL1 fallback)

## Benefits

- ✅ **Global Effect**: Appears on every page automatically
- ✅ **Non-Intrusive**: `pointer-events-none` allows interaction with page elements
- ✅ **High Performance**: GPU-accelerated WebGL rendering
- ✅ **Touch Support**: Works on mobile devices
- ✅ **Visual Appeal**: Creates stunning, organic fluid effects
- ✅ **Customizable**: Easy to adjust colors and behavior
- ✅ **Brand Enhancement**: Premium, high-tech aesthetic

## Usage

The component is automatically rendered on all pages. No additional configuration needed!

To customize the effect, modify the props in `src/app/layout.tsx`:

```tsx
<SplashCursor 
  DENSITY_DISSIPATION={2.5}   // Faster fade
  CURL={5}                     // More swirly
  SPLAT_FORCE={8000}          // Stronger interaction
/>
```

## Customization Options

### Color Scheme
Modify the `generateColor()` function in `splash-cursor.tsx` to use brand colors:

```typescript
function generateColor() {
  // Current: Random HSV colors with low brightness
  let c = HSVtoRGB(Math.random(), 1.0, 1.0);
  c.r *= 0.15;  // Increase for brighter colors
  c.g *= 0.15;
  c.b *= 0.15;
  
  // Example: Brand red theme
  // return { r: 0.5, g: 0, b: 0 }; // Dark red
  
  return c;
}
```

### Disable on Mobile
Wrap in a conditional:

```tsx
{typeof window !== 'undefined' && window.innerWidth > 768 && <SplashCursor />}
```

### Change Z-Index
Modify in `splash-cursor.tsx`:

```tsx
<div className="fixed top-0 left-0 z-10 pointer-events-none">
```

## Troubleshooting

### Performance Issues
- Reduce `SIM_RESOLUTION` (e.g., 64)
- Reduce `PRESSURE_ITERATIONS` (e.g., 10)
- Lower `DYE_RESOLUTION` (e.g., 720)

### Colors Too Bright/Dark
- Adjust multipliers in `generateColor()` function
- Modify `SHADING` parameter

### Too Much/Little Movement
- Adjust `VELOCITY_DISSIPATION` (higher = less movement)
- Modify `CURL` (lower = less swirling)
- Change `SPLAT_FORCE` (lower = gentler interaction)

## Future Enhancements

Possible improvements:
- Add color themes based on page/section
- Create preset configurations (subtle, normal, intense)
- Add keyboard controls to adjust parameters in real-time
- Implement color matching with brand palette
- Add pause/resume functionality
- Create custom splash patterns for special events

## Credits

Based on WebGL fluid simulation techniques using Navier-Stokes equations. Implements semi-Lagrangian advection with Jacobi pressure solver for incompressible flow.
