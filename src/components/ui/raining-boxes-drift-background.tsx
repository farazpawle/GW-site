"use client";

import { useEffect, useRef } from "react";

/**
 * RainingBoxesDriftBackground
 *
 * A dynamic Canvas-based background effect featuring falling digital rain (Matrix style).
 *
 * Performance characteristics:
 * - Uses HTML5 Canvas for efficient rendering of many particles
 * - Single animation loop
 * - Responsive to window resize
 */
export default function RainingBoxesDriftBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const fontSize = 10;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#6e0000"; // Dark red boxes

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Draw a square box slightly smaller than the grid cell
        ctx.fillRect(x, y, fontSize - 2, fontSize - 2);

        // Reset drop to top randomly after it has crossed the screen
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      // Re-calculate columns on resize
      const newColumns = Math.floor(width / fontSize);
      // Preserve existing drops if possible, or reset
      if (newColumns > drops.length) {
        for (let i = drops.length; i < newColumns; i++) {
          drops[i] = Math.random() * (height / fontSize); // Start random for new columns
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="raining-boxes-root" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
}
