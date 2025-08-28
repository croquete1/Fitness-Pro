'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SignOutConfirmButton from '@/components/auth/SignOutConfirmButton';

export default function AppHeader() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Ler tema inicial do dataset (definido cedo no layout) ou do prefers-color-scheme
  useEffect(() => {
    const current =
      (document.documentElement.dataset.theme as 'light' | 'dark' | undefined) ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');
    setTheme(current);
  }, []);

  // Persistir e aplicar o tema
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
      <div className="app-header-inner">
        {/* Marca */}
        <div className="brand">
          <img src="/logo.png" alt="" width={26} height={26} />
          <span className="brand-name">Fitness Pro</span>
        </div>

        {/* Pesquisa centrada */}
        <form className="search-wrap" onSubmit={onSearch} role="search" aria-label="Pesquisar">
          <input
            className="search-input"
            type="search"
            placeholder="Pesquisar…"
            aria-label="Pesquisar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        {/* Ações à direita */}
        <div className="actions">
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

          {/* Sair com confirmação (tem Cancelar) */}
          <SignOutConfirmButton />
        </div>
      </div>
    </header>
  );
}
