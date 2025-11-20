'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Package,
  DollarSign,
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
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
  products: Array<{
    partId: string;
    partName: string;
    partNumber?: string;
    price?: number;
    quantity: number;
  }> | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
  respondedBy: string | null;
}

// ============================================================
// Admin Quote Detail Page Component
// ============================================================

export default function AdminQuoteDetailPage() {
  const params = useParams();
  const quoteId = params?.id as string;

  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [status, setStatus] = useState<QuoteRequestStatus>('PENDING');
  const [adminNotes, setAdminNotes] = useState('');

  // ============================================================
  // Fetch Quote Request
  // ============================================================

  useEffect(() => {
    if (!quoteId) return;

    const fetchQuote = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/quote-requests/${quoteId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Quote request not found');
          }
          throw new Error(`Failed to fetch quote: ${response.status}`);
        }

        const data = await response.json();
        setQuote(data.quoteRequest);
        setStatus(data.quoteRequest.status);
        setAdminNotes(data.quoteRequest.adminNotes || '');
      } catch (err) {
        console.error('Fetch quote error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quote');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId]);

  // ============================================================
  // Update Quote Request
  // ============================================================

  const handleSave = async () => {
    if (!quote) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/quote-requests/${quoteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          adminNotes: adminNotes || null,
          respondedBy: status === 'RESPONDED' ? 'admin' : undefined, // TODO: Get actual user ID
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update quote: ${response.status}`);
      }

      const data = await response.json();
      setQuote(data.quoteRequest);
      setSuccess(true);

      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Update quote error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update quote');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Format date helper
  // ============================================================

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================================
  // Render
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading quote request...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
            <AlertCircle size={20} />
            <h2 className="font-semibold">Error Loading Quote</h2>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">{error || 'Quote not found'}</p>
          <Link
            href="/admin/quotes"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <ArrowLeft size={16} />
            Back to Quotes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/quotes"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quote Request Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Request from {quote.name} • {formatDate(quote.createdAt)}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2"
        >
          <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200">Quote request updated successfully!</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Customer Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <a href={`mailto:${quote.email}`} className="text-blue-600 hover:text-blue-700">
                    {quote.email}
                  </a>
                </div>
              </div>
              
              {quote.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <a href={`tel:${quote.phone}`} className="text-blue-600 hover:text-blue-700">
                      {quote.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {quote.company && (
                <div className="flex items-center gap-3">
                  <Building size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                    <p className="text-gray-900 dark:text-white">{quote.company}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Message</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{quote.message}</p>
          </div>

          {/* Products */}
          {quote.products && quote.products.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package size={20} />
                Products of Interest
              </h2>
              <div className="space-y-4">
                {quote.products.map((product, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {product.partName}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      {product.partNumber && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Part Number</p>
                          <p className="text-gray-900 dark:text-white">{product.partNumber}</p>
                        </div>
                      )}
                      {product.price !== undefined && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Listed Price</p>
                          <p className="text-gray-900 dark:text-white flex items-center gap-1">
                            <DollarSign size={14} />
                            {product.price.toFixed(2)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Quantity</p>
                        <p className="text-gray-900 dark:text-white">{product.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quote Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuoteRequestStatus)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="RESPONDED">Responded</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="Add internal notes about this quote..."
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar size={14} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Created</p>
                  <p>{formatDate(quote.createdAt)}</p>
                </div>
              </div>
              
              {quote.respondedAt && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar size={14} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Responded</p>
                    <p>{formatDate(quote.respondedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
