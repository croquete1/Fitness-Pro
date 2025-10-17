// src/components/dashboard/StatsCard.tsx
import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'warning';
}

export default function StatsCard({
  title,
  value,
  icon,
  tone = 'neutral',
}: StatsCardProps) {
  const toneStyles: Record<Required<StatsCardProps>['tone'], React.CSSProperties> = {
    neutral: {
      background: 'var(--card-bg)',
      borderColor: 'var(--border)',
    },
    accent: {
      background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 82%, transparent), color-mix(in srgb, var(--accent-2) 74%, transparent))',
      borderColor: 'color-mix(in srgb, var(--accent) 32%, var(--border))',
      color: 'var(--on-primary)'
    },
    success: {
      background: 'linear-gradient(135deg, color-mix(in srgb, var(--success) 82%, transparent), color-mix(in srgb, var(--success) 68%, black))',
      borderColor: 'color-mix(in srgb, var(--success) 32%, var(--border))',
      color: 'var(--on-success, #f8fafc)'
    },
    warning: {
      background: 'linear-gradient(135deg, color-mix(in srgb, var(--warning) 82%, transparent), color-mix(in srgb, var(--warning) 68%, black))',
      borderColor: 'color-mix(in srgb, var(--warning) 32%, var(--border))',
      color: 'var(--on-warning, #0b1020)'
    }
  };

  const style = toneStyles[tone] ?? toneStyles.neutral;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        ...style,
      }}
    >
      {icon && <div style={{ marginRight: 12, display: 'grid', placeItems: 'center' }}>{icon}</div>}
      <div style={{ color: style.color ?? 'var(--fg)' }}>
        <p className="text-sm text-muted" style={{ color: style.color ? 'inherit' : undefined }}>
          {title}
        </p>
        <p className="text-2xl font-bold" style={{ color: style.color ? 'inherit' : undefined }}>
          {value}
        </p>
      </div>
    </div>
  );
}
