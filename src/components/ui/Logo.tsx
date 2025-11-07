'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  logoUrl: string;
  mobileLogoUrl?: string;
  siteName: string;
}

export default function Logo({ 
  size = 'md', 
  className = '', 
  logoUrl,
  mobileLogoUrl, 
  siteName 
}: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const [mobileImgError, setMobileImgError] = useState(false);
  const sizeMap = {
    sm: { width: 380, height: 100 },
    md: { width: 450, height: 120 },
    lg: { width: 520, height: 140 }
  };

  const dimensions = sizeMap[size];
  
  // Use proxy for MinIO URLs to avoid CORS issues - Desktop logo
  const proxyUrl = (logoUrl.includes('localhost:9000') || logoUrl.includes('minio:9000'))
    ? `/api/admin/media/proxy?url=${encodeURIComponent(logoUrl)}`
    : logoUrl;

  // Use proxy for MinIO URLs to avoid CORS issues - Mobile logo
  const mobileProxyUrl = mobileLogoUrl 
    ? (mobileLogoUrl.includes('localhost:9000') || mobileLogoUrl.includes('minio:9000'))
      ? `/api/admin/media/proxy?url=${encodeURIComponent(mobileLogoUrl)}`
      : mobileLogoUrl
    : null;

  // If no mobile logo is provided, show desktop logo on all screen sizes
  if (!mobileProxyUrl) {
    return (
      <Link href="/" className={`flex items-center ${className}`}>
        <div className="relative w-full max-w-[150px] md:max-w-[280px] lg:max-w-[320px] flex items-center justify-center" style={{ 
          maxHeight: '60px',
          height: 'auto'
        }}>
          {imgError ? (
            <div className="flex items-center justify-center text-lg md:text-2xl font-bold text-brand-red">
              {siteName}
            </div>
          ) : (
            <Image 
              src={proxyUrl}
              alt={`${siteName} Logo`}
              width={dimensions.width}
              height={dimensions.height}
              priority
              className="object-contain w-full h-auto max-h-[60px] md:max-h-none"
              onError={() => setImgError(true)}
              unoptimized
            />
          )}
        </div>
      </Link>
    );
  }

  // If mobile logo is provided, render both with responsive classes
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      {/* Desktop Logo - Hidden on mobile (< 768px) */}
      <div 
        className="hidden md:flex relative w-full max-w-[280px] lg:max-w-[320px] items-center justify-center"
        style={{ 
          height: `${dimensions.height}px`
        }}
      >
        {imgError ? (
          <div className="flex items-center justify-center text-2xl font-bold text-brand-red">
            {siteName}
          </div>
        ) : (
          <Image 
            src={proxyUrl}
            alt={`${siteName} Logo`}
            width={dimensions.width}
            height={dimensions.height}
            priority
            className="object-contain w-full h-auto"
            onError={() => setImgError(true)}
            unoptimized
          />
        )}
      </div>

      {/* Mobile Logo - Shown only on mobile (< 768px) */}
      <div 
        className="flex md:hidden relative w-full max-w-[150px] items-center justify-center"
        style={{ 
          maxHeight: '60px'
        }}
      >
        {mobileImgError ? (
          <div className="flex items-center justify-center text-lg font-bold text-brand-red">
            {siteName}
          </div>
        ) : (
          <Image 
            src={mobileProxyUrl}
            alt={`${siteName} Mobile Logo`}
            width={280}
            height={80}
            priority
            className="object-contain w-full h-auto max-h-[60px]"
            onError={() => setMobileImgError(true)}
            unoptimized
          />
        )}
      </div>
    </Link>
  );
}