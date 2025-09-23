'use client';

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Skeleton } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export type ProgressPoint = { date: string; weight?: number | null };

export default function ClientProgressChart({ data, height = 240 }: { data: ProgressPoint[]; height?: number }) {
  const theme = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <Box sx={{ height }}><Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2 }} /></Box>;

  const grid = theme.palette.mode === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
          <YAxis width={32} tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, fontSize: 12 }} />
          <Line type="monotone" dataKey="weight" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
