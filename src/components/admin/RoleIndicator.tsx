'use client';

import { useEffect, useState } from 'react';
import { Shield, Star } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  roleLevel?: number;
  permissions?: string[];
}

export default function RoleIndicator() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/admin/users/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2a2a2a] animate-pulse">
        <div className="w-4 h-4 bg-[#3a3a3a] rounded"></div>
        <div className="w-20 h-4 bg-[#3a3a3a] rounded"></div>
      </div>
    );
  }

  if (!user) return null;

  const permissions = user.permissions || [];
  const hasWildcards = permissions.some(p => p.endsWith('.*'));

  // Safety check for role
  if (!user.role) return null;

  // Role badge color based on role
  const roleColor = 
    user.role === 'SUPER_ADMIN' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
    user.role === 'ADMIN' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
    user.role === 'STAFF' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
    user.role === 'CONTENT_EDITOR' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
    'bg-gray-500/20 text-gray-400 border-gray-500/30';

  // Format role name for display
  const roleDisplay = user.role.replace(/_/g, ' ');

  return (
    <div className="flex items-center gap-2">
      {/* Role Badge */}
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${roleColor}`}>
        <Shield size={14} />
        <span className="text-xs font-semibold">{roleDisplay}</span>
      </div>

      {/* Permissions Badge */}
      {permissions.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
          {hasWildcards && <Star size={12} className="fill-yellow-400 text-yellow-400" />}
          <span className="text-xs font-medium">{permissions.length} perms</span>
        </div>
      )}
    </div>
  );
}
