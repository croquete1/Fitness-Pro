// src/components/dashboard/AdminCountCard.tsx
'use client';
import React from 'react';

type Tone = 'primary' | 'violet' | 'teal' | 'pink' | 'amber';

export default function AdminCountCard({
  title,
  count,
  tone = 'primary',
}: {
  title: string;
  count: number;
  tone?: Tone;
}) {
  return (
    <div className="card kpi" data-kpi="1" data-tone={tone === 'primary' ? undefined : tone}>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 13, opacity: 0.8 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 900, marginTop: 2 }}>{count}</div>
      </div>
    </div>
  );
}
