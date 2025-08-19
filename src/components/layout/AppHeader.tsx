'use client';

import { useEffect, useState } from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import { signOut } from 'next-auth/react';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const ls = localStorage.getItem('theme');
    if (ls === 'light' || ls === 'dark') return ls;
  } catch {}
  // fallback: preferências do SO
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export default function AppHeader() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  // aplicar no <html data-theme="...">
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const onToggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="flex items-center gap-2">
      {/* NOTIFICAÇÕES */}
      <button
        type="button"
        className="btn icon"
        aria-label="Notificações"
        title="Notificações"
      >
        <Bell size={18} />
      </button>

      {/* TEMA */}
      <button
        type="button"
        onClick={onToggleTheme}
        className="btn icon"
        aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
        title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* SAIR */}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="btn ghost"
        aria-label="Terminar sessão"
        title="Terminar sessão"
      >
        Terminar sessão
      </button>
    </div>
  );
}
