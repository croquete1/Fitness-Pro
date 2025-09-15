// src/components/ui/Badge.tsx
import * as React from 'react';

export type Variant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent';

export type BadgeProps = {
  variant?: Variant;
  className?: string;
  title?: string;
  children: React.ReactNode;
};

const variantToClass: Record<Variant, string> = {
  neutral:
    'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-200 dark:ring-slate-400/25',
  primary:
    'bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/20 dark:bg-blue-400/10 dark:text-blue-200 dark:ring-blue-400/25',
  success:
    'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-400/25',
  warning:
    'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/25',
  danger:
    'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-400/10 dark:text-rose-200 dark:ring-rose-400/25',
  info:
    'bg-cyan-500/10 text-cyan-700 ring-1 ring-cyan-500/20 dark:bg-cyan-400/10 dark:text-cyan-200 dark:ring-cyan-400/25',
  accent:
    'bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/20 dark:bg-violet-400/10 dark:text-violet-200 dark:ring-violet-400/25',
};

export default function Badge({
  variant = 'neutral',
  className,
  title,
  children,
}: BadgeProps) {
  return (
    <span
      title={title}
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variantToClass[variant],
        className ?? '',
      ].join(' ')}
    >
      {children}
    </span>
  );
}
