'use client';

import * as React from 'react';
import clsx from 'clsx';
import { Moon, Sun } from 'lucide-react';
import { useColorMode } from '@/components/layout/ColorModeProvider';

type ThemeToggleProps = {
  className?: string;
  variant?: 'default' | 'subtle';
};

export default function ThemeToggle({ className, variant = 'default' }: ThemeToggleProps) {
  const { mode, toggle } = useColorMode();
  const label = mode === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro';
  const Icon = mode === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={clsx('theme-toggle', className)}
      data-variant={variant}
    >
      <Icon className="theme-toggle__icon" aria-hidden />
      <span className="sr-only">{label}</span>
    </button>
  );
}
