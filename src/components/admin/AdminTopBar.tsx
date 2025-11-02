'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Home, Bell } from 'lucide-react';
import ClientOnly from '@/components/ui/ClientOnly';

export default function AdminTopBar() {
  return (
    <header className="sticky top-0 z-40 bg-[#1a1a1a] border-b border-[#2a2a2a] shadow-lg">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left Section - Breadcrumbs/Title */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">
            Admin Dashboard
          </h2>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-4">
          {/* Exit to Website Button */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 hover:text-white transition-all duration-200"
            title="Exit to Website"
          >
            <Home size={18} />
            <span className="text-sm font-medium">Exit to Website</span>
          </Link>

          {/* Notifications (Optional - for future use) */}
          <button
            className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-400 hover:text-white transition-all duration-200 relative"
            title="Notifications"
          >
            <Bell size={20} />
            {/* Notification badge - uncomment when needed
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            */}
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-[#2a2a2a]"></div>

          {/* User Profile - Wrapped in ClientOnly to prevent hydration mismatch */}
          <div className="flex items-center gap-3">
            <ClientOnly fallback={<div className="w-10 h-10 rounded-full bg-[#2a2a2a] animate-pulse"></div>}>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                    userButtonPopoverCard: "bg-[#1a1a1a] border border-[#2a2a2a]",
                    userButtonPopoverActionButton: "hover:bg-[#2a2a2a]",
                    userButtonPopoverActionButtonText: "text-gray-300",
                    userButtonPopoverFooter: "hidden", // Hide the footer
                  },
                }}
              />
            </ClientOnly>
          </div>
        </div>
      </div>
    </header>
  );
}
