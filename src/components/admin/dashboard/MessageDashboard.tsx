'use client';

import { useEffect, useState } from 'react';
import { 
  Mail, 
  MailOpen, 
  MailCheck, 
  Clock, 
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface MessageStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  responseRate: number;
  averageResponseTime: number; // in hours
  todayCount: number;
  weekTrend: number[]; // Last 7 days message count
}

interface RecentMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: string;
  status: 'UNREAD' | 'READ' | 'REPLIED';
}

interface DashboardData {
  stats: MessageStats;
  recentUnread: RecentMessage[];
}

export default function MessageDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/messages/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch message dashboard data');
      }
      
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Message dashboard fetch error:', err);
      setError('Failed to load message analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 lg:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-brand-maroon" />
          <h2 className="text-xl lg:text-2xl font-bold text-white">Message Center</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-maroon" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 lg:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-brand-maroon" />
          <h2 className="text-xl lg:text-2xl font-bold text-white">Message Center</h2>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">{error || 'No message data available'}</p>
        </div>
      </div>
    );
  }

  const { stats, recentUnread } = data;
  const unreadPercentage = stats.total > 0 ? (stats.unread / stats.total) * 100 : 0;
  const needsAttention = stats.unread > 5;

  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 lg:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-maroon/10 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-brand-maroon" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white">Message Center</h2>
            <p className="text-sm text-gray-400">Customer inquiries and communications</p>
          </div>
        </div>
        <Link
          href="/admin/messages"
          className="group flex items-center gap-2 px-4 py-2 bg-brand-maroon/10 hover:bg-brand-maroon text-brand-maroon hover:text-white rounded-lg text-sm font-medium transition-all duration-300 border border-brand-maroon/20 hover:border-brand-maroon"
        >
          Manage All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Messages */}
        <div className="bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.todayCount} today</p>
        </div>

        {/* Unread Messages */}
        <div className={`bg-[#0a0a0a] rounded-lg border p-4 ${needsAttention ? 'border-red-500/50 animate-pulse' : 'border-[#2a2a2a]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Unread</span>
            {needsAttention && <AlertCircle className="w-3 h-3 text-red-400" />}
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.unread}</p>
          <p className="text-xs text-gray-500 mt-1">{unreadPercentage.toFixed(0)}% of total</p>
        </div>

        {/* Read Messages */}
        <div className="bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] p-4">
          <div className="flex items-center gap-2 mb-2">
            <MailOpen className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-gray-400">Read</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.read}</p>
          <p className="text-xs text-gray-500 mt-1">Pending reply</p>
        </div>

        {/* Replied Messages */}
        <div className="bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] p-4">
          <div className="flex items-center gap-2 mb-2">
            <MailCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">Replied</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.replied}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.responseRate.toFixed(0)}% rate</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Average Response Time */}
        <div className="bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Avg. Response Time</span>
            </div>
          </div>
          <p className="text-xl font-bold text-white">
            {stats.averageResponseTime < 1 
              ? `${Math.round(stats.averageResponseTime * 60)}m`
              : `${stats.averageResponseTime.toFixed(1)}h`
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.averageResponseTime < 2 ? 'Excellent response time' : 
             stats.averageResponseTime < 24 ? 'Good response time' : 'Consider faster responses'}
          </p>
        </div>

        {/* Week Trend */}
        <div className="bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-400">7-Day Activity</span>
            </div>
          </div>
          <div className="flex items-end justify-between h-12 gap-1">
            {stats.weekTrend.map((count, index) => {
              const maxCount = Math.max(...stats.weekTrend, 1);
              const height = (count / maxCount) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 bg-brand-maroon/30 rounded-t transition-all hover:bg-brand-maroon/50"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`${count} messages`}
                />
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">Messages per day trend</p>
        </div>
      </div>

      {/* Recent Unread Messages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Unread Messages</h3>
          {stats.unread > recentUnread.length && (
            <span className="text-xs text-gray-400">
              +{stats.unread - recentUnread.length} more
            </span>
          )}
        </div>

        {recentUnread.length === 0 ? (
          <div className="text-center py-8 bg-[#0a0a0a] rounded-lg border border-dashed border-[#2a2a2a]">
            <MailCheck className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
            <p className="text-gray-400 text-sm">All caught up! No unread messages.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentUnread.map((message) => (
              <Link
                key={message.id}
                href={`/admin/messages`}
                className="block bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] hover:border-brand-maroon/50 p-4 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white truncate">
                        {message.name}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-xs">
                        <Mail className="w-3 h-3" />
                        New
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{message.email}</p>
                    <p className="text-sm text-gray-300 font-medium mb-1">
                      {message.subject || 'No subject'}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {truncateText(message.message, 100)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(message.createdAt)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-brand-maroon group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
