'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Search } from 'lucide-react';

interface TopSearch {
  term: string;
  count: number;
  lastSearched: string;
}

interface AnalyticsData {
  topSearches: TopSearch[];
  stats: {
    totalSearches: number;
    uniqueUsers: number;
    averageResults: number;
  };
}

export default function SearchAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/search/analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load search analytics');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-6 h-6 text-[#6e0000]" />
          <h2 className="text-xl font-bold text-white">Search Analytics</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[#6e0000] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-6 h-6 text-[#6e0000]" />
          <h2 className="text-xl font-bold text-white">Search Analytics</h2>
        </div>
        <div className="text-center py-8 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p>{error || 'No analytics data available'}</p>
        </div>
      </div>
    );
  }
  
  // Normalize numeric values before rendering
  const averageResults = Number(data.stats.averageResults ?? 0);
  const topSearches = Array.isArray(data.topSearches) ? data.topSearches : [];

  // Calculate max count for bar chart scaling
  const maxCount = topSearches.length
    ? Math.max(...topSearches.map((s) => Number(s.count) || 0), 1)
    : 1;
  
  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl border border-[#2a2a2a] p-6 shadow-xl h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-maroon/10 rounded-lg border border-brand-maroon/20">
              <TrendingUp className="w-5 h-5 text-brand-maroon" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Top Search Terms</h2>
              <p className="text-xs text-gray-500">{data.topSearches.length} trending terms</p>
            </div>
          </div>
        </div>
        
        {data.topSearches.length > 0 ? (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-maroon/50 scrollbar-track-[#1a1a1a]">
            {data.topSearches.map((search, index) => {
              const percentage = (search.count / maxCount) * 100;
              const isTop3 = index < 3;
              
              return (
                <div
                  key={index}
                  className="group relative p-3 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] hover:border-brand-maroon/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-maroon/10"
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isTop3 
                        ? 'bg-gradient-to-br from-brand-maroon to-brand-maroon/70 text-white shadow-lg shadow-brand-maroon/30' 
                        : 'bg-[#1a1a1a] text-gray-500 border border-[#2a2a2a]'
                    }`}>
                      {index + 1}
                    </div>
                    
                    {/* Search Term */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-sm font-semibold truncate ${
                          isTop3 ? 'text-white' : 'text-gray-300'
                        } group-hover:text-brand-maroon transition-colors`}>
                          {search.term}
                        </span>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {search.count.toLocaleString()} <span className="hidden sm:inline">searches</span>
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
                            isTop3 
                              ? 'bg-gradient-to-r from-brand-maroon via-red-600 to-brand-maroon animate-pulse' 
                              : 'bg-gradient-to-r from-brand-maroon/60 to-brand-maroon/40'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                        {/* Glow effect for top 3 */}
                        {isTop3 && (
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Indicator */}
                  <div className="absolute inset-0 rounded-lg bg-brand-maroon/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#0a0a0a] rounded-lg border border-dashed border-[#2a2a2a]">
            <Search className="mx-auto h-12 w-12 text-gray-600 mb-3" />
            <p className="text-gray-400 mb-1">No search data yet</p>
            <p className="text-sm text-gray-500">Search activity will appear here</p>
          </div>
        )}
    </div>
  );
}
