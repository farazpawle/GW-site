'use client';

import { BarChart, Bar, ResponsiveContainer } from 'recharts';

interface MiniBarChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function MiniBarChart({ data, color = '#6e0000', height = 50 }: MiniBarChartProps) {
  // Convert array of numbers to chart data format
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <Bar
          dataKey="value"
          fill={color}
          radius={[4, 4, 0, 0]}
          animationDuration={1000}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
