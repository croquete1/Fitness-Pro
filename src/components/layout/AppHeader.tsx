// src/components/layout/AppHeader.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AppHeader() {
  const router = useRouter();

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
        zIndex: 20, // intencionalmente abaixo da sidebar (z-index 200)
      }}
    >
      {/* Aqui podes ter a tua search, etc.  */}

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
          onClick={async () => {
            await signOut({ callbackUrl: '/login' });
          }}
          title="Terminar sessão"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
