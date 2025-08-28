'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';

export default function AppHeader() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showLogout, setShowLogout] = useState(false);

  // tema persistido
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('theme')) as 'light' | 'dark' | null;
    const initial = saved ?? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (typeof window !== 'undefined') localStorage.setItem('theme', theme);
  }, [theme]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    // adapta para a tua rota de pesquisa (se existir)
    router.push(`/dashboard/search?q=${encodeURIComponent(v)}`);
  };

  return (
    <>
      <div className="header-inner">
        <div className="left">
          {/* Search */}
          <form className="search" onSubmit={onSearch} role="search" aria-label="Pesquisar">
            <input
              type="search"
              placeholder="Pesquisar…"
              aria-label="Pesquisar"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
        </div>

        <div className="right">
          {/* Toggle tema */}
          <button
            className="btn icon"
            aria-label="Alternar tema"
            title="Alternar tema"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'light' ? '🌞' : '🌙'}
          </button>

          {/* Notificações */}
          <button className="btn icon" aria-label="Notificações" title="Notificações">🔔</button>

          {/* Sair (com confirmação) */}
          <button className="btn" onClick={() => setShowLogout(true)}>
            Sair
          </button>
        </div>
      </div>

      {/* Modal de confirmação de logout */}
      {showLogout && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] grid place-items-center bg-black/30 p-4"
          onClick={(e) => e.currentTarget === e.target && setShowLogout(false)}
        >
          <div className="w-full max-w-sm rounded-2xl border bg-white p-4 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Terminar sessão?</h3>
            <p className="text-sm opacity-80">
              Vais sair da tua conta. Queres continuar?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="btn ghost" onClick={() => setShowLogout(false)}>
                Cancelar
              </button>
              <button
                className="btn danger"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Terminar sessão
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
