// src/components/dashboard/KpiCard.tsx
'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export type Variant =
  | 'primary' | 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export type Trend = 'up' | 'down' | 'flat';

export default function KpiCard({
  label, value, icon, variant = 'primary',
  tooltip, footer, trend, trendValue, trendLabel,
  loading = false,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  variant?: Variant;
  tooltip?: string;
  footer?: React.ReactNode;
  trend?: Trend;
  trendValue?: string;
  trendLabel?: string;
  /** Mostra skeleton enquanto carrega */
  loading?: boolean;
}) {
  const border = `1px solid var(--mui-palette-divider)`;
  const trendColor =
    trend === 'up' ? 'var(--mui-palette-success-main)'
    : trend === 'down' ? 'var(--mui-palette-error-main)'
    : 'var(--mui-palette-text-secondary)';

  const body = (
    <Card variant="outlined" sx={{ borderRadius: 3, border, background: 'var(--mui-palette-background-paper)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .5 }}>
          {icon && <Box sx={{ fontSize: 22 }} aria-hidden>{icon}</Box>}
          <Typography variant="body2" sx={{ opacity: .7 }}>
            {loading ? <Skeleton width={120} height={14} /> : label}
          </Typography>
        </Box>

        {loading
          ? <Skeleton width={64} height={36} />
          : <Typography variant="h5" fontWeight={800}>{value}</Typography>
        }

        {!loading && (trend || trendValue) && (
          <Typography variant="caption" sx={{ color: trendColor }}>
            {trendValue ?? ''} {trendLabel ?? ''}
          </Typography>
        )}

        {!loading && footer && (
          <Box sx={{ mt: 1, pt: .75, borderTop: `1px dashed var(--mui-palette-divider)` }}>
            <Typography variant="caption" sx={{ opacity: .8 }}>{footer}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return tooltip ? <Tooltip title={tooltip}>{body}</Tooltip> : body;
}
