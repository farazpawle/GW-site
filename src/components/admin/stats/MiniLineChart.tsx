'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniLineChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function MiniLineChart({ data, color = '#6e0000', height = 50 }: MiniLineChartProps) {
  // Convert array of numbers to chart data format
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
