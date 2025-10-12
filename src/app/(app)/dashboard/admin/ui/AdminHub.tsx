// src/app/(app)/dashboard/admin/ui/AdminHub.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import type { Route } from 'next';

type CardProps = {
  href: Route;
  title: string;
  desc?: string;
  icon: React.ReactNode;
  kpi?: string | number;
};

const Card: React.FC<CardProps> = ({ href, title, desc, icon, kpi }) => (
  <Link
    href={href}
    className="card"
    style={{
      padding: 16,
      borderRadius: 16,
      display: 'grid',
      gap: 8,
      border: '1px solid var(--border)',
      transition: 'transform .05s ease, box-shadow .15s ease',
      background: 'var(--card)',
      textDecoration: 'none',
      color: 'inherit',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
      {kpi !== undefined && (
        <div
          style={{
            marginLeft: 'auto',
            padding: '2px 8px',
            borderRadius: 999,
            background:
              'linear-gradient(135deg, var(--accent, #7c3aed), var(--accent-2, #06b6d4))',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {kpi}
        </div>
      )}
    </div>
    {!!desc && (
      <div style={{ color: 'var(--muted-fg)', fontSize: 13, lineHeight: 1.35 }}>{desc}</div>
    )}
  </Link>
);

export default function AdminHub() {
  const cards: CardProps[] = [
    {
      href: '/dashboard/admin/users' as Route,
      title: 'Utilizadores',
      desc: 'Gerir contas, estados e exportações',
      icon: '👥',
    },
    {
      href: '/dashboard/admin/approvals' as Route,
      title: 'Aprovações',
      desc: 'Rever e aprovar inscrições pendentes',
      icon: '✅',
    },
    {
      href: '/dashboard/admin/library' as Route,
      title: 'Biblioteca',
      desc: 'Catálogo de exercícios e publicação',
      icon: '🏋️',
    },
    {
      href: '/dashboard/admin/plans' as Route,
      title: 'Planos',
      desc: 'Biblioteca de planos de treino',
      icon: '📚',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}
    >
      {cards.map((c) => (
        <Card key={c.title} {...c} />
      ))}
    </div>
  );
}
