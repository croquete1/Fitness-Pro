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
    typeof value === 'number' ? 0 : null,
  );
  const previousNumberRef = React.useRef<number | null>(null);

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

    const from = previousNumberRef.current ?? 0;
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

  const card = (
    <Card
      variant="outlined"
      component="div"
      sx={{
        borderRadius: 3,
        border,
        background: 'var(--mui-palette-background-paper)',
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        transition: (theme) =>
          theme.transitions.create(['border-color', 'box-shadow'], {
            duration: theme.transitions.duration.shortest,
          }),
      }}
    >
      <CardContent>
        <Box
          component={motion.div}
          initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : enterDelay + 0.1 }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
        >
          {icon && (
            <motion.span
              aria-hidden
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              style={{ display: 'inline-flex', fontSize: 22 }}
            >
              {icon}
            </motion.span>
          )}
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {loading ? <Skeleton width={120} height={14} /> : label}
          </Typography>
        </Box>

        {loading ? (
          <Skeleton width={64} height={36} />
        ) : (
          <Typography variant="h5" fontWeight={800} component="span" display="block">
            <motion.span
              initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              {displayValue}
            </motion.span>
          </Typography>
        )}

        {!loading && (trend || trendValue) && (
          <Typography
            component={motion.span}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : enterDelay + 0.12 }}
            variant="caption"
            sx={{ color: trendColor, display: 'inline-block', marginTop: 4 }}
          >
            {trendValue ?? ''} {trendLabel ?? ''}
          </Typography>
        )}

        {!loading && footer && (
          <Box
            component={motion.div}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : enterDelay + 0.16 }}
            sx={{ mt: 1, pt: 0.75, borderTop: `1px dashed var(--mui-palette-divider)` }}
          >
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {footer}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const animatedCard = (
    <motion.article
      onClick={onClick as any}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -4,
              scale: 1.01,
              boxShadow: '0 18px 32px rgba(15, 23, 42, 0.16)',
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      transition={{
        type: 'spring',
        stiffness: 220,
        damping: 26,
        delay: prefersReducedMotion ? 0 : enterDelay,
      }}
      style={{
        display: 'block',
        height: '100%',
        borderRadius: 12,
        position: 'relative',
        cursor: href ? 'pointer' : 'default',
      }}
    >
      {card}
    </motion.article>
  );

  const wrappedCard = href ? (
    <Link
      href={href}
      prefetch={false}
      style={{
        textDecoration: 'none',
        display: 'block',
        color: 'inherit',
        height: '100%',
        borderRadius: 12,
      }}
      aria-label={`${label} – ver detalhes`}
    >
      {animatedCard}
    </Link>
  ) : (
    animatedCard
  );

  return tooltip ? <Tooltip title={tooltip}>{wrappedCard}</Tooltip> : wrappedCard;
}
