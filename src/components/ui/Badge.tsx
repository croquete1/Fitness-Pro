'use client';

import React from 'react';

type Variant = 'neutral' | 'info' | 'primary' | 'success' | 'warning' | 'danger';

const PALETTE: Record<Variant, { bg: string; fg: string; bd: string }> = {
  neutral: { bg: 'rgba(0,0,0,0.04)', fg: '#111', bd: 'rgba(0,0,0,0.1)' },
  info:    { bg: 'rgba(59,130,246,0.12)', fg: '#1e3a8a', bd: 'rgba(59,130,246,0.35)' },
  primary: { bg: 'rgba(99,102,241,0.12)', fg: '#3730a3', bd: 'rgba(99,102,241,0.35)' }, // novo
  success: { bg: 'rgba(16,185,129,0.12)', fg: '#065f46', bd: 'rgba(16,185,129,0.35)' },
  warning: { bg: 'rgba(245,158,11,0.12)', fg: '#7c2d12', bd: 'rgba(245,158,11,0.35)' },
  danger:  { bg: 'rgba(239,68,68,0.12)',  fg: '#7f1d1d', bd: 'rgba(239,68,68,0.35)' },
};

export type BadgeProps = {
  children: React.ReactNode;
  variant?: Variant;
  style?: React.CSSProperties;
  className?: string;
};

export default function Badge({ children, variant = 'neutral', style, className }: BadgeProps) {
  const c = PALETTE[variant];
  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        fontSize: 12,
        padding: '2px 8px',
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.bd}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
