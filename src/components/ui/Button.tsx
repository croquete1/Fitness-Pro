// src/components/ui/Button.tsx
'use client';

import * as React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
};

const DEFAULT_LOADING_LABEL = 'A carregar…';

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  loadingText,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const content = loading ? loadingText ?? DEFAULT_LOADING_LABEL : children;
  const isDisabled = disabled ?? false;

  return (
    <button
      type="button"
      className={clsx('btn', className)}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      {...rest}
    >
      {leftIcon && <span className="btn__icon btn__icon--left">{leftIcon}</span>}
      <span className="btn__label">{content}</span>
      {rightIcon && <span className="btn__icon btn__icon--right">{rightIcon}</span>}
    </button>
  );
}
