'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, FolderOpen, FileText, Menu, Layers, Settings, Users, Image as ImageIcon, Mail } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navLinks: NavLink[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Products',
    href: '/admin/parts',
    icon: Package,
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    name: 'Media Library',
    href: '/admin/media',
    icon: ImageIcon,
  },
  {
    name: 'Collections',
    href: '/admin/collections',
    icon: Layers,
  },
  {
    name: 'Pages',
    href: '/admin/pages',
    icon: FileText,
  },
  {
    name: 'Menu Items',
    href: '/admin/menu-items',
    icon: Menu,
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: Mail,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-[#2a2a2a]">
        <h1 className="text-xl font-bold text-brand-maroon">GW Admin</h1>
        <p className="text-sm text-gray-400 mt-1">Management Panel</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            // Check if current path matches or starts with the link href (for sub-routes)
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            const Icon = link.icon;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-brand-maroon text-white font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#2a2a2a]">
        <p className="text-xs text-gray-500 text-center">
          © 2025 Garrit Wulf
        </p>
      </div>
    </aside>
  );
}
