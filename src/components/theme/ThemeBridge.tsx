'use client';

import * as React from 'react';
import { useColorScheme } from '@mui/material/styles';

/**
 * Mantém <html data-theme="light|dark"> sincronizado com o MUI ColorScheme.
 * Não passa funções do server para client.
 */
export default function ThemeBridge() {
  const { mode } = useColorScheme();
  React.useEffect(() => {
    if (!mode) return;
    const html = document.documentElement;
    html.setAttribute('data-theme', mode);
    // opcional: persistir modo (se o teu ThemeToggle já o faz, podes remover)
    localStorage.setItem('fp-theme', mode);
  }, [mode]);
  return null;
}
