"use client";

import { motion } from 'framer-motion';

interface FloatingPathsProps {
  offset: number;
}

const FloatingPaths = ({ offset }: FloatingPathsProps) => {
  const paths = Array.from({ length: 36 }, (_, index) => {
    const base = index * 0.035;
    const curveOffset = offset * 0.35;
  const opacitySeed = 0.45 + base * 0.85;
  const pathOpacity = opacitySeed > 1 ? 1 : opacitySeed;

    return {
      id: index,
      d: `M-${360 - index * 6 * offset} -${180 + index * 5}C-${
        320 - index * 5 * offset
      } -${200 + index * 7} -${120 - index * 4 * offset} ${
        300 - index * 6
      } ${220 - index * 3 * offset} ${380 - index * 4}C${
        550 - index * 5 * offset
      } ${460 - index * 4} ${720 - index * 4 * offset} ${
        840 - index * 5
      } ${720 - index * 3 * offset} ${840 - index * 5}`,
  color: 'rgba(255, 255, 255, 1)',
      width: 0.45 + index * 0.025,
      speed: 22 + base * 28,
      animationOffset: curveOffset + index * 0.02,
      opacity: pathOpacity,
    };
  });

  return (
    <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
      <title>Hero Ribbon Motion Overlay</title>
      {paths.map((path) => (
        <motion.path
          key={`${offset}-${path.id}`}
          d={path.d}
          stroke={path.color}
          strokeWidth={path.width}
          strokeOpacity={path.opacity}
          initial={{ pathLength: 0.4, opacity: 0.4 }}
          animate={{
            pathLength: [0.5, 1, 0.5],
            opacity: [0.65, 1, 0.65],
            pathOffset: [path.animationOffset, path.animationOffset + 1, path.animationOffset],
          }}
          transition={{
            duration: path.speed,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        />
      ))}
    </svg>
  );
};

export default function PlasmaPathsOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none mix-blend-screen">
      <div className="absolute inset-0 opacity-80">
        <FloatingPaths offset={1} />
      </div>
      <div className="absolute inset-0 opacity-70">
        <FloatingPaths offset={-1} />
      </div>
    </div>
  );
}
