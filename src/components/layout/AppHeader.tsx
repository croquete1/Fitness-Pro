// src/components/layout/AppHeader.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function AppHeader() {
  return (
    <header
      className="app-header"
      style={{
        position: 'sticky',
        top: 0,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px',
        zIndex: 20, // fica abaixo da sidebar (que está com z-index 200)
      }}
    >
      {/* espaço para search ou breadcrumbs, se quiseres */}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notificações */}
        <Link
          href="/dashboard/notifications"
          className="btn icon"
          title="Notificações"
          aria-label="Notificações"
        >
          🔔
        </Link>

        {/* Terminar sessão */}
        <button
          className="btn"
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="Terminar sessão"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
