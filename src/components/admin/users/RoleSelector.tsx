'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, Check } from 'lucide-react';
import { UserRole } from '@prisma/client';
import { ROLE_LEVELS } from '@/lib/rbac/permissions';

interface RoleSelectorProps {
  userId: string;
  currentRole: UserRole;
  currentUserRole: UserRole;
  currentUserRoleLevel: number;
  onSave: (newRole: UserRole) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ROLE_INFO: Record<UserRole, { level: number; label: string; description: string; color: string }> = {
  SUPER_ADMIN: {
    level: ROLE_LEVELS.SUPER_ADMIN,
    label: 'Super Admin',
    description: 'Full system access, can manage all users and roles',
    color: 'purple',
  },
  ADMIN: {
    level: ROLE_LEVELS.ADMIN,
    label: 'Admin',
    description: 'Can manage content and most users, but cannot change roles',
    color: 'blue',
  },
  STAFF: {
    level: ROLE_LEVELS.STAFF,
    label: 'Staff',
    description: 'Can edit content and view analytics, limited user management',
    color: 'green',
  },
  CONTENT_EDITOR: {
    level: ROLE_LEVELS.CONTENT_EDITOR,
    label: 'Content Editor',
    description: 'Can create and edit products, pages, and media',
    color: 'cyan',
  },
  VIEWER: {
    level: ROLE_LEVELS.VIEWER,
    label: 'Viewer',
    description: 'Read-only access to content and analytics',
    color: 'gray',
  },
};

const COLOR_CLASSES = {
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    hover: 'hover:bg-purple-500/20',
    selected: 'bg-purple-500/20 border-purple-500',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    hover: 'hover:bg-blue-500/20',
    selected: 'bg-blue-500/20 border-blue-500',
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    hover: 'hover:bg-green-500/20',
    selected: 'bg-green-500/20 border-green-500',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    hover: 'hover:bg-cyan-500/20',
    selected: 'bg-cyan-500/20 border-cyan-500',
  },
  gray: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    hover: 'hover:bg-gray-500/20',
    selected: 'bg-gray-500/20 border-gray-500',
  },
};

export default function RoleSelector({
  // userId not used in this component
  currentRole,
  currentUserRole,
  currentUserRoleLevel,
  onSave,
  onCancel,
  isLoading = false,
}: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [saving, setSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get available roles (only lower or equal level)
  const availableRoles = (Object.keys(ROLE_INFO) as UserRole[])
    .filter(role => {
      // Super Admin can assign any role
      if (currentUserRole === 'SUPER_ADMIN') return true;
      
      // Others can only assign roles with lower or equal level
      const roleLevel = ROLE_INFO[role].level;
      return roleLevel < currentUserRoleLevel;
    });

  const hasChanges = selectedRole !== currentRole;
  const selectedRoleInfo = ROLE_INFO[selectedRole];
  const currentRoleInfo = ROLE_INFO[currentRole];

  const handleSave = async () => {
    if (!hasChanges) {
      onCancel();
      return;
    }

    // Show confirmation for role changes
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setSaving(true);
    try {
      await onSave(selectedRole);
    } catch (error) {
      console.error('Failed to change role:', error);
      setShowConfirmation(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
    } else {
      onCancel();
    }
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle size={20} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Confirm Role Change</h3>
              <p className="text-sm text-gray-400">
                This action will change the user&apos;s role and permissions.
              </p>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs text-gray-500 mb-1">From</div>
                <div className={`font-semibold ${COLOR_CLASSES[currentRoleInfo.color as keyof typeof COLOR_CLASSES].text}`}>
                  {currentRoleInfo.label}
                </div>
                <div className="text-xs text-gray-500">Level {currentRoleInfo.level}</div>
              </div>
              <div className="text-gray-600">→</div>
              <div>
                <div className="text-xs text-gray-500 mb-1">To</div>
                <div className={`font-semibold ${COLOR_CLASSES[selectedRoleInfo.color as keyof typeof COLOR_CLASSES].text}`}>
                  {selectedRoleInfo.label}
                </div>
                <div className="text-xs text-gray-500">Level {selectedRoleInfo.level}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {saving ? 'Changing...' : 'Confirm Change'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a2a]">
          <h2 className="text-2xl font-bold text-white mb-2">Change User Role</h2>
          <p className="text-gray-400 text-sm">
            Select a new role for this user. You can only assign roles with lower access level than yours.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {availableRoles.map(role => {
              const roleInfo = ROLE_INFO[role];
              const isSelected = selectedRole === role;
              const isCurrent = currentRole === role;
              const colors = COLOR_CLASSES[roleInfo.color as keyof typeof COLOR_CLASSES];
              
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  disabled={isCurrent}
                  className={`w-full flex items-start gap-4 p-4 rounded-lg border transition-all text-left ${
                    isSelected
                      ? `${colors.selected} ${colors.text}`
                      : isCurrent
                      ? 'bg-[#0a0a0a] border-[#2a2a2a] opacity-50 cursor-not-allowed'
                      : `${colors.bg} ${colors.border} ${colors.text} ${colors.hover}`
                  }`}
                >
                  <div className={`flex-shrink-0 mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? `${colors.text} bg-current`
                      : 'border-gray-600'
                  }`}>
                    {isSelected && <Check size={14} className="text-[#1a1a1a]" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={16} />
                      <span className="font-semibold text-base">{roleInfo.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#2a2a2a] text-gray-400">
                        Level {roleInfo.level}
                      </span>
                      {isCurrent && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{roleInfo.description}</p>
                  </div>
                </button>
              );
            })}

            {availableRoles.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto mb-3 text-gray-500" size={48} />
                <p className="text-gray-400">No roles available to assign</p>
                <p className="text-sm text-gray-500 mt-1">
                  You can only assign roles with lower access level than yours
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2a2a2a] flex items-center justify-between bg-[#0a0a0a]">
          <div className="text-sm text-gray-400">
            {hasChanges && (
              <span className="text-yellow-400">• Unsaved changes</span>
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
              {hasChanges ? 'Change Role' : 'No Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
