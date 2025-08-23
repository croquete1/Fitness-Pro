'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { Bell } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="search">
          <input type="search" placeholder="Pesquisar..." aria-label="Pesquisar" />
        </div>

        <div className="actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn icon" type="button" title="Notificações" aria-label="Notificações">
            <Bell size={18} />
          </button>

          <button
            className="btn"
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sair"
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--btn-bg)',
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
