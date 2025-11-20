'use client';

import { usePathname } from 'next/navigation';

interface SecondaryNavItem {
  label: string;
  href: string;
}

const secondaryNavItems: SecondaryNavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Blog', href: '/blog' }
];

export default function SecondaryNavigation() {
  const pathname = usePathname();

  return (
    <div className="bg-brand-blue text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left side with GW logo and brand text */}
        <div className="flex items-center space-x-3">
          {/* Small GW Logo */}
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
            <span className="text-brand-blue font-bold text-sm">GW</span>
          </div>
          
          {/* Brand Text */}
          <span className="font-semibold text-lg tracking-wide">
            PREMIUM AUTO PARTS
          </span>
        </div>
        
        {/* Right side navigation */}
        <nav className="flex space-x-8">
          {secondaryNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-white hover:text-gray-200 transition-colors font-medium ${
                pathname === item.href ? 'border-b-2 border-white pb-1' : ''
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}