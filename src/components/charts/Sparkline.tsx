// src/components/charts/Sparkline.tsx
'use client';

import * as React from 'react';

export default function Sparkline({
  points,
  height = 48,
  strokeWidth = 2,
  ariaLabel = 'evolução',
}: {
  points: number[]; // ex: [0,2,1,3,4,...] normalizados por dia
  height?: number;
  strokeWidth?: number;
  ariaLabel?: string;
}) {
  const w = 180;
  const h = height;
  const pad = 4;

  const max = Math.max(1, ...points);
  const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;

  const path = points.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (h - pad * 2) * (1 - v / max);
    return `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={ariaLabel}>
      <path d={path} fill="none" stroke="currentColor" opacity="0.9" strokeWidth={strokeWidth} />
    </svg>
  );
}
