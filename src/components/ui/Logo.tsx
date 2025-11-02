'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  logoUrl: string;
  siteName: string;
}

export default function Logo({ 
  size = 'md', 
  className = '', 
  logoUrl, 
  siteName 
}: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const sizeMap = {
    sm: { width: 380, height: 100 },
    md: { width: 450, height: 120 },
    lg: { width: 520, height: 140 }
  };

  const dimensions = sizeMap[size];

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <div style={{ 
        width: `${dimensions.width}px`, 
        height: `${dimensions.height}px`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {imgError ? (
          <div className="flex items-center justify-center text-2xl font-bold text-brand-red">
            {siteName}
          </div>
        ) : (
          <Image 
            src={logoUrl}
            alt={`${siteName} Logo`}
            width={dimensions.width}
            height={dimensions.height}
            priority
            className="object-contain"
            onError={() => setImgError(true)}
            style={{
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
        )}
      </div>
    </Link>
  );
}