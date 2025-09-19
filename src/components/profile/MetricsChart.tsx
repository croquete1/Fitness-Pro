'use client';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

type P = { date: string; weight?: number | null; bodyfat_pct?: number | null; };

export default function MetricsChart({ points }: { points: P[] }) {
  const data = points.filter(p => typeof p.weight === 'number') as Required<P>[];
  const w = 520, h = 160, pad = 12;
  let path = '';
  if (data.length >= 2) {
    const xs = data.map((_, i) => pad + (i * (w - pad * 2)) / (data.length - 1));
    const vals = data.map(p => p.weight as number);
    const min = Math.min(...vals), max = Math.max(...vals), rng = max - min || 1;
    const ys = data.map(p => pad + (h - pad * 2) * (1 - ((p.weight as number) - min) / rng));
    path = xs.map((x,i) => `${i?'L':'M'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Histórico de peso</Typography>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <path d={path} fill="none" stroke="currentColor" opacity="0.9" strokeWidth="2" />
      </svg>
    </Paper>
  );
}
