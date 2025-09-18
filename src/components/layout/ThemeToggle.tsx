// src/components/ThemeToggle.tsx
'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, systemTheme, setTheme } = useTheme();
  const current = theme === 'system' ? systemTheme : theme;
  const next = current === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(next || 'light')}
      className="rounded-md border border-slate-300 dark:border-slate-700 px-2.5 py-1.5"
      aria-label="Alternar tema claro/escuro"
      title="Alternar tema"
    >
      {current === 'dark' ? '☾' : '☀︎'}
    </button>
  );
}
