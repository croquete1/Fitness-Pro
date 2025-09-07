// src/components/dashboard/GreetingHeader.tsx
'use client';
import React from 'react';

export default function GreetingHeader({
  name,
  role,
}: {
  name?: string | null;
  role?: 'ADMIN' | 'PT' | 'CLIENT' | string | null;
}) {
  const h = new Date().getHours();
  const greet = h < 12 ? 'Bom dia' : h < 20 ? 'Boa tarde' : 'Boa noite';
  const wave = h < 12 ? '☀️' : h < 20 ? '🌤️' : '🌙';
  const roleLabel = role === 'ADMIN' ? 'Admin' : role === 'PT' ? 'PT' : '';
  return (
    <h1 style={{ margin: 0 }}>
      {greet}, {name || roleLabel || '👋'} <span aria-hidden>👋</span> {wave}
    </h1>
  );
}
