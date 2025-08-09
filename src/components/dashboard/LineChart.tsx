"use client";

import {
  LineChart as RCLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface DataPoint {
  name: string;
  value: number;
}

export default function LineChart({
  data,
  height = 260,
}: {
  data: DataPoint[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RCLineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" dot={false} />
        </RCLineChart>
      </ResponsiveContainer>
    </div>
  );
}
