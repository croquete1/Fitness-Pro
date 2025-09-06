// src/components/dashboard/Greeting.tsx
// Server Component (sem "use client")

import * as React from 'react';

type AppRole = 'ADMIN' | 'PT' | 'CLIENT';

function partOfDay(d = new Date()) {
  const h = d.getHours();
  if (h < 6)  return { label: 'Boa madrugada', emoji: '🌙' };
  if (h < 12) return { label: 'Bom dia',       emoji: '☀️' };
  if (h < 20) return { label: 'Boa tarde',     emoji: '🌤️' };
  return { label: 'Boa noite', emoji: '🌙' };
}

function roleLabel(role?: AppRole) {
  if (role === 'ADMIN') return { short: 'Admin', emoji: '🛡️' };
  if (role === 'PT')    return { short: 'PT',    emoji: '💪' };
  return { short: 'Cliente', emoji: '🫶' };
}

export default function Greeting({
  name,
  role,
  className,
}: {
  name?: string | null;
  role?: AppRole | null;
  className?: string;
}) {
  const pd = partOfDay();
  const rl = roleLabel(role ?? undefined);
  const first = (name || '').trim().split(' ')[0] || '';

  return (
    <div className={className} style={{ display:'flex', alignItems:'center', gap:8 }}>
      <h1 style={{ margin: 0, display:'flex', alignItems:'center', gap:8 }}>
        {pd.label},{' '}
        <span style={{ fontWeight: 800 }}>
          {rl.short}{first ? ` ${first}` : ''}
        </span>{' '}
        <span aria-hidden>👋</span>
      </h1>
      <span aria-hidden style={{ fontSize: 20 }}>{pd.emoji}</span>
    </div>
  );
}
