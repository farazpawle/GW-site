'use client';

import { useEffect, useState } from 'react';
import { X, Mail, MailOpen, MailCheck, Trash2, Loader2 } from 'lucide-react';

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

interface MessageDetailModalProps {
  message: ContactMessage | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: 'UNREAD' | 'READ' | 'REPLIED') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function MessageDetailModal({
  message,
  isOpen,
  onClose,
  onStatusUpdate,
  onDelete
}: MessageDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !message) return null;

  const handleMarkAsUnread = async () => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(message.id, 'UNREAD');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsRead = async () => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(message.id, 'READ');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsReplied = async () => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(message.id, 'REPLIED');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(message.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNREAD':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-sm font-medium">
            <Mail className="w-4 h-4" />
            New
          </span>
        );
      case 'READ':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-sm font-medium">
            <MailOpen className="w-4 h-4" />
            Read
          </span>
        );
      case 'REPLIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-medium">
            <MailCheck className="w-4 h-4" />
            Replied
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      {/* Backdrop - click to close */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-label="Close modal"
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a] bg-gradient-to-r from-brand-maroon/10 to-transparent">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Message Details</h2>
            <p className="text-gray-400 text-sm">{formatDate(message.createdAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Status Badge */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Status</p>
            {getStatusBadge(message.status)}
          </div>

          {/* Sender Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-2">Name</p>
              <p className="text-white font-medium text-lg">{message.name}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm mb-2">Email</p>
              <a 
                href={`mailto:${message.email}`}
                className="text-brand-coral hover:text-brand-red transition-colors text-lg"
              >
                {message.email}
              </a>
            </div>
          </div>

          {message.phone && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Phone</p>
              <a 
                href={`tel:${message.phone}`}
                className="text-brand-coral hover:text-brand-red transition-colors text-lg"
              >
                {message.phone}
              </a>
            </div>
          )}

          {/* Subject */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Subject</p>
            <p className="text-white font-medium text-lg">
              {message.subject || <span className="text-gray-500 italic">No subject</span>}
            </p>
          </div>

          {/* Message Content */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Message</p>
            <div className="bg-black/50 border border-[#2a2a2a] rounded-xl p-6">
              <p className="text-white leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="p-6 border-t border-[#2a2a2a] bg-black/30 flex flex-wrap items-center gap-3">
          {/* Status Update Buttons */}
          {message.status !== 'UNREAD' && (
            <button
              onClick={handleMarkAsUnread}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Mark as Unread
            </button>
          )}

          {message.status !== 'READ' && (
            <button
              onClick={handleMarkAsRead}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MailOpen className="w-4 h-4" />
              )}
              Mark as Read
            </button>
          )}

          {message.status !== 'REPLIED' && (
            <button
              onClick={handleMarkAsReplied}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MailCheck className="w-4 h-4" />
              )}
              Mark as Replied
            </button>
          )}

          <div className="flex-1" /> {/* Spacer */}

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
