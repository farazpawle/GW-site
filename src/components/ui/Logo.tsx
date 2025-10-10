import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
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
        <Image 
          src="/images/GW_LOGO-removebg.png"
          alt="Garrit & Wulf Logo"
          width={dimensions.width}
          height={dimensions.height}
          priority
          className="object-contain"
          style={{
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      </div>
    </Link>
  );
}