'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (dark) {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      className="btn icon"
      onClick={() => setDark((v) => !v)}
      aria-label="Alternar tema"
      title={dark ? 'Tema claro' : 'Tema escuro'}
    >
      {dark ? (
        // sol
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <path
            d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657 6.343l1.414 1.414M4.929 4.929l1.414 1.414m0 11.314L4.93 19.071M19.071 4.929l-1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z"
            stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      ) : (
        // lua
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
