'use client';

import * as React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createNeoTheme } from '@/theme';

type Mode = 'light' | 'dark';
type Ctx = { mode: Mode; toggle: () => void; set: (m: Mode) => void };
const ThemeCtx = React.createContext<Ctx | null>(null);

function getInitialMode(): Mode {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('fp-mode') as Mode | null;
  if (saved === 'light' || saved === 'dark') return saved;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, _setMode] = React.useState<Mode>(getInitialMode);

  React.useEffect(() => {
    document.documentElement.dataset.theme = mode; // liga às CSS vars
    localStorage.setItem('fp-mode', mode);
  }, [mode]);

  const set = (m: Mode) => _setMode(m);
  const toggle = () => _setMode((cur) => (cur === 'light' ? 'dark' : 'light'));

  const theme = React.useMemo(() => createNeoTheme(mode), [mode]);

  return (
    <ThemeCtx.Provider value={{ mode, toggle, set }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeCtx.Provider>
  );
}

export function useAppTheme() {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) throw new Error('useAppTheme must be used within <AppThemeProvider>');
  return ctx;
}
