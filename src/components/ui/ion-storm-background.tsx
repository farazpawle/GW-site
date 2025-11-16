"use client";

import { useEffect, useRef, useState } from "react";

const energyWaves = Array.from({ length: 6 }).map((_, index) => ({
  delay: `${index * 1.8}s`,
  duration: `${10 + index * 2}s`,
  scale: 0.7 + index * 0.15,
}));

const morphingShapes = Array.from({ length: 4 }).map((_, index) => ({
  delay: `${index * 3}s`,
  rotation: index * 45,
}));

// Pre-generate particles once at module level (same for all instances)
const generateParticles = () =>
  Array.from({ length: 24 }).map(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 5}s`,
    size: 4 + Math.random() * 8,
  }));

export default function IonStormBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<
    ReturnType<typeof generateParticles>
  >([]);

  // Generate particles only on client after mount
  useEffect(() => {
    setParticles(generateParticles());
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const handlePointerMove = (event: PointerEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (event.clientX / innerWidth - 0.5) * 2;
      const y = (event.clientY / innerHeight - 0.5) * 2;
      node.style.setProperty("--pointer-x", x.toString());
      node.style.setProperty("--pointer-y", y.toString());
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 overflow-hidden ion-storm-root"
      aria-hidden
    >
      <div className="ion-storm-base-gradient" />
      <div className="ion-storm-color-shift" />

      {energyWaves.map((wave, index) => (
        <div
          key={`ion-wave-${index}`}
          className="ion-storm-wave"
          style={{
            animationDelay: wave.delay,
            animationDuration: wave.duration,
            transform: `scale(${wave.scale})`,
          }}
        />
      ))}

      {morphingShapes.map((shape, index) => (
        <div
          key={`ion-morph-${index}`}
          className="ion-storm-morph"
          style={{
            animationDelay: shape.delay,
            transform: `rotate(${shape.rotation}deg)`,
          }}
        />
      ))}

      <div className="ion-storm-vortex" />
      <div className="ion-storm-energy-field" />

      {particles.map((particle, index) => (
        <span
          key={`ion-particle-${index}`}
          className="ion-storm-particle"
          style={{
            left: particle.left,
            top: particle.top,
            animationDuration: particle.duration,
            animationDelay: particle.delay,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}

      <div className="ion-storm-pulse-ring ion-storm-pulse-ring--1" />
      <div className="ion-storm-pulse-ring ion-storm-pulse-ring--2" />
      <div className="ion-storm-pulse-ring ion-storm-pulse-ring--3" />

      <div className="ion-storm-glow-orb" />
      <div className="ion-storm-shimmer" />
    </div>
  );
}
