"use client";

import Image from 'next/image';
import PlasmaPathsOverlay from '@/components/ui/plasma-paths-overlay';

export default function CombinedRibbonBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src="/images/hero-ribbon.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center select-none"
        draggable={false}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#060214]/75 via-[#0c0322]/50 to-[#02010a]/85" />

  <PlasmaPathsOverlay />
    </div>
  );
}
