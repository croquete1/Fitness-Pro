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

const VARIANT_COLOR_MAP: Record<Variant, { main: string; light?: string; foreground?: string }> = {
  primary: {
    main: 'var(--mui-palette-primary-main)',
    light:
      'var(--mui-palette-primary-light, color-mix(in srgb, var(--mui-palette-primary-main) 70%, white))',
  },
  accent: {
    main: 'var(--mui-palette-secondary-main)',
    light:
      'var(--mui-palette-secondary-light, color-mix(in srgb, var(--mui-palette-secondary-main) 65%, white))',
  },
  info: {
    main: 'var(--mui-palette-info-main)',
    light:
      'var(--mui-palette-info-light, color-mix(in srgb, var(--mui-palette-info-main) 66%, white))',
  },
  success: {
    main: 'var(--mui-palette-success-main)',
    light:
      'var(--mui-palette-success-light, color-mix(in srgb, var(--mui-palette-success-main) 64%, white))',
  },
  warning: {
    main: 'var(--mui-palette-warning-main)',
    light:
      'var(--mui-palette-warning-light, color-mix(in srgb, var(--mui-palette-warning-main) 66%, white))',
    foreground: 'color-mix(in srgb, var(--mui-palette-warning-main) 16%, var(--mui-palette-text-primary))',
  },
  danger: {
    main: 'var(--mui-palette-error-main)',
    light:
      'var(--mui-palette-error-light, color-mix(in srgb, var(--mui-palette-error-main) 62%, white))',
  },
  neutral: {
    main: 'var(--mui-palette-grey-600)',
    light: 'color-mix(in srgb, var(--mui-palette-grey-400) 88%, white)',
    foreground: 'var(--mui-palette-text-primary)',
  },
};

const VARIANT_FALLBACK_SURFACES: Record<Variant, {
  highlight: string;
  foreground: string;
  border: string;
  background: string;
  halo: string;
  sheen: string;
}> = {
  primary: {
    highlight: 'rgba(0,212,255,0.32)',
    foreground: 'var(--mui-palette-text-primary)',
    border: 'rgba(0,212,255,0.42)',
    background: 'rgba(0,212,255,0.16)',
    halo: 'rgba(0,212,255,0.26)',
    sheen: 'rgba(0,212,255,0.16)',
  },
  accent: {
    highlight: 'rgba(127,91,255,0.32)',
    foreground: 'var(--mui-palette-text-primary)',
    border: 'rgba(127,91,255,0.42)',
    background: 'rgba(127,91,255,0.18)',
    halo: 'rgba(127,91,255,0.26)',
    sheen: 'rgba(127,91,255,0.18)',
  },
  info: {
    highlight: 'rgba(14,165,233,0.3)',
    foreground: 'var(--mui-palette-text-primary)',
    border: 'rgba(14,165,233,0.4)',
    background: 'rgba(14,165,233,0.16)',
    halo: 'rgba(14,165,233,0.24)',
    sheen: 'rgba(14,165,233,0.16)',
  },
  success: {
    highlight: 'rgba(16,185,129,0.28)',
    foreground: 'var(--mui-palette-text-primary)',
    border: 'rgba(16,185,129,0.38)',
    background: 'rgba(16,185,129,0.15)',
    halo: 'rgba(16,185,129,0.22)',
    sheen: 'rgba(16,185,129,0.15)',
  },
  warning: {
    highlight: 'rgba(245,158,11,0.34)',
    foreground: 'var(--mui-palette-text-primary)',
    border: 'rgba(245,158,11,0.46)',
    background: 'rgba(245,158,11,0.18)',
    halo: 'rgba(245,158,11,0.26)',
    sheen: 'rgba(245,158,11,0.18)',
  },
  danger: {
    highlight: 'rgba(239,68,68,0.34)',
    foreground: 'var(--mui-palette-text-primary)',
    border: 'rgba(239,68,68,0.46)',
    background: 'rgba(239,68,68,0.2)',
    halo: 'rgba(239,68,68,0.28)',
    sheen: 'rgba(239,68,68,0.2)',
  },
  neutral: {
    highlight: 'rgba(148,163,184,0.32)',
    foreground: 'var(--mui-palette-text-primary)',
    border: 'rgba(148,163,184,0.42)',
    background: 'rgba(148,163,184,0.18)',
    halo: 'rgba(148,163,184,0.26)',
    sheen: 'rgba(148,163,184,0.18)',
  },
};

function useColorMixSupport(): boolean {
  const [supported, setSupported] = React.useState(() => {
    if (typeof window === 'undefined' || typeof CSS === 'undefined' || !CSS.supports) {
      return false;
    }
    try {
      return CSS.supports('color', 'color-mix(in srgb, black 50%, white)');
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    if (typeof CSS === 'undefined' || !CSS.supports) {
      return;
    }
    try {
      const next = CSS.supports('color', 'color-mix(in srgb, black 50%, white)');
      setSupported((prev) => (prev === next ? prev : next));
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}

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
  const variantTokens = VARIANT_COLOR_MAP[variant] ?? VARIANT_COLOR_MAP.primary;
  const mainColor = variantTokens.main;
  const supportsColorMix = useColorMixSupport();
  const fallbackSurfaces = VARIANT_FALLBACK_SURFACES[variant] ?? VARIANT_FALLBACK_SURFACES.primary;
  const highlightColor = supportsColorMix
    ? variantTokens.light ?? `color-mix(in srgb, ${mainColor} 68%, white)`
    : fallbackSurfaces.highlight;
  const foregroundColor = supportsColorMix
    ? variantTokens.foreground ??
      `color-mix(in srgb, ${mainColor} 22%, var(--mui-palette-text-primary))`
    : fallbackSurfaces.foreground;
  const borderColor = supportsColorMix
    ? `color-mix(in srgb, ${mainColor} 22%, var(--mui-palette-divider))`
    : fallbackSurfaces.border;
  const backgroundColor = supportsColorMix
    ? `color-mix(in srgb, ${mainColor} 6%, var(--mui-palette-background-paper))`
    : fallbackSurfaces.background;
  const haloColor = supportsColorMix
    ? `color-mix(in srgb, ${highlightColor} 32%, transparent)`
    : fallbackSurfaces.halo;
  const sheenColor = supportsColorMix
    ? `color-mix(in srgb, ${mainColor} 14%, transparent)`
    : fallbackSurfaces.sheen;

  const border = `1px solid ${borderColor}`;
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
        background: backgroundColor,
        backgroundImage: `linear-gradient(140deg, rgba(255,255,255,0.85) 8%, transparent 52%), radial-gradient(circle at top right, ${haloColor} 0%, transparent 60%), linear-gradient(155deg, ${sheenColor} 0%, transparent 70%)`,
        textDecoration: 'none',
        color: foregroundColor,
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
