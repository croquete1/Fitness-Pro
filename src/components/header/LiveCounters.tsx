// src/components/header/LiveCounters.tsx
import React from 'react';

async function getCounters() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/dashboard/stats`, {
    // mantém em cache mas com tag para revalidation
    next: { tags: ['dashboard:counters'] },
  }).catch(() => null);

  if (!res || !res.ok) return null;
  return res.json() as Promise<{
    totalUsers: number;
    pendingApprovals: number;
    sessionsNext7: number;
  }>;
}

export default async function LiveCounters() {
  const data = await getCounters();

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <span style={chipStyle}>👥 {data?.totalUsers ?? '—'}</span>
      <span style={chipStyle}>⏳ {data?.pendingApprovals ?? '—'}</span>
      <span style={chipStyle}>📅 {data?.sessionsNext7 ?? '—'}</span>
    </div>
  );
}

const chipStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: '1px solid var(--border)',
  borderRadius: 999,
  background: 'var(--btn-bg)',
  fontSize: 12,
};
