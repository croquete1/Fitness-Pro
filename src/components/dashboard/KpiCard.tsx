// src/components/dashboard/KpiCard.tsx
'use client';
import * as React from 'react';

type Variant = 'primary'|'success'|'warning'|'danger'|'info'|'neutral'|'accent';

export type KpiCardProps = {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  href?: string;
  footer?: React.ReactNode;
  variant?: Variant;
  /** alias retro-compatível */
  tone?: Variant;
  /** opcional – para skeletons */
  loading?: boolean;
  /** métricas diferenciais (opcional) */
  delta?: { value: number; suffix?: string };
  hint?: string;
};

const variantToClass: Record<Variant,string> = {
  primary: 'bg-gradient-to-br from-blue-600/10 via-blue-500/10 to-blue-400/10 ring-1 ring-blue-500/20',
  success: 'bg-gradient-to-br from-emerald-600/10 via-emerald-500/10 to-emerald-400/10 ring-1 ring-emerald-500/20',
  warning: 'bg-gradient-to-br from-amber-600/10 via-amber-500/10 to-amber-400/10 ring-1 ring-amber-500/20',
  danger:  'bg-gradient-to-br from-rose-600/10 via-rose-500/10 to-rose-400/10 ring-1 ring-rose-500/20',
  info:    'bg-gradient-to-br from-cyan-600/10 via-cyan-500/10 to-cyan-400/10 ring-1 ring-cyan-500/20',
  neutral: 'bg-gradient-to-br from-slate-600/10 via-slate-500/10 to-slate-400/10 ring-1 ring-slate-500/20',
  accent:  'bg-gradient-to-br from-violet-600/10 via-violet-500/10 to-violet-400/10 ring-1 ring-violet-500/20',
};

export default function KpiCard({
  label, value, icon, footer, variant='neutral', tone, loading=false, delta, hint
}: KpiCardProps) {
  const v = tone ?? variant;
  const isUp = typeof delta?.value === 'number' ? delta.value >= 0 : undefined;

  return (
    <div className={`rounded-2xl p-4 shadow-sm ${variantToClass[v]} backdrop-blur-sm`} style={{ minHeight: 110 }}>
      <div className="text-xs opacity-80 flex items-center gap-2">
        {icon && <span aria-hidden>{icon}</span>}
        <span>{label}</span>
      </div>

      <div className="mt-1 text-2xl font-extrabold tracking-tight">
        {loading ? <span className="inline-block animate-pulse w-14 h-6 rounded bg-slate-300/60 dark:bg-slate-700/60" /> : value}
      </div>

      <div className="mt-1 flex items-center justify-between">
        {typeof isUp === 'boolean' ? (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
          }`}>
            {isUp ? '▲' : '▼'} {Math.abs(delta!.value).toFixed(1)}{delta?.suffix ?? ''}
          </span>
        ) : <span className="text-xs opacity-70">—</span>}
        {hint ? <span className="text-[11px] opacity-60">{hint}</span> : (footer ?? <span />)}
      </div>
    </div>
  );
}
