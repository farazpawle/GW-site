'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MenuTree from '@/components/admin/menu-items/MenuTree';
import MenuItemModal from '@/components/admin/menu-items/MenuItemModal';
import { Plus, Loader2, Lock } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  position: number;
  visible: boolean;
  openNewTab: boolean;
  parentId: string | null;
  pageId: string | null;
  externalUrl: string | null;
  isPermanent: boolean;
  page?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  parent?: {
    id: string;
    label: string;
  } | null;
  children: MenuItem[];
}

interface MenuItemsClientProps {
  initialMenuItems: MenuItem[];
  initialIncludeHidden: boolean;
}

export default function MenuItemsClient({ initialMenuItems, initialIncludeHidden }: MenuItemsClientProps) {
  const router = useRouter();
  const [menuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [includeHidden, setIncludeHidden] = useState(initialIncludeHidden);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingReorder, setPendingReorder] = useState<{ id: string; position: number }[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  // permissionsLoading is set but currently not displayed in UI
  const [, setPermissionsLoading] = useState(true);

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
          setUserPermissions(data.data?.permissions || []);
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

  const canCreate = hasPermission('menu.create');
  const canEdit = hasPermission('menu.edit');
  const canDelete = hasPermission('menu.delete');

  const handleIncludeHiddenChange = (checked: boolean) => {
    setIncludeHidden(checked);
    // Navigate to trigger server-side refetch with new parameter
    router.push(`/admin/menu-items?includeHidden=${checked}`);
  };

  const handleCreate = () => {
    if (!canCreate) {
      alert('⛔ Access Denied\n\nYou do not have permission to create menu items.\n\nMissing permission: menu.create');
      return;
    }
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    if (!canEdit) {
      alert('⛔ Access Denied\n\nYou do not have permission to edit menu items.\n\nMissing permission: menu.edit');
      return;
    }
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      alert('⛔ Access Denied\n\nYou do not have permission to delete menu items.\n\nMissing permission: menu.delete');
      return;
    }

    // Find the item to check if it's permanent
    const findItem = (items: MenuItem[], targetId: string): MenuItem | null => {
      for (const item of items) {
        if (item.id === targetId) return item;
        if (item.children.length > 0) {
          const found = findItem(item.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const item = findItem(menuItems, id);
    if (item?.isPermanent) {
      alert(`Cannot delete "${item.label}" because it is a protected system menu item.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this menu item and all its children?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/menu-items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete menu item');
      }

      // Refresh server data
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete menu item';
      alert(message);
    }
  };

  const handleReorder = (items: { id: string; position: number }[]) => {
    if (!canEdit) {
      alert('⛔ Access Denied\n\nYou do not have permission to reorder menu items.\n\nMissing permission: menu.edit');
      return;
    }
    // Store pending changes instead of saving immediately
    setPendingReorder(items);
    setHasUnsavedChanges(true);
  };

  const handleApplyChanges = async () => {
    if (pendingReorder.length === 0) return;
    
    if (!canEdit) {
      alert('⛔ Access Denied\n\nYou do not have permission to reorder menu items.\n\nMissing permission: menu.edit');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/menu-items/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pendingReorder }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder menu items');
      }

      setHasUnsavedChanges(false);
      setPendingReorder([]);
      alert('✅ Menu order updated successfully!');
      
      // Refresh server data
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reorder menu items';
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    setPendingReorder([]);
    // Refresh server data to restore original order
    router.refresh();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    // Refresh server data
    router.refresh();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📋</div>
            <div>
              <h3 className="font-semibold text-gray-100 mb-1">Navigation Menu Management</h3>
              <p className="text-sm text-gray-400">
                Create menu items that link to your pages or external websites. Drag items to reorder, nest them to create dropdowns, and toggle visibility.
              </p>
            </div>
          </div>
        </div>

        {/* Unsaved Changes Banner */}
        {hasUnsavedChanges && (
          <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-l-4 border-yellow-500 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-yellow-300 mb-1">Unsaved Changes</h3>
                <p className="text-sm text-yellow-200">
                  You have reordered menu items. Click &quot;Apply Changes&quot; to save the new order to your website.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Discard
              </button>
              <button
                onClick={handleApplyChanges}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/30 transition-all font-medium disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    ✓ Apply Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex justify-between items-center bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                id="includeHidden"
                checked={includeHidden}
                onChange={(e) => handleIncludeHiddenChange(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-700 rounded focus:ring-2 focus:ring-blue-500 bg-gray-800"
              />
              <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100">
                👁️ Show Hidden Items
              </span>
            </label>
            {!includeHidden && (
              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                Showing visible items only
              </span>
            )}
          </div>

          {canCreate ? (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Menu Item
            </button>
          ) : (
            <button
              onClick={() => alert('⛔ Access Denied\n\nYou do not have permission to create menu items.\n\nMissing permission: menu.create')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900/30 text-gray-500 border border-gray-800 rounded-lg cursor-not-allowed font-medium"
              disabled
            >
              <Lock className="w-5 h-5" />
              Add Menu Item
            </button>
          )}
        </div>

        {/* Menu Tree */}
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
          {menuItems.length === 0 ? (
            <div className="text-center py-16 px-4 bg-gray-900">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">No Menu Items Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Start building your navigation menu by creating your first menu item. You can link to pages or external websites.
              </p>
              {canCreate && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Create First Menu Item
                </button>
              )}
            </div>
          ) : (
            <div>
              {/* Header Row */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b-2 border-gray-700 px-6 py-3 flex items-center gap-4 text-sm font-semibold text-gray-300">
                <div className="w-5"></div> {/* Drag handle space */}
                <div className="flex-1">Menu Label & Link</div>
                <div className="w-20">Order</div>
                <div className="w-24">Actions</div>
              </div>
              
              {/* Instruction Banner Inside Table */}
              {!hasUnsavedChanges && menuItems.length > 0 && (
                <div className="bg-blue-900/20 border-b border-blue-800 px-6 py-3">
                  <p className="text-sm text-blue-300 flex items-center gap-2">
                    <span>💡</span>
                    <span>Drag items to reorder, then click &quot;Apply Changes&quot; to save the new order</span>
                  </p>
                </div>
              )}
              
              {/* Menu Items */}
              <MenuTree
                items={menuItems}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReorder={handleReorder}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <MenuItemModal
          item={editingItem}
          allItems={menuItems}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}
