'use client';

import * as React from 'react';
import { Card, CardContent, Stack, Typography, Box } from '@mui/material';

/** Pequena sparkline SVG (opcional) */
function Sparkline({ data }: { data: number[] }) {
  if (!data?.length) return null;
  const w = 120, h = 28, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const norm = (v: number) => max === min ? h / 2 : h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const step = (w - pad * 2) / (data.length - 1);
  const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * step},${norm(v)}`).join(' ');
  return (
    <Box component="svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} sx={{ opacity: 0.9 }}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} />
    </Box>
  );
}

export type KpiCardProps = {
  title: string;
  value: number | string;
  /** variação em % (positivo/negativo) */
  delta?: number | null;
  /** dados para sparkline (opcional) */
  sparkData?: number[];
  /** cor do acento (opcional) */
  color?: 'primary' | 'success' | 'warning' | 'error';
};

export default function KpiCard({ title, value, delta = null, sparkData, color = 'primary' }: KpiCardProps) {
  const up = typeof delta === 'number' && delta > 0;
  const down = typeof delta === 'number' && delta < 0;
  const deltaLabel =
    typeof delta === 'number'
      ? `${up ? '⬆️' : down ? '⬇️' : '•'} ${Math.abs(delta).toFixed(1)}%`
      : '—';

  return (
    <Card
      variant="outlined"
      sx={(t) => ({
        borderRadius: 3,
        borderColor: 'divider',
        background: t.palette.mode === 'light'
          ? `linear-gradient(180deg, ${t.palette.background.paper}, ${t.palette.background.default})`
          : `linear-gradient(180deg, ${t.palette.background.paper}, ${t.palette.background.default})`,
      })}
    >
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {title}
          </Typography>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between">
            <Typography variant="h5" fontWeight={800}>{value}</Typography>
            {sparkData?.length ? (
              <Box sx={{ color: (theme) => theme.palette[color].main }}>
                <Sparkline data={sparkData} />
              </Box>
            ) : null}
          </Stack>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: up ? 'success.main' : down ? 'error.main' : 'text.secondary',
            }}
          >
            {deltaLabel}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
