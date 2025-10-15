'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useColorMode } from '@/components/layout/ColorModeProvider';

export default function ThemeToggle() {
  const { mode, toggle } = useColorMode();
  const label = mode === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro';
  const Icon = mode === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/80 text-slate-900 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:color-mix(in_srgb,var(--primary)_55%,transparent)] dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-100"
    >
      <Icon className="h-5 w-5" aria-hidden />
      <span className="sr-only">{label}</span>
    </button>
  );
}
