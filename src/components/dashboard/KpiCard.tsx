// src/components/dashboard/KpiCard.tsx
import React from 'react';

export default function KpiCard({
  label,
  value,
  footer,
  right,
}: {
  label: string;
  value: React.ReactNode;
  footer?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
      <div className="text-muted small" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{label}</span>
        {right}
      </div>
      <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{value}</div>
      {footer && <div>{footer}</div>}
    </div>
  );
}
