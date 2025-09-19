'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

type Point = { date: string; weight?: number | null; };

export default function ProgressMini({ points }: { points: Point[] }) {
  const data = points.filter(p => typeof p.weight === 'number') as Required<Point>[];
  const w = 260, h = 64, pad = 6;

  let path = '';
  if (data.length >= 2) {
    const xs = data.map((_, i) => pad + (i * (w - pad * 2)) / (data.length - 1));
    const ys = (() => {
      const vals = data.map(p => p.weight);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const rng = max - min || 1;
      return data.map(p => pad + (h - pad * 2) * (1 - (p.weight - min) / rng));
    })();
    path = xs.map((x, i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  }

  const latest = data.at(-1)?.weight;
  const prev = data.at(-2)?.weight;
  const delta = latest && prev ? (latest - prev) : 0;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>Progresso (peso)</Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
        <Typography variant="h6" fontWeight={800}>{latest ?? '—'}<span style={{ fontSize: 12, marginLeft: 4 }}>kg</span></Typography>
        <Typography variant="caption" color={delta > 0 ? 'error' : 'success'}>
          {delta > 0 ? `+${delta.toFixed(1)}kg` : `${delta.toFixed(1)}kg`} vs último
        </Typography>
      </Box>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="evolução do peso">
        <path d={path} fill="none" stroke="currentColor" opacity="0.8" strokeWidth="2" />
      </svg>
    </Paper>
  );
}
