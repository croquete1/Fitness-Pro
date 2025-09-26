'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { SessionProvider } from 'next-auth/react';

// Paleta com contraste real para os dois modos
function makeTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: { main: '#1e66ff' },
            background: { default: '#f7f8fa', paper: '#ffffff' },
            text: { primary: '#0b1220', secondary: '#5f6b7a' },
            divider: '#e5e9f2',
          }
        : {
            primary: { main: '#6da7ff' },
            background: { default: '#0b0b10', paper: '#111317' },
            text: { primary: '#e7e9ee', secondary: '#a8b0bf' },
            divider: '#232730',
          }),
    },
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: '1px solid',
            borderColor: mode === 'light' ? '#e5e9f2' : '#232730',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: '1px solid',
            borderColor: mode === 'light' ? '#e5e9f2' : '#232730',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 700, borderRadius: 12 },
        },
      },
      MuiAppBar: { styleOverrides: { root: { boxShadow: 'none' } } },
    },
  });
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const initialMode =
    typeof window === 'undefined'
      ? 'light'
      : (localStorage.getItem('fp:mode') as 'light' | 'dark') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const [mode, setMode] = React.useState<'light' | 'dark'>(initialMode);

  // Sincroniza atributo para CSS vars (globals.css) e guarda preferência
  React.useEffect(() => {
    try {
      document.documentElement.dataset.theme = mode;
      localStorage.setItem('fp:mode', mode);
    } catch {}
  }, [mode]);

  const theme = React.useMemo(() => makeTheme(mode), [mode]);

  // Opcional: expõe um toggler no window para testares rapidamente no devtools
  React.useEffect(() => {
    // @ts-ignore
    window.__toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <SessionProvider>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </AppRouterCacheProvider>
    </SessionProvider>
  );
}
