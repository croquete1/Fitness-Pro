'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSidebar } from './SidebarProvider';

export default function AppHeader() {
  const router = useRouter();
  const { /* disponível se quiseres ligar algo da sidebar */ } = useSidebar();

  // -------- Pesquisa --------
  const [q, setQ] = useState('');
  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(`/dashboard/search?q=${encodeURIComponent(term)}`);
  }

  // -------- Tema (light/dark) --------
  type Theme = 'light' | 'dark';
  const preferred = useMemo<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const [theme, setTheme] = useState<Theme>(preferred);

  // aplica no load
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  // garante que no 1º render também fica certo (SSR -> CSR)
  useEffect(() => {
    setTheme(preferred);
  }, [preferred]);

  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div className="header-inner">
      <div className="left">
        {/* Search */}
        <form className="search" role="search" aria-label="Pesquisar" onSubmit={onSearchSubmit}>
          <input
            type="search"
            placeholder="Pesquisar..."
            aria-label="Pesquisar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" className="btn">Pesquisar</button>
        </form>
      </div>

      <div className="right" style={{ display:'flex', alignItems:'center', gap:8 }}>
        {/* Toggle de tema */}
        <button
          className="btn icon"
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          title={isDark ? 'Tema claro' : 'Tema escuro'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Notificações */}
        <button className="btn icon" aria-label="Notificações" title="Notificações">🔔</button>

        {/* Sair (anchor para garantir GET no endpoint do NextAuth) */}
        <a className="btn" href="/api/auth/signout?callbackUrl=/login">Sair</a>
      </div>
    </div>
  );
}
