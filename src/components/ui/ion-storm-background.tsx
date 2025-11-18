"use client";

import { useEffect, useState } from "react";

// Generate moving particles with higher density (200 particles)
// Movement: ON | Lines: OFF | Performance: Optimized
const generateParticles = () =>
  Array.from({ length: 200 }).map(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 4,
    opacity: 0.3 + Math.random() * 0.6,
    duration: `${8 + Math.random() * 12}s`, // 8-20s varied speed
    delay: `${Math.random() * 10}s`, // Staggered start
    xOffset: (Math.random() - 0.5) * 60, // -30px to +30px horizontal drift
    yOffset: -100 - Math.random() * 100, // -100px to -200px upward drift
  }));

export default function IonStormBackground() {
  const [particles, setParticles] = useState<
    ReturnType<typeof generateParticles>
  >([]);

  // Generate particles only on client after mount
  useEffect(() => {
    setParticles(generateParticles());
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden ion-storm-root"
      aria-hidden
    >
      <div className="ion-storm-base-gradient" />

      {particles.map((particle, index) => (
        <span
          key={`ion-particle-${index}`}
          className="ion-storm-particle"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: particle.duration,
            animationDelay: particle.delay,
            // CSS variable for unique drift per particle
            ["--x-offset" as string]: `${particle.xOffset}px`,
            ["--y-offset" as string]: `${particle.yOffset}px`,
          }}
        />
      ))}
    </div>
  );
}
