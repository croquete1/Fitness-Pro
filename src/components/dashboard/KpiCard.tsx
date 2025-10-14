// src/components/dashboard/KpiCard.tsx
'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Link from 'next/link';
import { animate, motion, useReducedMotion } from 'framer-motion';

export type Variant =
  | 'primary' | 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export type Trend = 'up' | 'down' | 'flat';

type Props = {
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
  /** URL para tornar o cartão clicável. */
  href?: string;
  /**
   * Atraso (s) na animação de entrada. Permite escalonar vários cartões.
   */
  enterDelay?: number;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLDivElement>;
};

export default function KpiCard({
  label,
  value,
  icon,
  variant = 'primary',
  tooltip,
  footer,
  trend,
  trendValue,
  trendLabel,
  loading = false,
  href,
  enterDelay = 0,
  onClick,
}: Props) {
  const border = `1px solid var(--mui-palette-divider)`;
  const trendColor =
    trend === 'up' ? 'var(--mui-palette-success-main)'
    : trend === 'down' ? 'var(--mui-palette-error-main)'
    : 'var(--mui-palette-text-secondary)';

  const prefersReducedMotion = useReducedMotion();

  const [animatedNumber, setAnimatedNumber] = React.useState<number | null>(
    typeof value === 'number' ? value : null,
  );
  const previousNumberRef = React.useRef<number | null>(
    typeof value === 'number' ? value : null,
  );

  React.useEffect(() => {
    if (typeof value !== 'number') {
      previousNumberRef.current = null;
      setAnimatedNumber(null);
      return;
    }

    if (prefersReducedMotion) {
      setAnimatedNumber(value);
      previousNumberRef.current = value;
      return;
    }

    const from = previousNumberRef.current ?? value;
    const controls = animate(from, value, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (latest) => setAnimatedNumber(latest),
    });

    previousNumberRef.current = value;

    return () => {
      controls.stop();
    };
  }, [prefersReducedMotion, value]);

  const displayValue = React.useMemo(() => {
    if (typeof value === 'number') {
      const numberValue = animatedNumber ?? value;
      const rounded = Number.isInteger(value)
        ? Math.round(numberValue)
        : Number(numberValue.toFixed(1));
      return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
        maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
      }).format(rounded);
    }
    return value;
  }, [animatedNumber, value]);

  const commonCardProps = href
    ? { component: Link, href, prefetch: false }
    : { component: 'div' };

  const body = (
    <Card
      variant="outlined"
      {...commonCardProps}
      onClick={onClick as any}
      sx={{
        borderRadius: 3,
        border,
        background: 'var(--mui-palette-background-paper)',
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
        overflow: 'hidden',
        cursor: href ? 'pointer' : 'default',
        transition: (theme) =>
          theme.transitions.create(['border-color', 'box-shadow'], {
            duration: theme.transitions.duration.shortest,
          }),
        '&:hover': {
          borderColor: href ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-divider)',
        },
        '&:focus-visible': {
          outline: '2px solid var(--mui-palette-primary-main)',
          outlineOffset: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .5 }}>
          {icon && <Box sx={{ fontSize: 22 }} aria-hidden>{icon}</Box>}
          <Typography variant="body2" sx={{ opacity: .7 }}>
            {loading ? <Skeleton width={120} height={14} /> : label}
          </Typography>
        </Box>

        {loading
          ? <Skeleton width={64} height={36} />
          : <Typography variant="h5" fontWeight={800}>{displayValue}</Typography>
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

  const animatedCard = (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: enterDelay }}
      style={{ height: '100%' }}
    >
      {body}
    </motion.div>
  );

  return tooltip ? <Tooltip title={tooltip}>{animatedCard}</Tooltip> : animatedCard;
}
