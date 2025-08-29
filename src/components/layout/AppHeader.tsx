// src/components/layout/AppHeader.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SignOutConfirmButton from '../auth/SignOutConfirmButton';

type Theme = 'light' | 'dark';

export default function AppHeader() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState<Theme>('light');

  // Lê preferência do utilizador (localStorage > dataset > media query)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = (localStorage.getItem('theme') as Theme | null) ?? undefined;
    const ds = (document.documentElement.dataset.theme as Theme | undefined) ?? undefined;
    const mq: Theme =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    const initial = saved ?? ds ?? mq;
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  // Persiste e aplica o tema
  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Atalho Cmd/Ctrl+K para focar pesquisa
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        (document.getElementById('global-search') as HTMLInputElement | null)?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    // Rota de pesquisa global — cria /app/(app)/dashboard/search/page.tsx se ainda não existir
    router.push(`/dashboard/search?q=${encodeURIComponent(v)}`);
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Pesquisa (alinhada à esquerda, ocupa o espaço disponível) */}
        <form className="search" onSubmit={onSearch} role="search" aria-label="Pesquisar">
          <input
            id="global-search"
            type="search"
            placeholder="Pesquisar…"
            aria-label="Pesquisar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        {/* Ações à direita */}
        <div className="right actions" style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn icon"
            aria-label="Alternar tema"
            title="Alternar tema"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            type="button"
          >
            {theme === 'light' ? '🌞' : '🌙'}
          </button>

          <button className="btn icon" aria-label="Notificações" title="Notificações" type="button">
            🔔
          </button>

          {/* Sair com confirmação (inclui Cancelar) */}
          <SignOutConfirmButton />
        </div>
      </div>
    </header>
  );
}
