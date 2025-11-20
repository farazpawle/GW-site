'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Eye, 
  Filter,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  MessageSquare,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

// ============================================================
// Types
// ============================================================

type QuoteRequestStatus = 'PENDING' | 'REVIEWED' | 'RESPONDED' | 'CLOSED';

interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  status: QuoteRequestStatus;
  products: Array<{name: string; quantity: number}>;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
  respondedBy: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================
// Status Badge Component
// ============================================================

const StatusBadge = ({ status }: { status: QuoteRequestStatus }) => {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    REVIEWED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    RESPONDED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };

  const icons = {
    PENDING: <Clock size={14} />,
    REVIEWED: <Eye size={14} />,
    RESPONDED: <CheckCircle size={14} />,
    CLOSED: <XCircle size={14} />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

// ============================================================
// Admin Quotes Page Component
// ============================================================

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<QuoteRequestStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // ============================================================
  // Fetch Quote Requests
  // ============================================================

  const fetchQuotes = async (page: number = 1, status?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (status && status !== 'ALL') {
        params.append('status', status);
      }

      const response = await fetch(`/api/quote-requests?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quotes: ${response.status}`);
      }

      const data = await response.json();
      setQuotes(data.quoteRequests);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Fetch quotes error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  // Load quotes on mount and filter change
  useEffect(() => {
    fetchQuotes(1, statusFilter === 'ALL' ? undefined : statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // ============================================================
  // Filter quotes locally by search query
  // ============================================================

  const filteredQuotes = quotes.filter((quote) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      quote.name.toLowerCase().includes(search) ||
      quote.email.toLowerCase().includes(search) ||
      quote.company?.toLowerCase().includes(search) ||
      quote.message.toLowerCase().includes(search)
    );
  });

  // ============================================================
  // Format date helper
  // ============================================================

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quote Requests</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and respond to customer quote requests
          </p>
        </div>
        
        <button
          onClick={() => fetchQuotes(pagination.page, statusFilter === 'ALL' ? undefined : statusFilter)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter size={16} className="inline mr-1" />
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as QuoteRequestStatus | 'ALL')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="RESPONDED">Responded</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Search size={16} className="inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or company..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['PENDING', 'REVIEWED', 'RESPONDED', 'CLOSED'] as const).map((status) => {
          const count = quotes.filter((q) => q.status === status).length;
          return (
            <div key={status} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{count}</p>
                </div>
                <StatusBadge status={status} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw size={32} className="animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading quotes...</p>
        </div>
      )}

      {/* Quote Requests List */}
      {!loading && !error && (
        <>
          {filteredQuotes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'No quotes found matching your search' : 'No quote requests yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotes.map((quote) => (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {quote.name}
                          </h3>
                          <StatusBadge status={quote.status} />
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          {quote.email}
                        </div>
                        {quote.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            {quote.phone}
                          </div>
                        )}
                        {quote.company && (
                          <div className="flex items-center gap-1">
                            <Building size={14} />
                            {quote.company}
                          </div>
                        )}
                      </div>

                      {/* Message Preview */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {quote.message}
                      </p>

                      {/* Product Info */}
                      {quote.products && Array.isArray(quote.products) && quote.products.length > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Products:</strong>{' '}
                          {quote.products.map((p: {partName?: string; name?: string}) => p.partName || p.name || 'Unknown').join(', ')}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                        <Calendar size={12} />
                        {formatDate(quote.createdAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <Link
                        href={`/admin/quotes/${quote.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        <Eye size={16} />
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} quotes
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchQuotes(pagination.page - 1, statusFilter === 'ALL' ? undefined : statusFilter)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => fetchQuotes(pagination.page + 1, statusFilter === 'ALL' ? undefined : statusFilter)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
