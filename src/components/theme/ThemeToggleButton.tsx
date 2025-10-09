'use client';

import * as React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { useColorMode } from '@/components/layout/ColorModeProvider';

export default function ThemeToggleButton() {
  const { mode, set } = useColorMode();
  const next = mode === 'dark' ? 'light' : 'dark';

  return (
    <Tooltip title={mode === 'dark' ? 'Mudar para claro' : 'Mudar para escuro'}>
      <IconButton
        size="small"
        aria-label="alternar tema"
        data-theme-toggle="true"
        onClick={() => set(next)}
        sx={{ ml: 0.5 }}
      >
        {mode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
      </IconButton>
    </Tooltip>
  );
}
