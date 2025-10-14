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
import clsx from 'clsx';

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

const MotionAnchor = motion(
  React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<'a'>>(
    function MotionAnchor(props, ref) {
      return <a ref={ref} {...props} />;
    },
  ),
);

const MotionDiv = motion.div;

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

  const numericValue = React.useMemo(() => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value !== 'string') return null;

    const normalized = value
      .trim()
      .replace(/\s+/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(/,/g, '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }, [value]);

  const [animatedNumber, setAnimatedNumber] = React.useState<number | null>(
    numericValue === null ? null : 0,
  );
  const previousNumberRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (numericValue === null) {
      previousNumberRef.current = null;
      setAnimatedNumber(null);
      return;
    }

    if (prefersReducedMotion) {
      setAnimatedNumber(numericValue);
      previousNumberRef.current = numericValue;
      return;
    }

    const from = previousNumberRef.current ?? 0;
    const controls = animate(from, numericValue, {
      duration: 0.85,
      ease: 'easeOut',
      onUpdate: (latest) => setAnimatedNumber(latest),
    });

    previousNumberRef.current = numericValue;

    return () => {
      controls.stop();
    };
  }, [numericValue, prefersReducedMotion]);

  const displayValue = React.useMemo(() => {
    if (numericValue !== null) {
      const numberValue = animatedNumber ?? numericValue;
      const rounded = Number.isInteger(numericValue)
        ? Math.round(numberValue)
        : Number(numberValue.toFixed(1));
      return new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: Number.isInteger(numericValue) ? 0 : 1,
        maximumFractionDigits: Number.isInteger(numericValue) ? 0 : 1,
      }).format(rounded);
    }
    return value;
  }, [animatedNumber, numericValue, value]);

  const card = (
    <Card
      variant="outlined"
      component="div"
      sx={{
        borderRadius: 4,
        border,
        background:
          'color-mix(in srgb, var(--mui-palette-primary-main) 6%, var(--mui-palette-background-paper))',
        backgroundImage:
          'linear-gradient(140deg, rgba(255,255,255,0.85) 8%, transparent 52%), radial-gradient(circle at top right, color-mix(in srgb, var(--mui-palette-primary-light) 22%, transparent) 0%, transparent 58%)',
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        backdropFilter: 'blur(8px)',
        transition: (theme) =>
          theme.transitions.create(['border-color', 'box-shadow', 'transform'], {
            duration: theme.transitions.duration.shortest,
          }),
      }}
    >
      <CardContent sx={{ display: 'grid', gap: 0.5 }}>
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
            sx={{
              mt: 1,
              pt: 0.75,
              borderTop: `1px dashed color-mix(in srgb, var(--mui-palette-divider) 82%, transparent)`,
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {footer}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const sharedMotionProps = {
    initial: prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    whileHover: prefersReducedMotion
      ? undefined
      : {
          y: -6,
          scale: 1.01,
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.18)',
        },
    whileTap: prefersReducedMotion ? undefined : { scale: 0.992 },
    transition: {
      type: 'spring' as const,
      stiffness: 230,
      damping: 28,
      delay: prefersReducedMotion ? 0 : enterDelay,
    },
    style: {
      display: 'block',
      height: '100%',
      borderRadius: 18,
    },
  };

  const interactiveCard = href ? (
    <Link href={href} prefetch={false} legacyBehavior passHref>
      <MotionAnchor
        {...sharedMotionProps}
        onClick={onClick as any}
        className={clsx('focus-ring')}
        aria-label={`${label} – ver detalhes`}
        style={{
          ...sharedMotionProps.style,
          cursor: 'pointer',
          textDecoration: 'none',
          color: 'inherit',
          outline: 'none',
        }}
      >
        {card}
      </MotionAnchor>
    </Link>
  ) : (
    <MotionDiv
      {...sharedMotionProps}
      onClick={onClick as any}
      style={{
        ...sharedMotionProps.style,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {card}
    </MotionDiv>
  );

  return tooltip ? <Tooltip title={tooltip}>{interactiveCard}</Tooltip> : interactiveCard;
}
