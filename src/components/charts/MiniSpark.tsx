'use client';
import * as React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function MiniSpark({ data, height=40 }: { data: number[]; height?: number }) {
  const rows = (data ?? []).map((y, i) => ({ i, y }));
  return (
    <div style={{ width: 120, height }}>
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 6, right: 6, bottom: 0, left: 6 }}>
          <Line type="monotone" dataKey="y" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
