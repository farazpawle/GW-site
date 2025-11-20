'use client';

import { TrendingUp, TrendingDown, Users, Package, FolderOpen, DollarSign, MessageSquare } from 'lucide-react';
import MiniLineChart from './MiniLineChart';
import MiniBarChart from './MiniBarChart';
import CircularGauge from './CircularGauge';

interface TrendData {
  value: number;
  direction: 'up' | 'down';
  period: string;
}

interface ChartData {
  type: 'line' | 'bar' | 'gauge';
  data: number[];
  color?: string;
}

interface EnhancedStatCardProps {
  title: string;
  value: number | string;
  unit?: string;
  iconName: 'users' | 'package' | 'folder' | 'dollar' | 'message-square';
  trend?: TrendData;
  chart?: ChartData;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  onClick?: () => void;
}

// Icon mapping for client-side rendering
const iconMap = {
  users: Users,
  package: Package,
  folder: FolderOpen,
  dollar: DollarSign,
  'message-square': MessageSquare,
};

export default function EnhancedStatCard({
  title,
  value,
  unit,
  iconName,
  trend,
  chart,
  status = 'neutral',
  onClick,
}: EnhancedStatCardProps) {
  const Icon = iconMap[iconName];
  // Status color mapping
  const statusColors = {
    success: 'border-green-500/50 hover:shadow-green-500/20',
    warning: 'border-yellow-500/50 hover:shadow-yellow-500/20',
    danger: 'border-red-500/50 hover:shadow-red-500/20',
    neutral: 'border-brand-maroon/50 hover:shadow-brand-maroon/10',
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
  };

  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] 
        border border-[#2a2a2a] rounded-xl p-6 
        transition-all duration-300 overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${statusColors[status]}
        hover:border-brand-maroon/50 hover:shadow-lg
      `}
    >
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-maroon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative">
        {/* Header: Icon, Title, and Trend */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-brand-maroon/10 group-hover:bg-brand-maroon/20 p-3 rounded-xl transition-all duration-300 shadow-lg">
                <Icon className="text-brand-maroon group-hover:text-brand-red transition-colors" size={24} />
              </div>
              {trend && (
                <div className={`flex items-center gap-1 ${trendColors[trend.direction]}`}>
                  {trend.direction === 'up' ? (
                    <TrendingUp size={20} />
                  ) : (
                    <TrendingDown size={20} />
                  )}
                  <span className="text-sm font-semibold">
                    {trend.value > 0 ? '+' : ''}{trend.value}%
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm font-medium group-hover:text-gray-300 transition-colors">
              {title}
            </p>
          </div>
        </div>

        {/* Value Display */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {unit && (
              <span className="text-lg text-gray-500 font-medium">{unit}</span>
            )}
          </div>
        </div>

        {/* Trend Period */}
        {trend && (
          <p className="text-gray-500 text-xs mb-4 group-hover:text-gray-400 transition-colors">
            {trend.period}
          </p>
        )}

        {/* Chart Visualization */}
        {chart && (
          <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
            {chart.type === 'line' && (
              <MiniLineChart data={chart.data} color={chart.color} height={50} />
            )}
            {chart.type === 'bar' && (
              <MiniBarChart data={chart.data} color={chart.color} height={50} />
            )}
            {chart.type === 'gauge' && (
              <div className="flex justify-center">
                <CircularGauge
                  percentage={chart.data[0] || 0}
                  color={chart.color}
                  size={70}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-maroon to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
