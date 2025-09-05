'use client';

import React from 'react';

function getInitial(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') return saved;
  // preferências do SO
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(getInitial);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
      window.localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return (
    <button
      onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      aria-label="Alternar tema"
      title="Alternar tema"
      style={{
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.2)',
        background: 'transparent',
        cursor: 'pointer',
      }}
    >
      {theme === 'light' ? '🌞' : '🌙'}
    </button>
  );
}
