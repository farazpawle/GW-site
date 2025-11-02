'use client';

import { User } from '@prisma/client';
import RoleBadge from './RoleBadge';
import { Eye, UserCog } from 'lucide-react';
import Link from 'next/link';
import { isSuperAdmin } from '@/lib/admin/role-utils';

interface UserTableProps {
  users: User[];
  currentUser: User;
  onRoleChange?: (userId: string) => void;
}

/**
 * UserTable Component
 * 
 * Displays a table of users with their details and action buttons
 */
export default function UserTable({ users, currentUser, onRoleChange }: UserTableProps) {
  const currentUserIsSuperAdmin = isSuperAdmin(currentUser);
  // Generate initials from name or email
  const getInitials = (user: User): string => {
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
      month: 'short',
      day: 'numeric'
    });
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2a2a2a]">
            <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">User</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Email</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Role</th>
            <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Joined</th>
            <th className="text-right py-4 px-4 text-sm font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors"
            >
              {/* Avatar & Name */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: '#6e0000' }}
                  >
                    {getInitials(user)}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {user.name || 'No Name'}
                    </p>
                  </div>
                </div>
              </td>

              {/* Email */}
              <td className="py-4 px-4">
                <p className="text-gray-400 text-sm">{user.email}</p>
              </td>

              {/* Role Badge */}
              <td className="py-4 px-4">
                <RoleBadge role={user.role} />
              </td>

              {/* Joined Date */}
              <td className="py-4 px-4">
                <p className="text-gray-400 text-sm">{formatDate(user.createdAt)}</p>
              </td>

              {/* Actions */}
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="p-2 rounded-lg border border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} className="text-gray-400" />
                  </Link>
                  
                  {/* Hide role change button for super admins if current user is not super admin */}
                  {(user.role !== 'SUPER_ADMIN' || currentUserIsSuperAdmin) && (
                    <button
                      onClick={() => onRoleChange?.(user.id)}
                      className="p-2 rounded-lg border border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors"
                      title={
                        user.role === 'SUPER_ADMIN' 
                          ? "Manage Super Admin Role" 
                          : "Change Role"
                      }
                    >
                      <UserCog size={16} className="text-gray-400" />
                    </button>
                  )}
                  
                  {/* Show lock indicator for super admins (when current user is not super admin) */}
                  {user.role === 'SUPER_ADMIN' && !currentUserIsSuperAdmin && (
                    <div 
                      className="p-2 rounded-lg border border-[#2a2a2a] opacity-50 cursor-not-allowed"
                      title="Only super admins can manage super admin users"
                    >
                      <UserCog size={16} className="text-gray-600" />
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
