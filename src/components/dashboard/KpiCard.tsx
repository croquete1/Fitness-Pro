'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';

type Variant = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const bgByVariant: Record<Variant, string> = {
  primary: 'linear-gradient(135deg, rgba(59,130,246,.16), rgba(59,130,246,.06))',
  accent:  'linear-gradient(135deg, rgba(139,92,246,.16), rgba(139,92,246,.06))',
  success: 'linear-gradient(135deg, rgba(34,197,94,.16), rgba(34,197,94,.06))',
  warning: 'linear-gradient(135deg, rgba(234,179,8,.18), rgba(234,179,8,.08))',
  danger:  'linear-gradient(135deg, rgba(239,68,68,.16), rgba(239,68,68,.06))',
  info:    'linear-gradient(135deg, rgba(2,132,199,.16), rgba(2,132,199,.06))',
  neutral: 'linear-gradient(135deg, rgba(148,163,184,.16), rgba(148,163,184,.06))', // slate
};

type Trend = 'up' | 'down' | 'flat';

export default function KpiCard({
  label,
  value,
  icon,
  footer,
  variant = 'primary',
  tooltip,
  loading = false,
  trend,           // 'up' | 'down' | 'flat'
  trendValue,      // e.g. "+12%" ou "3"
  trendLabel,      // e.g. "vs. semana anterior"
}: {
  label: string;
  value?: number | string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: Variant;
  tooltip?: React.ReactNode;
  loading?: boolean;
  trend?: Trend;
  trendValue?: string | number;
  trendLabel?: string;
}) {
  const trendColor =
    trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary';
  const trendSymbol = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '➜';

  const content = (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundImage: bgByVariant[variant],
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon && <Box component="span" sx={{ fontSize: 22, lineHeight: 1 }}>{icon}</Box>}
        <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 700 }}>
          {label}
        </Typography>
      </Box>

      <Box sx={{ mt: .5 }}>
        {loading ? (
          <Skeleton variant="text" width={64} height={34} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {value ?? '—'}
          </Typography>
        )}
      </Box>

      {/* Linha de tendência (opcional) */}
      {trend && trendValue != null && (
        <Box sx={{ mt: .25, display: 'flex', alignItems: 'baseline', gap: .75 }}>
          <Typography variant="body2" sx={{ color: trendColor, fontWeight: 700, lineHeight: 1 }}>
            {trendSymbol} {trendValue}
          </Typography>
          {trendLabel && (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {trendLabel}
            </Typography>
          )}
        </Box>
      )}

      {footer && <Box sx={{ mt: .75 }}>{footer}</Box>}
    </Paper>
  );

  return tooltip ? <Tooltip title={tooltip}>{content}</Tooltip> : content;
}
