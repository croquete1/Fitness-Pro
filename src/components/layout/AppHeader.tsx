'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SignOutConfirmButton from '@/components/auth/SignOutConfirmButton';

export default function AppHeader() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // tema inicial
  useEffect(() => {
    const current =
      (document.documentElement.dataset.theme as 'light' | 'dark' | undefined) ||
      (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(current);
  }, []);

  // aplica/persiste tema
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    router.push(`/dashboard/search?q=${encodeURIComponent(v)}`);
  }

  return (
    <header className="app-header">
      <div className="app-header-inner" style={{ gap: 12 }}>
        {/* Pesquisa centrada (sem logo no header) */}
        <form
          onSubmit={onSearch}
          role="search"
          aria-label="Pesquisar"
          style={{ flex: 1, display: 'flex' }}
        >
          <input
            type="search"
            placeholder="Pesquisar…"
            aria-label="Pesquisar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              width: '100%',
              height: 38,
              padding: '0 12px',
              border: '1px solid var(--border)',
              borderRadius: 10,
              background: 'var(--card-bg)',
              color: 'var(--text)',
              outline: 'none',
            }}
          />
        </form>

        {/* Ações à direita */}
        <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="btn icon"
            aria-label="Alternar tema"
            title="Alternar tema"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'light' ? '🌞' : '🌙'}
          </button>

          <button className="btn icon" aria-label="Notificações" title="Notificações">
            🔔
          </button>

          <SignOutConfirmButton />
        </div>
      </div>
    </header>
  );
}
