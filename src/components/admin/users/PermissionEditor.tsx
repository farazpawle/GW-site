'use client';

import { useState, useEffect } from 'react';
import { Check, X, Star, Search, AlertCircle } from 'lucide-react';
import { RESOURCES, PERMISSIONS, PERMISSION_DESCRIPTIONS } from '@/lib/rbac/permissions';

interface PermissionEditorProps {
  userId: string;
  currentPermissions: string[];
  onSave: (permissions: string[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// Group permissions by resource category
const PERMISSION_GROUPS = {
  [RESOURCES.PRODUCTS]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.PRODUCTS_PUBLISH,
  ],
  [RESOURCES.CATEGORIES]: [
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_EDIT,
    PERMISSIONS.CATEGORIES_DELETE,
  ],
  [RESOURCES.PAGES]: [
    PERMISSIONS.PAGES_VIEW,
    PERMISSIONS.PAGES_CREATE,
    PERMISSIONS.PAGES_EDIT,
    PERMISSIONS.PAGES_DELETE,
    PERMISSIONS.PAGES_PUBLISH,
  ],
  [RESOURCES.MENU]: [
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MENU_CREATE,
    PERMISSIONS.MENU_EDIT,
    PERMISSIONS.MENU_DELETE,
  ],
  [RESOURCES.MEDIA]: [
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.MEDIA_DELETE,
  ],
  [RESOURCES.USERS]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_MANAGE_ROLES,
    PERMISSIONS.USERS_EDIT_PERMISSIONS,
  ],
  [RESOURCES.SETTINGS]: [
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
  ],
  [RESOURCES.MESSAGES]: [
    PERMISSIONS.MESSAGES_VIEW,
    PERMISSIONS.MESSAGES_DELETE,
  ],
  [RESOURCES.COLLECTIONS]: [
    PERMISSIONS.COLLECTIONS_VIEW,
    PERMISSIONS.COLLECTIONS_CREATE,
    PERMISSIONS.COLLECTIONS_EDIT,
    PERMISSIONS.COLLECTIONS_DELETE,
  ],
  [RESOURCES.HOMEPAGE]: [
    PERMISSIONS.HOMEPAGE_VIEW,
    PERMISSIONS.HOMEPAGE_EDIT,
  ],
  [RESOURCES.DASHBOARD]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_MESSAGE_CENTER,
    PERMISSIONS.DASHBOARD_ENGAGEMENT_OVERVIEW,
    PERMISSIONS.DASHBOARD_PRODUCT_INSIGHTS,
    PERMISSIONS.DASHBOARD_SEARCH_ANALYTICS,
    PERMISSIONS.DASHBOARD_STATISTICS,
    PERMISSIONS.DASHBOARD_RECENT_ACTIVITY,
  ],
};

export default function PermissionEditor({
  userId,
  currentPermissions,
  onSave,
  onCancel,
  isLoading = false,
}: PermissionEditorProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(currentPermissions)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  // Check if a category has all its permissions selected
  const isCategoryComplete = (category: string): boolean => {
    const categoryPerms = PERMISSION_GROUPS[category as keyof typeof PERMISSION_GROUPS];
    return categoryPerms.filter(Boolean).every(perm => selectedPermissions.has(perm));
  };

  // Check if category has wildcard permission
  const hasWildcard = (category: string): boolean => {
    return selectedPermissions.has(`${category}.*`);
  };

  // Toggle wildcard for a category
  const toggleWildcard = (category: string) => {
    const wildcard = `${category}.*`;
    const categoryPerms = PERMISSION_GROUPS[category as keyof typeof PERMISSION_GROUPS];
    
    const newPermissions = new Set(selectedPermissions);
    
    if (hasWildcard(category)) {
      // Remove wildcard
      newPermissions.delete(wildcard);
    } else {
      // Add wildcard and remove individual permissions
      newPermissions.add(wildcard);
      categoryPerms.forEach(perm => newPermissions.delete(perm));
    }
    
    setSelectedPermissions(newPermissions);
  };

  // Toggle individual permission
  const togglePermission = (permission: string) => {
    const newPermissions = new Set(selectedPermissions);
    
    // Extract category from permission (e.g., "products.view" -> "products")
    const category = permission.split('.')[0];
    const wildcard = `${category}.*`;
    
    // If wildcard is set, remove it first
    if (newPermissions.has(wildcard)) {
      newPermissions.delete(wildcard);
      // Add all other permissions in the category except this one
      const categoryPerms = PERMISSION_GROUPS[category as keyof typeof PERMISSION_GROUPS];
      categoryPerms.forEach(perm => {
        if (perm !== permission) {
          newPermissions.add(perm);
        }
      });
    } else if (newPermissions.has(permission)) {
      newPermissions.delete(permission);
    } else {
      newPermissions.add(permission);
    }
    
    setSelectedPermissions(newPermissions);
  };

  // Select all permissions in a category
  const selectAllInCategory = (category: string) => {
    const categoryPerms = PERMISSION_GROUPS[category as keyof typeof PERMISSION_GROUPS];
    const newPermissions = new Set(selectedPermissions);
    categoryPerms.filter(Boolean).forEach(perm => newPermissions.add(perm));
    setSelectedPermissions(newPermissions);
  };

  // Deselect all permissions in a category
  const deselectAllInCategory = (category: string) => {
    const categoryPerms = PERMISSION_GROUPS[category as keyof typeof PERMISSION_GROUPS];
    const wildcard = `${category}.*`;
    const newPermissions = new Set(selectedPermissions);
    categoryPerms.filter(Boolean).forEach(perm => newPermissions.delete(perm));
    newPermissions.delete(wildcard);
    setSelectedPermissions(newPermissions);
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(Array.from(selectedPermissions));
    } catch (error) {
      console.error('Failed to save permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  // Filter permissions by search
  const filteredCategories = Object.keys(PERMISSION_GROUPS).filter(category => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const categoryName = category.toLowerCase();
    
    // Search by category name
    if (categoryName.includes(query)) return true;
    
    // Search by permission descriptions
    const categoryPerms = PERMISSION_GROUPS[category as keyof typeof PERMISSION_GROUPS];
    return categoryPerms.filter(Boolean).some(perm => {
      const description = PERMISSION_DESCRIPTIONS[perm] || '';
      return description.toLowerCase().includes(query);
    });
  });

  const hasChanges = 
    selectedPermissions.size !== currentPermissions.length ||
    !currentPermissions.every(p => selectedPermissions.has(p));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a2a]">
          <h2 className="text-2xl font-bold text-white mb-2">Edit Permissions</h2>
          <p className="text-gray-400 text-sm">
            Select individual permissions or use wildcards (⭐) to grant all permissions for a category.
          </p>
          
          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search permissions..."
              className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto mb-3 text-gray-500" size={48} />
                <p className="text-gray-400">No permissions found matching "{searchQuery}"</p>
              </div>
            ) : (
              filteredCategories.map(category => {
                const categoryPerms = PERMISSION_GROUPS[category as keyof typeof PERMISSION_GROUPS];
                const wildcardEnabled = hasWildcard(category);
                const allSelected = isCategoryComplete(category);
                
                return (
                  <div
                    key={category}
                    className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#2a2a2a]">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white capitalize">
                          {category}
                        </h3>
                        {wildcardEnabled && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            <Star size={12} className="fill-yellow-400" />
                            Wildcard
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Wildcard Toggle */}
                        <button
                          onClick={() => toggleWildcard(category)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            wildcardEnabled
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-[#2a2a2a] text-gray-400 border border-[#2a2a2a] hover:bg-[#3a3a3a]'
                          }`}
                        >
                          <Star size={14} className={wildcardEnabled ? 'fill-yellow-400' : ''} />
                          <span>All {category}</span>
                        </button>
                        
                        {/* Select/Deselect All */}
                        {!wildcardEnabled && (
                          <button
                            onClick={() => 
                              allSelected 
                                ? deselectAllInCategory(category)
                                : selectAllInCategory(category)
                            }
                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#2a2a2a] text-gray-400 border border-[#2a2a2a] hover:bg-[#3a3a3a] transition-all"
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Permissions Grid */}
                    {!wildcardEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPerms.filter(Boolean).map(permission => {
                          const isSelected = selectedPermissions.has(permission);
                          const description = PERMISSION_DESCRIPTIONS[permission] || permission;
                          const permissionName = permission.split('.')[1];
                          
                          return (
                            <button
                              key={permission}
                              onClick={() => togglePermission(permission)}
                              className={`flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                                isSelected
                                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                  : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'
                              }`}
                            >
                              <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-600'
                              }`}>
                                {isSelected && <Check size={14} className="text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium capitalize text-sm">
                                  {permissionName}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {description}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    
                    {wildcardEnabled && (
                      <div className="text-center py-6 text-gray-500">
                        <Star size={32} className="mx-auto mb-2 fill-yellow-400 text-yellow-400" />
                        <p className="text-sm">All {category} permissions are granted via wildcard</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2a2a2a] flex items-center justify-between bg-[#0a0a0a]">
          <div className="text-sm text-gray-400">
            <span className="font-medium text-white">{selectedPermissions.size}</span> permissions selected
            {hasChanges && (
              <span className="ml-2 text-yellow-400">• Unsaved changes</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving || isLoading}
              className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
