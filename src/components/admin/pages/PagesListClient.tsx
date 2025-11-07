'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, FileText, Edit, Trash2, Loader2, ExternalLink, Lock } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  groupType: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isPermanent: boolean;
  _count: {
    menuItems: number;
  };
}

interface PagesListClientProps {
  initialPages: Page[];
}

export default function PagesListClient({ initialPages }: PagesListClientProps) {
  const router = useRouter();
  const [pages] = useState<Page[]>(initialPages);
  const [filteredPages, setFilteredPages] = useState<Page[]>(initialPages);
  const [searchQuery, setSearchQuery] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; page: Page | null }>({
    isOpen: false,
    page: null,
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

  const canCreate = hasPermission('pages.create');
  const canEdit = hasPermission('pages.edit');
  const canDelete = hasPermission('pages.delete');

  useEffect(() => {
    let filtered = pages;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((page) =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply published filter
    if (publishedFilter !== 'all') {
      filtered = filtered.filter((page) => 
        publishedFilter === 'published' ? page.published : !page.published
      );
    }

    setFilteredPages(filtered);
  }, [searchQuery, publishedFilter, pages]);

  const handleDelete = async (page: Page) => {
    // Check permission first
    if (!canDelete) {
      alert('⛔ Access Denied\n\nYou do not have permission to delete pages.\n\nMissing permission: pages.delete');
      setDeleteModal({ isOpen: false, page: null });
      return;
    }

    // Check if page is permanent
    if (page.isPermanent) {
      alert(`Cannot delete "${page.title}" because it is a protected system page.`);
      setDeleteModal({ isOpen: false, page: null });
      return;
    }

    if (page._count.menuItems > 0) {
      alert(`Cannot delete page "${page.title}" because it is linked to ${page._count.menuItems} menu item(s). Please remove the menu items first.`);
      setDeleteModal({ isOpen: false, page: null });
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/pages/${page.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete page');
      }

      setDeleteModal({ isOpen: false, page: null });
      // Refresh server data
      router.refresh();
    } catch (error: unknown) {
      console.error('Error deleting page:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete page';
      alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-900 p-4 rounded-lg border border-gray-800">
        <div className="flex gap-4 flex-1 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Published Filter */}
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Pages</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>

        {canCreate ? (
          <Link
            href="/admin/pages/new"
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            New Page
          </Link>
        ) : (
          <button
            onClick={() => alert('⛔ Access Denied\n\nYou do not have permission to create pages.\n\nMissing permission: pages.create')}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900/30 text-gray-500 border border-gray-800 rounded-lg cursor-not-allowed font-medium"
            disabled
          >
            <Lock className="w-5 h-5" />
            New Page
          </button>
        )}
      </div>

      {/* Pages Table */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-16 px-4 bg-gray-900 rounded-lg border border-gray-800">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-100 mb-2">No pages found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first page'}
          </p>
          {!searchQuery && canCreate && (
            <Link
              href="/admin/pages/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Page
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Group Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Menu Links
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-100">{page.title}</span>
                        {page.isPermanent && (
                          <span 
                            className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-900/40 text-purple-300 border border-purple-800"
                            title="System page - Cannot be deleted"
                          >
                            🔒 Protected
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">/{page.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 capitalize">{page.groupType}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      page.published
                        ? 'bg-green-900/40 text-green-300 border border-green-800'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {page.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {page._count.menuItems > 0 ? (
                      <span className="text-blue-400 font-medium">{page._count.menuItems} link(s)</span>
                    ) : (
                      <span className="text-gray-500">Not linked</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    {page.published && (
                      <a
                        href={`/pages/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                        title="View live page"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </a>
                    )}
                    {canEdit ? (
                      <Link
                        href={`/admin/pages/${page.id}/edit`}
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    ) : (
                      <button
                        onClick={() => alert('⛔ Access Denied\n\nYou do not have permission to edit pages.\n\nMissing permission: pages.edit')}
                        className="inline-flex items-center gap-1 text-gray-600 cursor-not-allowed transition-colors"
                        disabled
                      >
                        <Lock className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    {!page.isPermanent ? (
                      canDelete ? (
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, page })}
                          className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 ml-3 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => alert('⛔ Access Denied\n\nYou do not have permission to delete pages.\n\nMissing permission: pages.delete')}
                          className="inline-flex items-center gap-1 text-gray-600 ml-3 cursor-not-allowed transition-colors"
                          disabled
                        >
                          <Lock className="w-4 h-4" />
                          Delete
                        </button>
                      )
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-gray-600 ml-3 cursor-not-allowed"
                        title="This is a system page and cannot be deleted"
                      >
                        🔒 Protected
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.page && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Delete Page</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete &quot;<span className="font-semibold text-red-400">{deleteModal.page.title}</span>&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, page: null })}
                disabled={isDeleting}
                className="px-6 py-2 border-2 border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.page!)}
                disabled={isDeleting}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-500/30 transition-all font-medium"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
