'use client';
import * as React from 'react';

type Props = {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
};

export default function MiniSpark({
  data,
  width = 120,
  height = 36,
  strokeWidth = 2,
  className,
}: Props) {
  const w = Math.max(20, width);
  const h = Math.max(20, height);
  const n = data.length;

  if (!n) {
    return (
      <svg width={w} height={h} className={className}>
        <rect x="0" y="0" width={w} height={h} rx="6" className="fill-transparent" />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / Math.max(1, n - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / range) * h;
    return [x, Math.max(0, Math.min(h, y))];
  });

  const d = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');

  return (
    <svg width={w} height={h} className={className} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  );
}
