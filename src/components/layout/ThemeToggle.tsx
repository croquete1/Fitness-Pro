'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const saved = localStorage.getItem('theme') ?? '';
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    html.dataset.theme = isDark ? 'dark' : 'light';
    setDark(isDark);
  }, []);

  function toggle() {
    const html = document.documentElement;
    const next = !dark;
    html.dataset.theme = next ? 'dark' : 'light';
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setDark(next);
  }

  return (
    <button className="btn icon" aria-pressed={dark} aria-label="Alternar tema" onClick={toggle} title="Tema claro/escuro">
      {/* ícone simples sem dependências */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        {dark ? (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" />
        ) : (
          <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.95 6.95-1.41-1.41M7.46 7.46 6.05 6.05m12.9 0-1.41 1.41M7.46 16.54 6.05 17.95" stroke="currentColor" strokeWidth="2" />
        )}
      </svg>
    </button>
  );
}
