'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, FolderOpen, Edit, Trash2, Loader2, AlertTriangle, Lock } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: {
    parts: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  // Fetch user permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (response.ok) {
          const data = await response.json();
          setUserPermissions(data.permissions || []);
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      } finally {
        setPermissionsLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  // Helper function to check permissions
  const hasPermission = (permission: string): boolean => {
    if (userPermissions.includes('*')) return true;
    if (userPermissions.includes(permission)) return true;
    const [resource] = permission.split('.');
    if (userPermissions.includes(`${resource}.*`)) return true;
    return false;
  };

  const canCreate = hasPermission('categories.create');
  const canEdit = hasPermission('categories.edit');
  const canDelete = hasPermission('categories.delete');

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
        setFilteredCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.category) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/categories/${deleteModal.category.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove from state
        setCategories((prev) => prev.filter((cat) => cat.id !== deleteModal.category!.id));
        setDeleteModal({ isOpen: false, category: null });
        alert('Category deleted successfully');
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminHeader
        pageTitle="Categories"
        description="Manage product categories"
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl lg:text-2xl font-semibold text-white">All Categories</h2>
          {canCreate ? (
            <Link
              href="/admin/categories/new"
              className="px-4 py-2 bg-[#6e0000] text-white rounded-lg hover:bg-[#8b0000] transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </Link>
          ) : (
            <button
              onClick={() => alert('⛔ Access Denied\n\nYou do not have permission to create categories.\n\nMissing permission: categories.create')}
              className="px-4 py-2 bg-gray-900/30 text-gray-500 border border-gray-800 rounded-lg cursor-not-allowed flex items-center gap-2"
              disabled
            >
              <Lock className="w-5 h-5" />
              Add Category
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6e0000]"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#6e0000]" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchQuery ? 'No categories found' : 'No categories yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Get started by creating your first category'}
            </p>
            {!searchQuery && canCreate && (
              <Link
                href="/admin/categories/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#6e0000] text-white rounded-lg hover:bg-[#8b0000] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Category
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 lg:gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden hover:border-[#6e0000] transition-colors flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 bg-white flex items-center justify-center overflow-hidden">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src="/images/default-logo.png"
                      alt="GW Logo"
                      fill
                      className="object-contain p-6"
                      onError={(e) => {
                        console.error('Logo failed to load');
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/GW_LOGO-removebg.png';
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm mb-4 mt-auto">
                    <span className="text-gray-400">{category._count.parts} products</span>
                    <span className="text-xs text-gray-500">/{category.slug}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {canEdit ? (
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="flex-1 px-4 py-2.5 bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    ) : (
                      <button
                        onClick={() => alert('⛔ Access Denied\n\nYou do not have permission to edit categories.\n\nMissing permission: categories.edit')}
                        className="flex-1 px-4 py-2.5 bg-gray-900/30 text-gray-600 border border-gray-800 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                        disabled
                      >
                        <Lock className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    
                    {canDelete ? (
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, category })}
                        className="flex-1 px-4 py-2.5 bg-red-900/30 border border-red-800/50 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => alert('⛔ Access Denied\n\nYou do not have permission to delete categories.\n\nMissing permission: categories.delete')}
                        className="flex-1 px-4 py-2.5 bg-gray-900/30 text-gray-600 border border-gray-800 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                        disabled
                      >
                        <Lock className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.isOpen && deleteModal.category && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !isDeleting && setDeleteModal({ isOpen: false, category: null })}
        >
          <div
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">Delete Category</h2>
                <p className="text-gray-300">
                  Are you sure you want to delete &quot;{deleteModal.category.name}&quot;?
                </p>
                {deleteModal.category._count.parts > 0 && (
                  <div className="mt-3 p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
                    <p className="text-red-300 text-sm">
                      ⚠️ This category has {deleteModal.category._count.parts} product
                      {deleteModal.category._count.parts > 1 ? 's' : ''}. You cannot delete it
                      until all products are reassigned or deleted.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteModal({ isOpen: false, category: null })}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || (deleteModal.category._count.parts > 0)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
