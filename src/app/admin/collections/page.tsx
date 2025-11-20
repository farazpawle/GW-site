'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import Toast from '@/components/ui/Toast';
import { Plus, Search, Loader2, Edit2, Trash2 } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  slug: string;
  useManual: boolean;
  published: boolean;
  _count: {
    manualProducts: number;
  };
}

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'automatic' | 'manual'>('all');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; collection: Collection | null }>({
    isOpen: false,
    collection: null,
  });

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/collections');
      if (!response.ok) throw new Error('Failed to fetch collections');
      const data = await response.json();
      setCollections(data.collections || []);
      setFilteredCollections(data.collections || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load collections';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    let filtered = collections;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Mode filter
    if (modeFilter === 'automatic') {
      filtered = filtered.filter((c) => !c.useManual);
    } else if (modeFilter === 'manual') {
      filtered = filtered.filter((c) => c.useManual);
    }

    setFilteredCollections(filtered);
  }, [searchQuery, modeFilter, collections]);

  const handleDelete = async () => {
    if (!deleteModal.collection) return;

    try {
      const response = await fetch(`/api/admin/collections/${deleteModal.collection.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete collection');
      }

      setDeleteModal({ isOpen: false, collection: null });
      setSuccess('Collection deleted successfully!');
      await fetchCollections();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete collection';
      setError(message);
    }
  };

  return (
    <div className="px-8 py-6">
      {/* Toast Notifications */}
      <Toast
        message={success}
        type="success"
        show={!!success}
        onClose={() => setSuccess('')}
        duration={3000}
      />
      <Toast
        message={error}
        type="error"
        show={!!error}
        onClose={() => setError('')}
        duration={5000}
      />

      <AdminHeader
        pageTitle="Collections"
        description="Manage product collections with automatic filtering or manual selection"
      />

      <div className="mt-6 space-y-4">
        {/* Actions Bar */}
        <div className="flex justify-between items-center gap-4 bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Mode Filter */}
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as 'all' | 'automatic' | 'manual')}
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Collections</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <button
            onClick={() => router.push('/admin/collections/new')}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            New Collection
          </button>
        </div>

        {/* Collections Table */}
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 bg-gray-900">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-400">Loading collections...</p>
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="text-center py-16 px-4 bg-gray-900">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">
                {searchQuery || modeFilter !== 'all'
                  ? 'No collections found matching your filters'
                  : 'No collections yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || modeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first collection'}
              </p>
              {!searchQuery && modeFilter === 'all' && (
                <button
                  onClick={() => router.push('/admin/collections/new')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create First Collection
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-900 border-b-2 border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {filteredCollections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-100">{collection.name}</td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-sm">{collection.slug}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          collection.useManual
                            ? 'bg-purple-900/40 text-purple-300 border border-purple-800'
                            : 'bg-blue-900/40 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {collection.useManual ? 'Manual' : 'Automatic'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {collection.useManual ? `${collection._count.manualProducts} products` : 'Auto-filtered'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          collection.published
                            ? 'bg-green-900/40 text-green-300 border border-green-800'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}
                      >
                        {collection.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/collections/${collection.id}/edit`)}
                          className="inline-flex items-center gap-1 p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, collection })}
                          className="inline-flex items-center gap-1 p-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Delete Collection</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete &quot;<span className="font-semibold text-red-400">{deleteModal.collection?.name}</span>&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, collection: null })}
                className="px-6 py-2 border-2 border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/30 transition-all font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
