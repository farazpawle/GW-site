'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, FolderOpen, FileText, Menu, Layers, Settings, Users, Image as ImageIcon, Mail, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: string; // Required permission to view this link
}

const navLinks: NavLink[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: 'dashboard.view',
  },
  {
    name: 'Homepage CMS',
    href: '/admin/homepage-cms',
    icon: Home,
    permission: 'homepage.view',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    permission: 'users.view',
  },
  {
    name: 'Products',
    href: '/admin/parts',
    icon: Package,
    permission: 'products.view',
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: FolderOpen,
    permission: 'categories.view',
  },
  {
    name: 'Media Library',
    href: '/admin/media',
    icon: ImageIcon,
    permission: 'media.view',
  },
  {
    name: 'Collections',
    href: '/admin/collections',
    icon: Layers,
    permission: 'collections.view',
  },
  {
    name: 'Pages',
    href: '/admin/pages',
    icon: FileText,
    permission: 'pages.view',
  },
  {
    name: 'Menu Items',
    href: '/admin/menu-items',
    icon: Menu,
    permission: 'menu.view',
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: Mail,
    permission: 'messages.view',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'settings.view',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user permissions on mount
  useEffect(() => {
    async function fetchPermissions() {
      try {
        const response = await fetch('/api/auth/me?t=' + Date.now(), {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        const data = await response.json();
        
        if (data.success && data.data.permissions) {
          setUserPermissions(data.data.permissions);
        }
      } catch (error) {
        console.error('[Sidebar] Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, []);

  // Check if user has permission for a nav link
  const hasPermission = (permission?: string) => {
    if (!permission) return true; // No permission required
    if (userPermissions.includes(permission)) return true;
    // Check wildcard permissions (e.g., "products.*" allows "products.view")
    const resource = permission.split('.')[0];
    return userPermissions.includes(`${resource}.*`);
  };

  // Filter nav links based on permissions
  const visibleLinks = navLinks.filter(link => hasPermission(link.permission));

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} h-full bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col transition-all duration-300`}>
      {/* Logo/Header */}
      <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-brand-maroon">GW Admin</h1>
            <p className="text-sm text-gray-400 mt-1">Management Panel</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors text-gray-400 hover:text-white"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-500 py-4">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-brand-maroon border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <ul className="space-y-2">
            {visibleLinks.map((link) => {
              // Check if current path matches or starts with the link href (for sub-routes)
              const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
              const Icon = link.icon;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`
                      flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-brand-maroon text-white font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                      }
                    `}
                    title={isCollapsed ? link.name : ''}
                  >
                    <Icon size={20} />
                    {!isCollapsed && <span>{link.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-[#2a2a2a]">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Garrit Wulf
          </p>
        </div>
      )}
    </aside>
  );
}
