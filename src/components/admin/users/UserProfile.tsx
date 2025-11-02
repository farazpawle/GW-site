'use client';

import { User } from '@prisma/client';
import RoleBadge from './RoleBadge';
import { ExternalLink } from 'lucide-react';
import { isSuperAdmin } from '@/lib/admin/role-utils';

interface UserProfileProps {
  user: User;
  currentUser: User;
  onChangeRole: () => void;
}

/**
 * UserProfile Component
 * 
 * Displays user profile information with action buttons
 */
export default function UserProfile({ user, currentUser, onChangeRole }: UserProfileProps) {
  const currentUserIsSuperAdmin = isSuperAdmin(currentUser);
  const targetIsSuperAdmin = user.role === 'SUPER_ADMIN';
  const canChangeRole = !targetIsSuperAdmin || currentUserIsSuperAdmin;
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-6 border-t border-[#2a2a2a]">
          {canChangeRole ? (
            <button
              onClick={onChangeRole}
              className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#6e0000' }}
            >
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

          <a
            href={`https://dashboard.clerk.com/`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg border border-[#2a2a2a] text-gray-400 hover:bg-[#2a2a2a] transition-colors inline-flex items-center gap-2"
          >
            View in Clerk
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
