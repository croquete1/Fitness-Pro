'use client';

import React from 'react';

export default function Toolbar({
  left,
  right,
  className,
  style,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className ?? 'card'}
      style={{
        padding: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        ...style,
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{left}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{right}</div>
    </div>
  );
}
