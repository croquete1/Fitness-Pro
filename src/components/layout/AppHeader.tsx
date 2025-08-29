'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SignOutConfirmButton from '@/components/auth/SignOutConfirmButton';

export default function AppHeader() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const current =
      (document.documentElement.dataset.theme as 'light' | 'dark' | undefined) ||
      (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(current);
  }, []);

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
        <form className="search" onSubmit={onSearch} role="search" aria-label="Pesquisar">
          <input
            type="search"
            placeholder="Pesquisar…"
            aria-label="Pesquisar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        <div className="right">
          <button
            className="btn icon"
            aria-label="Alternar tema"
            title="Alternar tema"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'light' ? '🌞' : '🌙'}
          </button>
          <button className="btn icon" aria-label="Notificações" title="Notificações">🔔</button>
          <SignOutConfirmButton />
        </div>
      </div>
    </header>
  );
}
