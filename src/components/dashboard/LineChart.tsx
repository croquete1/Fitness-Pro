// src/components/dashboard/LineChart.tsx
import React from 'react';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  dataKey?: string;
  strokeColor?: string;
}

export default function LineChart({
  data,
  dataKey = 'value',
  strokeColor = '#4F46E5',
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ReLineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={strokeColor}
          strokeWidth={2}
          dot={false}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}
