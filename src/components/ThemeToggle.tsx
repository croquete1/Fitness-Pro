'use client';
import * as React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';

export default function ThemeToggle() {
  const [mode, setMode] = React.useState<'light'|'dark'>(() =>
    (typeof window !== 'undefined' && (localStorage.getItem('theme') as any)) || 'light'
  );

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
      localStorage.setItem('theme', mode);
    }
  }, [mode]);

  return (
    <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
      <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
        {mode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
      </IconButton>
    </Tooltip>
  );
}
