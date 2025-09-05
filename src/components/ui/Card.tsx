'use client';

import React from 'react';

type BaseProps = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function Card({ className, style, children }: BaseProps) {
  return (
    <div
      className={className ?? 'card'}
      style={{
        padding: 12,
        borderRadius: 12,
        border: '1px solid rgba(0,0,0,0.08)',
        background: 'var(--card-bg, #fff)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, style, children }: BaseProps) {
  return (
    <div
      className={className}
      style={{
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, style, children }: BaseProps) {
  return (
    <div className={className} style={{ ...style }}>
      {children}
    </div>
  );
}

export function CardFooter({ className, style, children }: BaseProps) {
  return (
    <div
      className={className}
      style={{
        marginTop: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Card;
