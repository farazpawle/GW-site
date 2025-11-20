/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { 
  Package, 
  FolderOpen, 
  MessageSquare, 
  Users, 
  Settings,
  FileText,
  Menu,
  ShoppingBag,
  LucideIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItemProps {
  activity: {
    id: string;
    type: 'product' | 'category' | 'inquiry' | 'user' | 'system' | 'page' | 'menu' | 'collection';
    action: string;
    title: string;
    description?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  };
}

// Icon mapping by activity type
const iconMap: Record<string, LucideIcon> = {
  product: Package,
  category: FolderOpen,
  inquiry: MessageSquare,
  user: Users,
  system: Settings,
  page: FileText,
  menu: Menu,
  collection: ShoppingBag,
};

// Color coding by activity type
const colorMap = {
  inquiry: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    text: 'text-green-400',
    icon: 'text-green-500',
  },
  product: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    icon: 'text-blue-500',
  },
  category: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    text: 'text-yellow-400',
    icon: 'text-yellow-500',
  },
  user: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    icon: 'text-purple-500',
  },
  system: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/20',
    text: 'text-gray-400',
    icon: 'text-gray-500',
  },
  page: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-400',
    icon: 'text-indigo-500',
  },
  menu: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    text: 'text-pink-400',
    icon: 'text-pink-500',
  },
  collection: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-400',
    icon: 'text-orange-500',
  },
};

export default function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = iconMap[activity.type] || Package;
  const colors = colorMap[activity.type] || colorMap.system;

  return (
    <div className="group relative flex gap-4 p-4 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] hover:border-brand-maroon/30 transition-all duration-300 hover:bg-[#1a1a1a]">
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center`}>
        <Icon className={colors.icon} size={20} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title and timestamp */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-white font-medium text-sm group-hover:text-brand-maroon transition-colors">
            {activity.title}
          </h4>
          <span className="flex-shrink-0 text-xs text-gray-500">
            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
          </span>
        </div>

        {/* Description */}
        {activity.description && (
          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
            {activity.description}
          </p>
        )}

        {/* Type badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
          </span>
          {activity.action && (
            <span className="text-xs text-gray-500">
              • {activity.action}
            </span>
          )}
        </div>
      </div>

      {/* Hover indicator line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-maroon rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
