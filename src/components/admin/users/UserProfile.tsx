'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import RoleBadge from './RoleBadge';
import { Edit, Shield } from 'lucide-react';
import { isSuperAdmin } from '@/lib/admin/role-utils';
import PermissionEditor from './PermissionEditor';
import RoleSelector from './RoleSelector';
import { PERMISSIONS } from '@/lib/rbac/permissions';

interface UserProfileProps {
  user: User;
  currentUser: User;
  onChangeRole: () => void;
  onUpdate: () => void;
}

/**
 * UserProfile Component
 * 
 * Displays user profile information with action buttons
 */
export default function UserProfile({ user, currentUser, onChangeRole, onUpdate }: UserProfileProps) {
  const [showPermissionEditor, setShowPermissionEditor] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showAllPermissions, setShowAllPermissions] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const currentUserIsSuperAdmin = isSuperAdmin(currentUser);
  const targetIsSuperAdmin = user.role === 'SUPER_ADMIN';
  
  // Check if current user has permission to edit permissions
  const currentUserPermissions = (currentUser as any).permissions || [];
  const hasEditPermissionsPermission = currentUserIsSuperAdmin || 
    currentUserPermissions.includes(PERMISSIONS.USERS_EDIT_PERMISSIONS) ||
    currentUserPermissions.includes(PERMISSIONS.USERS_ALL);
  
  // Check if current user has permission to manage roles
  const hasManageRolesPermission = currentUserIsSuperAdmin || 
    currentUserPermissions.includes(PERMISSIONS.USERS_MANAGE_ROLES) ||
    currentUserPermissions.includes(PERMISSIONS.USERS_ALL);
  
  // Check if viewing own profile
  const isSameUser = user.id === currentUser.id;
  
  // Can change role if:
  // 1. Has the manage_roles permission
  // 2. Target is NOT the same user (can't change own role)
  // 3. Target is not a super admin OR current user is super admin
  // 4. Target role level is lower than current user (or current user is super admin)
  const canChangeRole = hasManageRolesPermission && 
    !isSameUser &&
    (!targetIsSuperAdmin || currentUserIsSuperAdmin) &&
    ((user as any).roleLevel < (currentUser as any).roleLevel || currentUserIsSuperAdmin);
  
  // Can edit permissions if:
  // 1. Has the edit_permissions permission
  // 2. Target is NOT the same user (can't edit own permissions)
  // 3. Target role level is lower than current user (or current user is super admin)
  const canEditPermissions = hasEditPermissionsPermission && 
    !isSameUser &&
    ((user as any).roleLevel < (currentUser as any).roleLevel || currentUserIsSuperAdmin);
  
  // Debug logging
  console.log('🔍 UserProfile Debug:', {
    targetUser: user.email,
    targetRole: user.role,
    targetRoleLevel: (user as any).roleLevel,
    currentUser: currentUser.email,
    currentRole: currentUser.role,
    currentRoleLevel: (currentUser as any).roleLevel,
    currentUserPermissions: currentUserPermissions.length,
    hasEditPermissionsPermission,
    hasManageRolesPermission,
    isSameUser,
    canEditPermissions,
    canChangeRole,
    editPermissionInList: currentUserPermissions.includes(PERMISSIONS.USERS_EDIT_PERMISSIONS),
    manageRolesInList: currentUserPermissions.includes(PERMISSIONS.USERS_MANAGE_ROLES),
  });
  
  // Handle permission save
  const handleSavePermissions = async (permissions: string[]) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        // Show user-friendly message without throwing error
        alert(data.error || 'Failed to update permissions');
        setLoading(false);
        return;
      }
      
      setShowPermissionEditor(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to save permissions:', error);
      alert('Failed to update permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle role change
  const handleSaveRole = async (newRole: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        // Show user-friendly message without throwing error
        alert(data.error || 'Failed to change role');
        setLoading(false);
        return;
      }
      
      setShowRoleSelector(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to change role:', error);
      alert('Failed to change role. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Generate initials from name or email
  const getInitials = (): string => {
    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      className="relative rounded-xl border p-8 overflow-hidden"
      style={{
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a'
      }}
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-maroon/5 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative">
        {/* Avatar & Basic Info */}
        <div className="flex items-start gap-6 mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
            style={{ backgroundColor: '#6e0000' }}
          >
            {getInitials()}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              {user.name || 'No Name'}
            </h2>
            <p className="text-gray-400 mb-3">{user.email}</p>
            <RoleBadge role={user.role} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">User ID</p>
            <p className="text-white font-mono text-sm">{user.id}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Member Since</p>
            <p className="text-white">{formatDate(user.createdAt)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Last Updated</p>
            <p className="text-white">{formatDate(user.updatedAt)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Status</p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
              Active
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Permissions Count</p>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-400 border border-blue-800">
              {(user as any).permissions?.length || 0} permissions assigned
            </span>
          </div>
        </div>

        {/* RBAC Permissions Section - Compact View */}
        <div className="mb-6 pt-6 border-t border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">🔒 Permissions (RBAC)</h3>
            {(user as any).permissions && (user as any).permissions.length > 0 && (
              <button
                onClick={() => setShowAllPermissions(!showAllPermissions)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {showAllPermissions ? 'Show Less' : `Show All (${(user as any).permissions.length})`}
              </button>
            )}
          </div>
          
          {(user as any).permissions && (user as any).permissions.length > 0 ? (
            <>
              {/* Group permissions by resource */}
              {(() => {
                const permissions = (user as any).permissions as string[];
                const grouped: Record<string, string[]> = {};
                
                permissions.forEach((perm: string) => {
                  const [resource] = perm.split('.');
                  if (!grouped[resource]) grouped[resource] = [];
                  grouped[resource].push(perm);
                });

                const resources = Object.keys(grouped);
                const displayResources = showAllPermissions ? resources : resources.slice(0, 5);

                return (
                  <div className="space-y-3">
                    {displayResources.map((resource) => (
                      <div
                        key={resource}
                        className="px-4 py-3 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">
                            {resource.endsWith('.*') || grouped[resource].some(p => p.endsWith('.*')) ? '⭐ ' : ''}
                            {resource}
                          </span>
                          <span className="text-xs text-gray-500">
                            {grouped[resource].length} permission{grouped[resource].length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {grouped[resource].map((perm, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono ${
                                perm.endsWith('.*')
                                  ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                                  : 'bg-gray-800/50 text-gray-400 border border-gray-700'
                              }`}
                            >
                              {perm.split('.').slice(1).join('.')}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {!showAllPermissions && resources.length > 5 && (
                      <div className="text-center py-2 text-sm text-gray-500">
                        ... and {resources.length - 5} more resource{resources.length - 5 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                );
              })()}
              
              {(user as any).permissions?.some((p: string) => p.endsWith('.*')) && (
                <p className="text-xs text-gray-500 mt-3">
                  ⭐ Wildcard permissions (.*) grant full access to that resource category
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-gray-500 border border-dashed border-[#2a2a2a] rounded-lg">
              No permissions assigned
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-6 border-t border-[#2a2a2a]">
          {canEditPermissions && (
            <button
              onClick={() => setShowPermissionEditor(true)}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#6e0000' }}
            >
              <Edit size={16} />
              Edit Permissions
            </button>
          )}
          
          {canChangeRole ? (
            <button
              onClick={() => setShowRoleSelector(true)}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#6e0000' }}
            >
              <Shield size={16} />
              Change Role
            </button>
          ) : (
            <div 
              className="px-4 py-2 rounded-lg font-medium text-gray-500 border border-[#2a2a2a] cursor-not-allowed opacity-50"
              title="Only super admins can change super admin roles"
            >
              Change Role (Super Admin Only)
            </div>
          )}
        </div>
      </div>
      
      {/* Permission Editor Modal */}
      {showPermissionEditor && (
        <PermissionEditor
          userId={user.id}
          currentPermissions={(user as any).permissions || []}
          onSave={handleSavePermissions}
          onCancel={() => setShowPermissionEditor(false)}
          isLoading={loading}
        />
      )}
      
      {/* Role Selector Modal */}
      {showRoleSelector && (
        <RoleSelector
          userId={user.id}
          currentRole={user.role}
          currentUserRole={currentUser.role}
          currentUserRoleLevel={(currentUser as any).roleLevel || 10}
          onSave={handleSaveRole}
          onCancel={() => setShowRoleSelector(false)}
          isLoading={loading}
        />
      )}
    </div>
  );
}
