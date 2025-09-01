// src/components/ui/MiniSpark.tsx
'use client';

import { useMemo } from 'react';

export default function MiniSpark({
  points,
  width = 120,
  height = 34,
  goodWhen = 'up',
  title,
}: {
  points: (number | null | undefined)[];
  width?: number;
  height?: number;
  goodWhen?: 'up' | 'down';
  title?: string;
}) {
  const p = useMemo(() => {
    if (!points || points.length < 2) return '';
    const vals = points.filter((v): v is number => typeof v === 'number');
    if (vals.length < 2) return '';
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = 2;
    const stepX = (width - pad * 2) / (points.length - 1);
    return points
      .map((v, i) => {
        const x = pad + i * stepX;
        const ratio =
          v == null || max === min ? 0.5 : (Number(v) - min) / (max - min);
        const y = height - pad - ratio * (height - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }, [points, width, height]);

  const color = goodWhen === 'down' ? 'var(--danger)' : 'var(--ok)';

  return (
    <div className="flex flex-col gap-1" style={{ minWidth: width }}>
      {title ? <div className="text-[11px] opacity-70">{title}</div> : null}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={title ?? 'tendência'}
      >
        <polyline
          points={p}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}