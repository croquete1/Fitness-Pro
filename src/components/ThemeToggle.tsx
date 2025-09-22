'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

type Props = { size?: 'small' | 'medium' | 'large' };

export default function ThemeToggle({ size = 'small' }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';
  return (
    <Tooltip title={isDark ? 'Modo claro' : 'Modo escuro'}>
      <IconButton onClick={() => setTheme(isDark ? 'light' : 'dark')} size={size}>
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
