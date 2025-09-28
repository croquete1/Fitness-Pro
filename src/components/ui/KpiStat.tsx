'use client';
import * as React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function KpiStat({
  title, value, delta, spark = [],
}: { title: string; value: number | string; delta?: number; spark?: number[] }) {
  const pos = (delta ?? 0) >= 0;
  return (
    <Card sx={{
      background: (t) => (t.palette.mode === 'dark'
        ? 'linear-gradient(180deg, #0f2542, #0b1b31)'
        : 'linear-gradient(180deg, #eaf2ff, #e2ecff)'),
      borderColor: 'divider',
    }}>
      <CardContent sx={{ py: 2.25 }}>
        <Typography variant="caption" sx={{ opacity: .8 }}>{title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Typography variant="h5" fontWeight={800}>{value}</Typography>
          <Box
            component="span"
            sx={{
              px: 1, py: .25, borderRadius: 999,
              fontSize: 12, fontWeight: 700,
              color: pos ? 'success.main' : 'error.main',
              backgroundColor: (t) => (pos ? t.palette.success.light : t.palette.error.light) + '22',
            }}
          >
            {pos ? '↑' : '↓'} {Math.abs(delta ?? 0)}%
          </Box>
        </Box>

        {/* mini sparkline SVG */}
        <Box sx={{ mt: 1, height: 28 }}>
          {spark.length > 1 && (
            <svg width="100%" height="28" viewBox="0 0 100 28" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.5}
                strokeWidth="1.5"
                points={spark
                  .map((v, i) => {
                    const x = (i / (spark.length - 1)) * 100;
                    const min = Math.min(...spark), max = Math.max(...spark);
                    const y = 26 - ((v - min) / Math.max(1, (max - min))) * 24;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            </svg>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
