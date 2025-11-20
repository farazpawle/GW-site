'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { X, AlertTriangle } from 'lucide-react';
import { isSuperAdmin } from '@/lib/admin/role-utils';

interface ChangeRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
  };
  onConfirm: (userId: string, newRole: UserRole) => Promise<void>;
}

/**
 * ChangeRoleDialog Component
 * 
 * Modal dialog for changing a user's role with confirmation
 */
export default function ChangeRoleDialog({
  isOpen,
  onClose,
  user,
  onConfirm
}: ChangeRoleDialogProps) {
  const [newRole, setNewRole] = useState<UserRole>(user.role);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserIsSuperAdmin, setCurrentUserIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user and check if super admin
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/admin/current-user');
        const data = await response.json();
        
        if (data.success) {
          setCurrentUserIsSuperAdmin(isSuperAdmin(data.data.user));
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchCurrentUser();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (newRole === user.role) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(user.id, newRole);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-xl border"
        style={{
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-bold text-white">Change User Role</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#2a2a2a] transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* User Info */}
          <div className="p-4 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a]">
            <p className="text-sm text-gray-400">User</p>
            <p className="text-white font-medium">{user.name || user.email}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          {/* Current Role */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Current Role
            </label>
            <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a]">
              <span className="text-white font-medium">{user.role}</span>
            </div>
          </div>

          {/* New Role Selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              New Role <span className="text-red-500">*</span>
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white focus:outline-none focus:border-brand-maroon transition-colors"
              disabled={isSubmitting || isLoading}
            >
              {/* SUPER_ADMIN option - only visible to super admins */}
              {currentUserIsSuperAdmin && (
                <option 
                  value="SUPER_ADMIN" 
                  className="bg-gradient-to-r from-yellow-600 to-amber-600"
                >
                  SUPER ADMIN
                </option>
              )}
              
              {/* ADMIN option - available to super admins, or current admins */}
              <option 
                value="ADMIN"
                disabled={!currentUserIsSuperAdmin}
              >
                ADMIN {!currentUserIsSuperAdmin ? '(Requires Super Admin)' : ''}
              </option>
              
              {/* VIEWER option - available to everyone */}
              <option value="VIEWER">VIEWER</option>
            </select>
          </div>

          {/* Hierarchy Warning Message */}
          {!currentUserIsSuperAdmin && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <AlertTriangle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-400 font-medium text-sm">Role Hierarchy</p>
                <p className="text-blue-200 text-sm mt-1">
                  Only super admins can create or modify admin users. You can only assign VIEWER role.
                </p>
              </div>
            </div>
          )}

          {/* Warning for SUPER_ADMIN role */}
          {newRole === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN' && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-500 font-medium text-sm">Critical Warning</p>
                <p className="text-yellow-200 text-sm mt-1">
                  This user will gain SUPER ADMIN access with full control over all users, including other admins. This action cannot be easily reversed.
                </p>
              </div>
            </div>
          )}

          {/* Warning for ADMIN role */}
          {newRole === 'ADMIN' && user.role !== 'ADMIN' && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-500 font-medium text-sm">Warning</p>
                <p className="text-yellow-200 text-sm mt-1">
                  This user will gain admin access to manage products, orders, and viewer users.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#2a2a2a]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#2a2a2a] text-gray-400 hover:bg-[#2a2a2a] transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white font-medium transition-all"
            style={{ backgroundColor: '#6e0000' }}
            disabled={isSubmitting || newRole === user.role}
          >
            {isSubmitting ? 'Updating...' : 'Confirm Change'}
          </button>
        </div>
      </div>
    </div>
  );
}
