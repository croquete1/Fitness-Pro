'use client';

import * as React from 'react';
import { createTheme, ThemeProvider, CssBaseline, PaletteMode } from '@mui/material';
import { ptPT as muiPT } from '@mui/material/locale';

type Ctx = { mode: PaletteMode; toggle: () => void; set: (m: PaletteMode) => void };
const ColorModeCtx = React.createContext<Ctx | null>(null);

function makeTheme(mode: PaletteMode) {
  const lightPalette = {
    mode: 'light' as const,
    primary: { main: '#1e66ff', dark: '#1554e6', contrastText: '#fff' },
    background: { default: '#f6f8fb', paper: '#ffffff' },
    text: { primary: '#0b1220', secondary: '#5f6b7a' },
    divider: '#e2e8f0',
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#3b82f6' },
  };
  const darkPalette = {
    mode: 'dark' as const,
    primary: { main: '#6da7ff', dark: '#4e8dff', contrastText: '#fff' },
    background: { default: '#0b0b10', paper: '#111317' },
    text: { primary: '#e7e9ee', secondary: '#a8b0bf' },
    divider: '#232730',
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#3b82f6' },
  };

  return createTheme(
    {
      palette: mode === 'dark' ? darkPalette : lightPalette,
      shape: { borderRadius: 12 },
      typography: {
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif',
        button: { textTransform: 'none', fontWeight: 600 },
      },
      components: {
        MuiPaper: { defaultProps: { elevation: 0 } },
        MuiAppBar: { styleOverrides: { root: { borderBottom: '1px solid', borderColor: 'divider' } } },
        MuiListItemButton: { styleOverrides: { root: { borderRadius: 12 } } },
        MuiButton: {
          defaultProps: { size: 'medium' },
          styleOverrides: {
            root: { borderRadius: 12 },
          },
          variants: [
            { props: { variant: 'contained' }, style: { boxShadow: 'none' } },
            { props: { variant: 'outlined' }, style: { borderColor: 'divider' } },
          ],
        },
        MuiCard: {
          defaultProps: { elevation: 0 },
          styleOverrides: { root: { border: '1px solid', borderColor: 'divider', borderRadius: 16 } },
        },
        MuiTableHead: {
          styleOverrides: { root: { backgroundColor: mode === 'dark' ? '#0f1116' : '#f8fafc' } },
        },
      },
    },
    muiPT, // locale PT-PT para todos os componentes MUI
  );
}

export default function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<PaletteMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = (localStorage.getItem('fp-mode') as PaletteMode | null) ?? null;
    if (saved) return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
    localStorage.setItem('fp-mode', mode);
  }, [mode]);

  const value = React.useMemo<Ctx>(
    () => ({ mode, toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')), set: setMode }),
    [mode],
  );

  const theme = React.useMemo(() => makeTheme(mode), [mode]);

  return (
    <ColorModeCtx.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeCtx.Provider>
  );
}

export function useColorMode() {
  const ctx = React.useContext(ColorModeCtx);
  if (!ctx) throw new Error('useColorMode must be used within ColorModeProvider');
  return ctx;
}
