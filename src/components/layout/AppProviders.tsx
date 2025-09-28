'use client';

import * as React from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

type Mode = 'light' | 'dark';
export const ColorModeCtx = React.createContext<{mode: Mode; toggle: () => void}>({
  mode: 'light',
  toggle: () => {},
});

function getInitialMode(): Mode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('fp:mode') as Mode | null;
  if (stored) return stored;
  const sys = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return sys;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode>(getInitialMode);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    window.localStorage.setItem('fp:mode', mode);
  }, [mode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: mode === 'dark' ? '#0b0b10' : '#f6f8fb',
            paper: mode === 'dark' ? '#111317' : '#ffffff',
          },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiPaper: { styleOverrides: { root: { border: '1px solid', borderColor: 'divider' } } },
          MuiAppBar: { styleOverrides: { root: { backdropFilter: 'saturate(140%) blur(6px)' } } },
        },
      }),
    [mode],
  );

  return (
    <ColorModeCtx.Provider value={{ mode, toggle: () => setMode(m => (m === 'light' ? 'dark' : 'light')) }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeCtx.Provider>
  );
}
