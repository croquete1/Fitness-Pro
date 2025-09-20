'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

type Row = {
  measured_at: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
};

export default function AnthroChart({ rows }: { rows: Row[] }) {
  const data = React.useMemo(
    () =>
      [...rows]
        .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
        .map((r) => ({
          date: new Date(r.measured_at).toLocaleDateString('pt-PT'),
          weight: r.weight_kg ?? undefined,
          fat: r.body_fat_pct ?? undefined,
        })),
    [rows]
  );

  return (
    <Box sx={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={24} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" dot />
          <Line yAxisId="right" type="monotone" dataKey="fat" name="Gordura (%)" dot />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
