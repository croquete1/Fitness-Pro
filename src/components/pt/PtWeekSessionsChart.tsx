'use client';

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Skeleton } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export type PtPoint = { date: string; value: number };

export default function PtWeekSessionsChart({ data, height = 240 }: { data: PtPoint[]; height?: number }) {
  const theme = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <Box sx={{ height }}><Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2 }} /></Box>;

  const grid = theme.palette.mode === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} width={28} tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="value" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
