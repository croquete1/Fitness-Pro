// src/components/ui/KpiCard.tsx
'use client';

import * as React from 'react';

type Variant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';

export type KpiCardProps = {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  href?: string;
  footer?: React.ReactNode;
  variant?: Variant;
  /** alias opcional para retrocompatibilidade */
  tone?: Variant;
};

const variantToClass: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-blue-600/10 via-blue-500/10 to-blue-400/10 ring-1 ring-blue-500/20',
  success:
    'bg-gradient-to-br from-emerald-600/10 via-emerald-500/10 to-emerald-400/10 ring-1 ring-emerald-500/20',
  warning:
    'bg-gradient-to-br from-amber-600/10 via-amber-500/10 to-amber-400/10 ring-1 ring-amber-500/20',
  danger:
    'bg-gradient-to-br from-rose-600/10 via-rose-500/10 to-rose-400/10 ring-1 ring-rose-500/20',
  info:
    'bg-gradient-to-br from-cyan-600/10 via-cyan-500/10 to-cyan-400/10 ring-1 ring-cyan-500/20',
  neutral:
    'bg-gradient-to-br from-slate-600/10 via-slate-500/10 to-slate-400/10 ring-1 ring-slate-500/20',
  accent:
    'bg-gradient-to-br from-violet-600/10 via-violet-500/10 to-violet-400/10 ring-1 ring-violet-500/20',
};

export default function KpiCard(props: KpiCardProps) {
  const { label, value, icon, href, footer } = props;
  const variant = props.variant ?? props.tone ?? 'neutral';

  const content = (
    <div
      className={`rounded-2xl p-4 shadow-sm ${variantToClass[variant]} backdrop-blur-sm`}
      style={{ minHeight: 110 }}
    >
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight flex items-center gap-2">
        {icon ? <span className="text-lg">{icon}</span> : null}
        <span>{value}</span>
      </div>
      <div className="mt-2 text-xs opacity-70">{footer ?? ' '}</div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:opacity-95 transition-opacity">
        {content}
      </a>
    );
  }
  return content;
}
