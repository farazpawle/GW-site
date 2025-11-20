'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DateRangeSelector, { DateRange } from './DateRangeSelector';
import { Download, TrendingUp } from 'lucide-react';

interface EngagementData {
  date: string;
  pageViews: number;
  productViews: number;
}

interface EngagementChartProps {
  data: EngagementData[];
  onDateRangeChange?: (range: DateRange) => void;
  showExport?: boolean;
}

export default function EngagementChart({
  data,
  onDateRangeChange,
  showExport = true,
}: EngagementChartProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>('30d');

  const handleRangeChange = (range: DateRange) => {
    setSelectedRange(range);
    onDateRangeChange?.(range);
  };

  // Calculate total views for the period
  const totalPageViews = data.reduce((sum, item) => sum + item.pageViews, 0);
  const totalProductViews = data.reduce((sum, item) => sum + item.productViews, 0);

  // Export data to CSV
  const handleExport = () => {
    const csvContent = [
      ['Date', 'Page Views', 'Product Views'],
      ...data.map((item) => [
        item.date,
        item.pageViews.toString(),
        item.productViews.toString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engagement-metrics-${selectedRange}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 lg:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="text-brand-maroon" size={24} />
            <h2 className="text-xl lg:text-2xl font-bold text-white">Engagement Overview</h2>
          </div>
          <p className="text-sm text-gray-400">
            {totalPageViews.toLocaleString()} total page views • {totalProductViews.toLocaleString()} product views
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangeSelector selectedRange={selectedRange} onRangeChange={handleRangeChange} />
          {showExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-brand-maroon border border-[#2a2a2a] hover:border-brand-maroon rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-all duration-300"
            >
              <Download size={16} />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => value.toLocaleString()}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                }}
              />
              <Legend
                wrapperStyle={{ color: '#9ca3af' }}
                iconType="line"
                formatter={(value) => (
                  <span className="text-gray-300 text-sm font-medium">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="pageViews"
                name="Page Views"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />
              <Line
                type="monotone"
                dataKey="productViews"
                name="Product Views"
                stroke="#6e0000"
                strokeWidth={2}
                dot={{ fill: '#6e0000', r: 4 }}
                activeDot={{ r: 6, fill: '#6e0000' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[400px] text-gray-400">
          <div className="text-center">
            <TrendingUp size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No engagement data available</p>
            <p className="text-sm text-gray-500 mt-1">Data will appear once analytics are collected</p>
          </div>
        </div>
      )}

      {/* Legend Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
          <div>
            <p className="text-xs text-gray-400">Page Views</p>
            <p className="text-lg font-bold text-white">{totalPageViews.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
          <div className="w-3 h-3 rounded-full bg-[#6e0000]"></div>
          <div>
            <p className="text-xs text-gray-400">Product Views</p>
            <p className="text-lg font-bold text-white">{totalProductViews.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
