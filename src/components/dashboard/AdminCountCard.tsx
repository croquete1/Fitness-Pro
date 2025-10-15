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
  const variant: Record<Tone, string> = {
    primary: 'primary',
    violet: 'violet',
    teal: 'teal',
    pink: 'pink',
    amber: 'amber',
  };

  return (
    <article
      className="neo-surface neo-surface--interactive space-y-2 p-4"
      data-variant={variant[tone] ?? 'primary'}
      aria-label={title}
    >
      <span className="neo-surface__hint">{title}</span>
      <span className="neo-surface__value">{count.toLocaleString('pt-PT')}</span>
    </article>
  );
}
