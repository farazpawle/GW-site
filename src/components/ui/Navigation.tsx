'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Menu, X, Phone, Mail, ChevronDown } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  openNewTab?: boolean;
  badge?: string;
  children?: NavigationItem[];
}

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('/api/menu-items');
        if (response.ok) {
          const data = await response.json();
          setNavigationItems(data.menuItems || []);
        }
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
        // Fallback to hardcoded items if API fails
        setNavigationItems([
          { id: '1', label: 'HOME', href: '/' },
          { id: '2', label: 'PRODUCTS', href: '/products' },
          { id: '3', label: 'ABOUT US', href: '/about' },
          { id: '4', label: 'CONTACT US', href: '/contact' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-8">
        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const hasChildren = item.children && item.children.length > 0;
              
              return (
                <div key={item.id} className="relative group/menu">
                  <Link 
                    href={item.href}
                    target={item.openNewTab ? '_blank' : undefined}
                    rel={item.openNewTab ? 'noopener noreferrer' : undefined}
                    className={`relative px-5 py-2.5 text-sm font-bold tracking-wider transition-all duration-300 group flex items-center justify-center gap-1 ${
                      isActive 
                        ? 'text-[#6e0000]' 
                        : 'text-gray-700 hover:text-[#6e0000]'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {item.label}
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#6e0000] rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      {/* Dropdown Icon */}
                      {hasChildren && (
                        <ChevronDown className="w-4 h-4 transition-transform group-hover/menu:rotate-180 duration-300" />
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
                  
                  {/* Dropdown Menu */}
                  {hasChildren && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 transform translate-y-2 group-hover/menu:translate-y-0 z-50">
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
                              <span className="flex items-center gap-2">
                                {child.label}
                                {child.badge && (
                                  <span className="px-2 py-0.5 text-[9px] font-bold text-white bg-[#6e0000] rounded-full">
                                    {child.badge}
                                  </span>
                                )}
                              </span>
                              {child.openNewTab && (
                                <span className="text-xs opacity-50">↗</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pl-6 ml-2 border-l-2 border-gray-200">
          {/* Search Button - Enhanced */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="group relative p-2.5 text-gray-700 hover:text-white rounded-full transition-all duration-300 overflow-hidden" 
            aria-label="Search"
          >
            <span className="absolute inset-0 bg-[#6e0000] transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></span>
            <Search className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
          </button>

          {/* Get Quote Button - Enhanced with Glow */}
          <Link
            href="/contact"
            className="relative px-7 py-3 text-sm font-bold text-white rounded-lg overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#6e0000] to-[#932020]"></span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#932020] to-[#6e0000] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-white blur-xl"></span>
            <span className="relative z-10 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              GET QUOTE
            </span>
          </Link>
        </div>
      </nav>

      {/* Mobile Menu Button - Enhanced */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden relative p-2.5 text-gray-700 hover:text-[#6e0000] transition-all duration-300 hover:bg-gray-50 rounded-lg"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 flex items-center justify-center">
          {isMenuOpen ? (
            <X className="w-6 h-6 animate-in spin-in-180 duration-300" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </div>
      </button>

      {/* Mobile Navigation Menu - Enhanced */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-2xl border-t-2 border-[#6e0000]/10 z-50 animate-in slide-in-from-top duration-300">
          <div className="container mx-auto px-6 py-6">
            {/* Quick Contact in Mobile */}
            <div className="flex gap-3 mb-6 pb-6 border-b border-gray-200">
              <a
                href="tel:+97142243851"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col space-y-2 mb-6">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedMenus[item.id] || false;
                
                return (
                  <div key={item.id}>
                    {hasChildren ? (
                      <button
                        onClick={() => setExpandedMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        className={`w-full flex items-center justify-between px-5 py-4 text-base font-bold rounded-xl transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-[#6e0000] to-[#932020] text-white shadow-lg' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-[#6e0000]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {item.label}
                          {item.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-white/20 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <Link 
                        href={item.href}
                        target={item.openNewTab ? '_blank' : undefined}
                        rel={item.openNewTab ? 'noopener noreferrer' : undefined}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center justify-between px-5 py-4 text-base font-bold rounded-xl transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-[#6e0000] to-[#932020] text-white shadow-lg scale-105' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-[#6e0000] hover:pl-7'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {item.label}
                          {item.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-white/20 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </span>
                        <ChevronDown className={`w-5 h-5 -rotate-90 transition-transform ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                      </Link>
                    )}
                    
                    {/* Submenu Items */}
                    {hasChildren && isExpanded && (
                      <div className="ml-4 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                        {item.children!.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.id}
                              href={child.href}
                              target={child.openNewTab ? '_blank' : undefined}
                              rel={child.openNewTab ? 'noopener noreferrer' : undefined}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex items-center justify-between px-5 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isChildActive
                                  ? 'bg-[#6e0000] text-white'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-[#6e0000] hover:pl-6'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {child.label}
                                {child.badge && (
                                  <span className="px-2 py-0.5 text-[9px] font-bold text-white bg-white/20 rounded-full">
                                    {child.badge}
                                  </span>
                                )}
                              </span>
                              {child.openNewTab && (
                                <span className="text-xs opacity-50">↗</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA Button in Mobile */}
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-6 py-4 text-base font-bold text-white rounded-xl bg-gradient-to-r from-[#6e0000] to-[#932020] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              GET QUOTE
            </Link>
          </div>
        </div>
      )}

      {/* Search Overlay - Enhanced */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-32 animate-in fade-in duration-300" 
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full mx-4 animate-in slide-in-from-top-4 duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 pb-6 border-b-2 border-gray-100">
              <div className="p-3 bg-[#6e0000]/10 rounded-xl">
                <Search className="w-6 h-6 text-[#6e0000]" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Search for auto parts, brands, or categories..."
                className="flex-1 text-lg outline-none text-gray-700 placeholder-gray-400 font-medium"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Quick Search Suggestions */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-500 mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Engine Parts', 'Brake Systems', 'Transmission', 'Electrical', 'Suspension'].map((tag) => (
                  <button
                    key={tag}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-[#6e0000] hover:text-white transition-all duration-300"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}