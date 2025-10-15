'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { createNeoTheme } from '@/theme';

/**
 * Color mode (light/dark) – compatível com MUI 5.x (sem CssVarsProvider/experimental_extendTheme).
 * Guarda preferência em localStorage e respeita o esquema do sistema.
 */
export type Mode = 'light' | 'dark';

const ColorModeContext = React.createContext<{ mode: Mode; setMode: (m: Mode) => void }>({
  mode: 'light',
  setMode: () => {},
});

/** ✅ Named export usado pelo ThemeToggleButton */
export function useColorMode() {
  return React.useContext(ColorModeContext);
}

function getSystemMode(): Mode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredMode(): Mode | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem('color-mode');
  return v === 'dark' || v === 'light' ? (v as Mode) : null;
}

function storeMode(m: Mode) {
  try {
    window.localStorage.setItem('color-mode', m);
  } catch {}
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode>(() => readStoredMode() ?? getSystemMode());

  // Respeita alterações do sistema se o utilizador não tiver guardado preferência
  React.useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const stored = readStoredMode();
      if (!stored) setMode(media.matches ? 'dark' : 'light');
    };
    media.addEventListener?.('change', handler);
    return () => media.removeEventListener?.('change', handler);
  }, []);

  const theme = React.useMemo(() => createNeoTheme(mode), [mode]);

  const ctx = React.useMemo(
    () => ({
      mode,
      setMode: (m: Mode) => {
        storeMode(m);
        setMode(m);
      },
    }),
    [mode],
  );

  return (
    <AppRouterCacheProvider>
      <ColorModeContext.Provider value={ctx}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
