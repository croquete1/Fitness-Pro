// src/components/ui/KpiCard.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import ArrowDropUp from '@mui/icons-material/ArrowDropUp';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';

type Props = {
  title: string;
  value: number | string;
  delta?: number;         // ex.: +3.2 / -1.8
  sparkData?: number[];   // ex.: [110,112,114,...]
  accent?: 'blue' | 'violet' | 'green' | 'amber';
};

function gradientBg(mode: 'light'|'dark', accent: NonNullable<Props['accent']>) {
  if (mode === 'dark') {
    const map = {
      blue:   'linear-gradient(180deg, #0b244a, #0f2d63)',
      violet: 'linear-gradient(180deg, #2b1a55, #3a1f7a)',
      green:  'linear-gradient(180deg, #0f3b29, #11543a)',
      amber:  'linear-gradient(180deg, #4a2c0b, #633e0f)',
    } as const;
    return map[accent];
  }
  const map = {
    blue:   'linear-gradient(180deg, #e9f1ff, #deebff)',
    violet: 'linear-gradient(180deg, #f0e8ff, #eadbff)',
    green:  'linear-gradient(180deg, #e8fff3, #d4fae8)',
    amber:  'linear-gradient(180deg, #fff6e7, #fee6bd)',
  } as const;
  return map[accent];
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 24 - norm(v) * 24;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" style={{ width: '100%', height: 28 }}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" opacity={0.85} />
    </svg>
  );
}

export default function KpiCard({ title, value, delta, sparkData, accent = 'blue' }: Props) {
  return (
    <Card
      elevation={0}
      sx={(theme) => ({
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        background: gradientBg(theme.palette.mode as 'light'|'dark', accent),
        boxShadow: theme.palette.mode === 'dark'
          ? '0 12px 36px rgba(0,0,0,.28)'
          : '0 10px 28px rgba(15,23,42,.10)',
      })}
    >
      <CardContent sx={{ p: 2.25, display: 'grid', gap: 0.75 }}>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>{title}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h5" fontWeight={800} lineHeight={1}>
            {value}
          </Typography>
          {typeof delta === 'number' && delta !== 0 && (
            <Chip
              size="small"
              icon={delta > 0 ? <ArrowDropUp /> : <ArrowDropDown />}
              label={`${Math.abs(delta).toFixed(1)}%`}
              color={delta > 0 ? 'success' : 'error'}
              sx={{ bgcolor: 'background.paper' }}
            />
          )}
          {typeof delta === 'number' && delta === 0 && (
            <Chip size="small" label="0%" variant="outlined" />
          )}
        </Box>

        {sparkData && sparkData.length > 1 && (
          <Box sx={{ color: 'text.secondary' }}>
            <Sparkline data={sparkData} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
