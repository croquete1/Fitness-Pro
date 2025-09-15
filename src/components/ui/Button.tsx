// src/components/ui/Button.tsx
'use client';

import * as React from 'react';

type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const cls = {
  base:
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed',
  size: {
    sm: 'text-sm px-2.5 py-1.5',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2.5',
  },
  variant: {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-600',
    secondary:
      'bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-400 ' +
      'dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-600',
    warning: 'bg-amber-500 text-black hover:bg-amber-400 focus-visible:ring-amber-600',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-600',
    ghost: 'bg-transparent text-current hover:bg-black/5 dark:hover:bg-white/10',
  },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[cls.base, cls.size[size], cls.variant[variant], className].join(' ')}
      {...rest}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {loading ? 'A carregar…' : children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
