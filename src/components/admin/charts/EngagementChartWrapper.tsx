'use client';

import { useEffect, useState } from 'react';
import EngagementChart from '@/components/admin/charts/EngagementChart';
import { DateRange } from '@/components/admin/charts/DateRangeSelector';
import { Loader2 } from 'lucide-react';

interface EngagementData {
  date: string;
  pageViews: number;
  productViews: number;
}

export default function EngagementChartWrapper() {
  const [data, setData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const fetchEngagementData = async (range: DateRange) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/engagement?range=${range}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch engagement data:', result.error);
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagementData(dateRange);
  }, [dateRange]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 lg:p-8 shadow-xl">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="w-8 h-8 text-brand-maroon animate-spin" />
        </div>
      </div>
    );
  }

  return <EngagementChart data={data} onDateRangeChange={handleDateRangeChange} />;
}
