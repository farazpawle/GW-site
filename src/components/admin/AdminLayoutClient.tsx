'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';

interface AdminLayoutClientProps {
  children: ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white admin-scrollbar">
      <style jsx global>{`
        /* Custom scrollbar styles for admin panel */
        .admin-scrollbar ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }

        .admin-scrollbar ::-webkit-scrollbar-track {
          background: #0a0a0a;
          border-radius: 6px;
        }

        .admin-scrollbar ::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 6px;
          border: 2px solid #0a0a0a;
        }

        .admin-scrollbar ::-webkit-scrollbar-thumb:hover {
          background: #6e0000;
        }

        .admin-scrollbar ::-webkit-scrollbar-thumb:active {
          background: #8a0000;
        }

        .admin-scrollbar ::-webkit-scrollbar-corner {
          background: #0a0a0a;
        }

        /* Firefox scrollbar styles */
        .admin-scrollbar * {
          scrollbar-width: thin;
          scrollbar-color: #2a2a2a #0a0a0a;
        }

        .admin-scrollbar *:hover {
          scrollbar-color: #6e0000 #0a0a0a;
        }
      `}</style>
      <div className="flex h-screen">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main content area with top bar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Admin Top Bar */}
          <AdminTopBar />
          
          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
