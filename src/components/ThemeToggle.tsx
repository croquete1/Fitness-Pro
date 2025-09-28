'use client';

import * as React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';

function applyTheme(mode: 'light' | 'dark') {
  const root = document.documentElement;
  root.dataset.theme = mode;
  try { localStorage.setItem('fp-theme', mode); } catch {}
}

export default function ThemeToggle() {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('fp-theme') as 'light' | 'dark' | null : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initial = saved ?? (prefersDark ? 'dark' : 'light');
    setMode(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    applyTheme(next);
  };

  return (
    <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
      <IconButton onClick={toggle} aria-label="Alternar tema">
        {mode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
      </IconButton>
    </Tooltip>
  );
}
