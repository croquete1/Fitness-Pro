'use client';

import React from 'react';

type Variant = 'primary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

export default function UIButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled,
  title,
  style,
  className,
}: {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const pad = size === 'sm' ? '6px 10px' : '8px 12px';
  const base: React.CSSProperties = {
    padding: pad,
    borderRadius: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'transform 80ms ease',
    border: '1px solid var(--border)',
  };

  const stylesByVariant: Record<Variant, React.CSSProperties> = {
    primary: {
      background: 'var(--btn-primary-bg, #2563eb)',
      color: 'var(--btn-primary-fg, #fff)',
      borderColor: 'var(--btn-primary-bd, #1d4ed8)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--btn-outline-fg, #111)',
      borderColor: 'var(--btn-outline-bd, rgba(0,0,0,0.15))',
    },
    danger: {
      background: 'var(--btn-danger-bg, #ef4444)',
      color: 'var(--btn-danger-fg, #fff)',
      borderColor: 'var(--btn-danger-bd, #dc2626)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--btn-ghost-fg, #111)',
      borderColor: 'transparent',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={className}
      style={{ ...base, ...stylesByVariant[variant], ...style }}
      onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}
