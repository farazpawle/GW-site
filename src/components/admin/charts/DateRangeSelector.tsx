'use client';

import { Calendar } from 'lucide-react';

export type DateRange = '7d' | '30d' | '90d' | '1y';

interface DateRangeSelectorProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  className?: string;
}

const ranges: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
];

export default function DateRangeSelector({
  selectedRange,
  onRangeChange,
  className = '',
}: DateRangeSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar size={18} className="text-gray-400" />
      <div className="flex gap-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-1">
        {ranges.map((range) => (
          <button
            key={range.value}
            onClick={() => onRangeChange(range.value)}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300
              ${
                selectedRange === range.value
                  ? 'bg-brand-maroon text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'
              }
            `}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}
