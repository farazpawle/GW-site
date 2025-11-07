'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import UserTable from '@/components/admin/users/UserTable';
import ChangeRoleDialog from '@/components/admin/users/ChangeRoleDialog';
import { User, UserRole } from '@prisma/client';
import { Search } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch current user and users list
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/admin/current-user');
        const data = await response.json();
        
        if (data.success) {
          setCurrentUser(data.data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
    fetchUsers();
  }, []);

  // Filter users based on search and role filter
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      if (roleFilter === 'super_admin') {
        filtered = filtered.filter((user) => user.role === 'SUPER_ADMIN');
      } else {
        filtered = filtered.filter((user) => user.role === roleFilter);
      }
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setFilteredUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsDialogOpen(true);
    }
  };

  const handleConfirmRoleChange = async (userId: string, newRole: UserRole) => {
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newRole })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to update role');
    }

    // Refresh users list
    await fetchUsers();
    
    // Show success message (you can add a toast notification here)
    alert('Role updated successfully!');
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <AdminHeader
          pageTitle="Users"
          description="Manage user roles and permissions"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-8 py-6 space-y-6">
      <AdminHeader
        pageTitle="Users"
        description="Manage user roles and permissions"
      />

      {/* Search and Filter */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white placeholder-gray-500 focus:outline-none focus:border-brand-maroon transition-colors"
            />
          </div>

          {/* Role Filter */}
          <div className="md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white focus:outline-none focus:border-brand-maroon transition-colors"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin Only</option>
              <option value="ADMIN">Admin Only</option>
              <option value="VIEWER">Viewer Only</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          backgroundColor: '#1a1a1a',
          borderColor: '#2a2a2a'
        }}
      >
        {currentUser && (
          <UserTable 
            users={filteredUsers}
            currentUser={currentUser} 
          />
        )}
        {!currentUser && (
          <div className="p-6 text-center text-gray-400">
            Loading user permissions...
          </div>
        )}
      </div>

      {/* Role Change Dialog */}
      {selectedUser && (
        <ChangeRoleDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onConfirm={handleConfirmRoleChange}
        />
      )}
    </div>
  );
}
