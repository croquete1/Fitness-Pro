'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SignOutConfirmButton from '@/components/auth/SignOutConfirmButton';

export default function AppHeader() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // tema inicial a partir do dataset (layout) ou prefers-color-scheme
  useEffect(() => {
    const current =
      (document.documentElement.dataset.theme as 'light' | 'dark' | undefined) ||
      (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(current);
  }, []);

  // aplica + persiste
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    router.push(`/dashboard/search?q=${encodeURIComponent(v)}`);
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Pesquisa (à esquerda / centro, ocupa o espaço) */}
        <form className="search" onSubmit={onSearch} role="search" aria-label="Pesquisar">
          <input
            id="global-search"
            className="search-input"
            type="search"
            placeholder="Pesquisar…"
            aria-label="Pesquisar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        {/* Ações encostadas à direita */}
        <div className="actions" style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8 }}>
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

          {/* Sair com confirmação (modal centrado) */}
          <SignOutConfirmButton />
        </div>
      </div>
    </header>
  );
}
