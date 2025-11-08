'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import MessageDetailModal from '@/components/admin/MessageDetailModal';
import { Search, Mail, MailOpen, MailCheck, Trash2, Eye, Loader2, Lock } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED';
  createdAt: string;
}

interface Stats {
  total: number;
  unread: number;
  read: number;
  replied: number;
}

export default function MessagesPage() {
  // messages is synced with filteredMessages but kept for reference
  const [, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, read: 0, replied: 0 });
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

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

  const canView = hasPermission('messages.view');
  const canDelete = hasPermission('messages.delete');

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchQuery,
        status: statusFilter
      });

      const response = await fetch(`/api/admin/messages?${params}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages);
        setFilteredMessages(data.data.messages);
        setTotalPages(data.data.pagination.pages);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // fetchMessages is stable and doesn't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, statusFilter]);

  // Mark message as read or update status
  const handleStatusUpdate = async (id: string, status: 'UNREAD' | 'READ' | 'REPLIED') => {
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchMessages();
        // Update the selected message if it's currently open
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status });
        }
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  // Delete message
  const handleDelete = async (id: string) => {
    if (!canDelete) {
      alert('⛔ Access Denied\n\nYou do not have permission to delete messages.\n\nMissing permission: messages.delete');
      return;
    }

    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchMessages();
        // Close modal if deleting the currently viewed message
        if (selectedMessage?.id === id) {
          setIsModalOpen(false);
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // View message details
  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    
    // Mark as read if unread
    if (message.status === 'UNREAD') {
      handleStatusUpdate(message.id, 'READ');
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNREAD':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-xs font-medium animate-pulse">
            <Mail className="w-3 h-3" />
            New
          </span>
        );
      case 'READ':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-medium">
            <MailOpen className="w-3 h-3" />
            Read
          </span>
        );
      case 'REPLIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
            <MailCheck className="w-3 h-3" />
            Replied
          </span>
        );
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user has view permission
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <AdminHeader pageTitle="Contact Messages" description="Manage customer inquiries and messages" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-coral mx-auto mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <AdminHeader pageTitle="Contact Messages" description="Manage customer inquiries and messages" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-900/30 border border-red-800 mb-6">
              <Lock className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
            <p className="text-gray-400 mb-2">You do not have permission to view messages.</p>
            <p className="text-sm text-gray-500">Missing permission: <code className="px-2 py-1 bg-[#1a1a1a] rounded">messages.view</code></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <AdminHeader pageTitle="Contact Messages" description="Manage customer inquiries and messages" />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Messages</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Unread</p>
              <p className="text-3xl font-bold text-red-400">{stats.unread}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Read</p>
              <p className="text-3xl font-bold text-amber-400">{stats.read}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <MailOpen className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Replied</p>
              <p className="text-3xl font-bold text-emerald-400">{stats.replied}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <MailCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-coral transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-black/50 border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-brand-coral transition-colors"
          >
            <option value="all">All Status</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
            <option value="REPLIED">Replied</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-coral" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-20">
            <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No messages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50 border-b border-[#2a2a2a]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {filteredMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-black/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(message.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-white font-medium">{message.name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-gray-400">{message.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 truncate max-w-xs">
                        {message.subject || 'No subject'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-gray-400 text-sm">{formatDate(message.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewMessage(message)}
                          className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canDelete ? (
                          <button
                            onClick={() => handleDelete(message.id)}
                            className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(message.id)}
                            className="p-2 text-gray-600 rounded-lg cursor-not-allowed"
                            title="No permission to delete"
                            disabled
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredMessages.length > 0 && (
          <div className="px-6 py-4 bg-black/50 border-t border-[#2a2a2a] flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <MessageDetailModal
        message={selectedMessage}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusUpdate={handleStatusUpdate}
        onDelete={handleDelete}
        canDelete={canDelete}
      />
    </div>
  );
}
