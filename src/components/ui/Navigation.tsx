'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  openNewTab?: boolean;
  badge?: string;
  children?: NavigationItem[];
}

interface MenuItem {
  id: string;
  label: string;
  pageId: string | null;
  externalUrl: string | null;
  openNewTab: boolean;
  visible: boolean;
  page?: {
    slug: string;
    title: string;
  } | null;
  children: MenuItem[];
}

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Track if component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch menu items from database
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('/api/menu-items?includeHidden=false');
        if (!response.ok) {
          console.error('Failed to fetch menu items:', response.status, response.statusText);
          return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON response but got:', contentType);
          return;
        }
        
        const data = await response.json();
        const dbMenuItems = data.menuItems || [];
        
        // Convert database menu items to navigation format
        const convertMenuItem = (item: MenuItem): NavigationItem => {
          // If linked to a page, use clean slug (without /pages/)
          // If external URL, use that
          // Special case: if page slug is "home", route to root "/"
          let href = '#';
          if (item.externalUrl) {
            href = item.externalUrl;
          } else if (item.page) {
            href = item.page.slug === 'home' ? '/' : `/${item.page.slug}`;
          }
          
          return {
            id: item.id,
            label: item.label,
            href,
            openNewTab: item.openNewTab,
            children: item.children?.map(convertMenuItem) || [],
          };
        };

        const navigationItems = dbMenuItems.map(convertMenuItem);
        setNavigationItems(navigationItems);
      } catch (error) {
        console.error('Failed to load menu items:', error);
        // Keep empty array if fetch fails
      }
    };

    fetchMenuItems();
  }, []);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-8 flex-shrink-0">
        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const hasChildren = item.children && item.children.length > 0;
            
            return (
              <div key={item.id} className="relative group">
                <Link 
                  href={item.href}
                  target={item.openNewTab ? '_blank' : undefined}
                  rel={item.openNewTab ? 'noopener noreferrer' : undefined}
                  className={`relative px-4 py-2.5 text-sm font-bold tracking-wider transition-all duration-300 flex items-center gap-1 whitespace-nowrap ${
                    isActive 
                      ? 'text-[#6e0000]' 
                      : 'text-gray-700 hover:text-[#6e0000]'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1">
                    {item.label}
                    {hasChildren && (
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300" />
                    )}
                  </span>
                  
                  {/* Animated Background */}
                  <span 
                    className={`absolute inset-0 bg-gray-50 rounded-lg transform transition-all duration-300 ${
                      isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                    }`}
                  />
                  
                  {/* Animated Underline */}
                  <span 
                    className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#6e0000] to-[#932020] rounded-full transform origin-left transition-transform duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
                
                {/* Dropdown Menu with Animations */}
                {hasChildren && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="py-2">
                      {item.children!.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.id}
                            href={child.href}
                            target={child.openNewTab ? '_blank' : undefined}
                            rel={child.openNewTab ? 'noopener noreferrer' : undefined}
                            className={`flex items-center justify-between px-5 py-3 text-sm font-medium transition-all duration-200 ${
                              isChildActive
                                ? 'bg-[#6e0000] text-white'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-[#6e0000] hover:pl-6'
                            }`}
                          >
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Action Buttons with Enhanced Animations */}
        <div className="flex items-center gap-3 pl-6 ml-2 border-l border-gray-300">
          {/* Search Button with Animation */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="group relative p-2.5 text-gray-700 hover:text-white rounded-full transition-all duration-300 overflow-hidden" 
            aria-label="Search"
          >
            <span className="absolute inset-0 bg-[#6e0000] transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></span>
            <Search className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden p-2 text-gray-700 hover:text-[#6e0000] rounded-lg"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t z-50 max-h-[80vh] overflow-y-auto">
          <div className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isActive = pathname === item.href;
              return (
                <div key={item.id}>
                  <Link
                    href={item.href}
                    target={item.openNewTab ? '_blank' : undefined}
                    rel={item.openNewTab ? 'noopener noreferrer' : undefined}
                    onClick={() => !hasChildren && setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-semibold transition-all ${
                      isActive
                        ? 'bg-[#6e0000] text-white'
                        : 'text-gray-700 hover:text-[#6e0000] hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                  {hasChildren && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children!.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.id}
                            href={child.href}
                            target={child.openNewTab ? '_blank' : undefined}
                            rel={child.openNewTab ? 'noopener noreferrer' : undefined}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-2 text-sm rounded-lg transition-all ${
                              isChildActive
                                ? 'bg-[#6e0000]/10 text-[#6e0000] font-semibold'
                                : 'text-gray-600 hover:text-[#6e0000] hover:bg-gray-50'
                            }`}
                          >
                            • {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Overlay - Using Portal for proper overlay */}
      {isMounted && isSearchOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32" 
          style={{ zIndex: 9999 }}
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}