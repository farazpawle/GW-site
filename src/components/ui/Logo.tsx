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
    sm: { width: 120, height: 40 },
    md: { width: 150, height: 50 },
    lg: { width: 180, height: 60 }
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
        <div className="relative w-full max-w-[120px] md:max-w-[150px] lg:max-w-[180px] flex items-center justify-center" style={{ 
          maxHeight: '50px',
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
              className="object-contain w-full h-auto max-h-[50px]"
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
        className="hidden md:flex relative w-full max-w-[150px] lg:max-w-[180px] items-center justify-center"
        style={{ 
          height: `${dimensions.height}px`
        }}
      >
        {imgError ? (
          <div className="flex items-center justify-center text-xl font-bold text-brand-red">
            {siteName}
          </div>
        ) : (
          <Image 
            src={proxyUrl}
            alt={`${siteName} Logo`}
            width={dimensions.width}
            height={dimensions.height}
            priority
            className="object-contain w-full h-auto max-h-[50px]"
            onError={() => setImgError(true)}
            unoptimized
          />
        )}
      </div>

      {/* Mobile Logo - Shown only on mobile (< 768px) */}
      <div 
        className="flex md:hidden relative w-full max-w-[120px] items-center justify-center"
        style={{ 
          maxHeight: '40px'
        }}
      >
        {mobileImgError ? (
          <div className="flex items-center justify-center text-base font-bold text-brand-red">
            {siteName}
          </div>
        ) : (
          <Image 
            src={mobileProxyUrl}
            alt={`${siteName} Mobile Logo`}
            width={120}
            height={40}
            priority
            className="object-contain w-full h-auto max-h-[40px]"
            onError={() => setMobileImgError(true)}
            unoptimized
          />
        )}
      </div>
    </Link>
  );
}