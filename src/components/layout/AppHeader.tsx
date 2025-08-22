'use client';

import React from 'react';
import { useSidebar } from './SidebarProvider';
import { useSession } from 'next-auth/react';

function useThemeToggle() {
  return React.useCallback(() => {
    try {
      const root = document.documentElement;
      const cur = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    } catch {}
  }, []);
}

export default function AppHeader() {
  const { data: session } = useSession();
  const { collapsed, pinned, toggleCollapsed, togglePinned } = useSidebar();
  const toggleTheme = useThemeToggle();

  const name = (session?.user as any)?.name ?? '—';
  const role = ((session?.user as any)?.role ?? '').toString().toUpperCase();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px',
        background: 'var(--header-bg)',
        backdropFilter: 'saturate(140%) blur(8px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn icon" onClick={toggleCollapsed} title={collapsed ? 'Expandir sidebar' : 'Compactar sidebar'}>
          {collapsed ? '➡️' : '⬅️'}
        </button>
        <button className="btn icon" onClick={togglePinned} title={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'}>
          {pinned ? '📌' : '📍'}
        </button>
        <button className="btn icon" onClick={toggleTheme} title="Alternar tema">
          🌓
        </button>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          aria-hidden
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--hover)', display: 'grid', placeItems: 'center',
            fontSize: 12, fontWeight: 700, border: '1px solid var(--border)'
          }}
        >
          {(name || '?').slice(0, 1).toUpperCase()}
        </div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{role || '—'}</div>
        </div>
      </div>
    </header>
  );
}
