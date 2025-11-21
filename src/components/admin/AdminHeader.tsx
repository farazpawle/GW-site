'use client';

import { UserButton } from '@clerk/nextjs';
import ClientOnly from '@/components/ui/ClientOnly';

interface AdminHeaderProps {
  pageTitle: string;
  description?: string;
}

export default function AdminHeader({ pageTitle, description }: AdminHeaderProps) {
  return (
    <header className="bg-[#0a0a0a] sticky top-0 z-10">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ClientOnly fallback={<div className="w-10 h-10" />}>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                },
              }}
            />
          </ClientOnly>
        </div>
      </div>
    </header>
  );
}
