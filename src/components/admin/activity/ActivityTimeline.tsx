'use client';

import { useState } from 'react';
import ActivityItem from './ActivityItem';
import { Filter, X } from 'lucide-react';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'product' | 'category' | 'inquiry' | 'user' | 'system' | 'page' | 'menu' | 'collection';
  action: string;
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
  viewAllUrl?: string; // Changed from callback to URL
}

const activityTypes = [
  { value: 'all', label: 'All Activities', color: 'text-gray-400' },
  { value: 'inquiry', label: 'Inquiries', color: 'text-green-400' },
  { value: 'product', label: 'Products', color: 'text-blue-400' },
  { value: 'category', label: 'Categories', color: 'text-yellow-400' },
  { value: 'user', label: 'Users', color: 'text-purple-400' },
  { value: 'system', label: 'System', color: 'text-gray-400' },
];

export default function ActivityTimeline({ activities, maxItems = 10, viewAllUrl }: ActivityTimelineProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter activities
  const filteredActivities = selectedFilter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === selectedFilter);

  // Limit items
  const displayedActivities = filteredActivities.slice(0, maxItems);
  const hasMore = filteredActivities.length > maxItems;

  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 lg:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">Recent Activity</h2>
          <p className="text-sm text-gray-400">
            Latest updates and actions • {filteredActivities.length} {selectedFilter === 'all' ? 'total' : selectedFilter}
          </p>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-brand-maroon border border-[#2a2a2a] hover:border-brand-maroon rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all duration-300"
        >
          <Filter size={16} />
          Filter
          {selectedFilter !== 'all' && (
            <span className="ml-1 px-2 py-0.5 bg-brand-maroon rounded-full text-xs text-white">
              1
            </span>
          )}
        </button>
      </div>

      {/* Filter Pills */}
      {showFilters && (
        <div className="mb-6 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-400 font-medium">Filter by type:</span>
            {selectedFilter !== 'all' && (
              <button
                onClick={() => setSelectedFilter('all')}
                className="text-xs text-brand-maroon hover:text-brand-red transition-colors flex items-center gap-1"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {activityTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedFilter(type.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
                  ${selectedFilter === type.value
                    ? 'bg-brand-maroon text-white border-brand-maroon'
                    : 'bg-[#1a1a1a] text-gray-400 border-[#2a2a2a] hover:border-brand-maroon/50'
                  }
                  border
                `}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activities List */}
      {displayedActivities.length > 0 ? (
        <div className="space-y-3">
          {displayedActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#0a0a0a] rounded-xl border border-dashed border-[#2a2a2a]">
          <Filter className="mx-auto h-12 w-12 text-gray-600 mb-3" />
          <p className="text-gray-400 mb-1">No activities found</p>
          <p className="text-sm text-gray-500">
            {selectedFilter === 'all' 
              ? 'No activities to display yet'
              : `No ${selectedFilter} activities to display`
            }
          </p>
          {selectedFilter !== 'all' && (
            <button
              onClick={() => setSelectedFilter('all')}
              className="mt-4 text-sm text-brand-maroon hover:text-brand-red transition-colors"
            >
              Show all activities
            </button>
          )}
        </div>
      )}

      {/* View All Button */}
      {hasMore && viewAllUrl && (
        <div className="mt-6 text-center">
          <Link
            href={viewAllUrl}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-maroon/10 hover:bg-brand-maroon text-brand-maroon hover:text-white rounded-lg text-sm font-medium transition-all duration-300 border border-brand-maroon/20 hover:border-brand-maroon"
          >
            View All Activity ({filteredActivities.length})
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
