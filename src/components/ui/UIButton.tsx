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
    transition:
      'transform 80ms ease, background 140ms ease, color 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
    border: '1px solid var(--btn-outline-bd, var(--border))',
    color: 'var(--btn-outline-fg, var(--fg))',
    background: 'var(--btn-bg)',
  };

  const stylesByVariant: Record<Variant, React.CSSProperties> = {
    primary: {
      background: 'var(--btn-primary-bg, linear-gradient(180deg, #2563eb, #1d4ed8))',
      color: 'var(--btn-primary-fg, var(--on-primary, #021b2e))',
      borderColor: 'var(--btn-primary-bd, #1d4ed8)',
      boxShadow: 'var(--btn-primary-shadow, 0 6px 18px rgba(37, 99, 235, 0.28))',
    },
    outline: {
      background: 'var(--btn-outline-bg, transparent)',
      color: 'var(--btn-outline-fg, var(--fg))',
      borderColor: 'var(--btn-outline-bd, rgba(0,0,0,0.15))',
    },
    danger: {
      background: 'var(--btn-danger-bg, linear-gradient(180deg, #ef4444, #dc2626))',
      color: 'var(--btn-danger-fg, var(--on-danger, #fff))',
      borderColor: 'var(--btn-danger-bd, #dc2626)',
      boxShadow: 'var(--btn-danger-shadow, 0 6px 18px rgba(239, 68, 68, 0.28))',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--btn-ghost-fg, var(--fg))',
      borderColor: 'var(--btn-ghost-bd, transparent)',
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
