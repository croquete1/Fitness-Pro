'use client';
import * as React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';
import { useColorMode } from '@/components/layout/ColorModeProvider';

export default function ThemeToggle() {
  const { mode, toggle } = useColorMode();
  return (
    <Tooltip title={mode === 'dark' ? '🌞 Modo claro' : '🌙 Modo escuro'}>
      <IconButton onClick={toggle} size="small" aria-label="Alternar tema">
        {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
