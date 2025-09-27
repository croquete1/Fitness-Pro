'use client';

import * as React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { deepmerge } from '@mui/utils';

type Mode = 'light' | 'dark';

type ColorModeCtx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  toggle: () => void;
};
const ColorModeContext = React.createContext<ColorModeCtx | null>(null);
export const useColorMode = () => {
  const ctx = React.useContext(ColorModeContext);
  if (!ctx) throw new Error('useColorMode must be used within AppProviders');
  return ctx;
};

// aplica o data-theme no <html> e sincroniza color-scheme
function applyHtmlTheme(mode: Mode) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
  let meta = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'color-scheme';
    document.head.appendChild(meta);
  }
  meta.content = mode === 'dark' ? 'dark light' : 'light dark';
}

const baseTheme = (mode: Mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            background: { default: '#f5f7fb', paper: '#ffffff' },
            text: { primary: '#0f172a', secondary: '#5b677a' },
            divider: '#e6ebf2',
          }
        : {
            background: { default: '#0b1220', paper: '#0f172a' },
            text: { primary: '#e5e7eb', secondary: '#a7b1c2' },
            divider: '#1f2937',
          }),
      primary: { main: '#3b82f6' },
      secondary: { main: '#7c3aed' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: {
        defaultProps: { elevation: 0, variant: 'outlined' },
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 12,
            '&.Mui-selected': {
              backgroundColor:
                theme.palette.mode === 'light'
                  ? 'rgba(59,130,246,.10)'
                  : 'rgba(59,130,246,.16)',
            },
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'saturate(140%) blur(6px)',
          }),
        },
      },
    },
  });

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem('ui:mode') as Mode | null;
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  React.useEffect(() => {
    try {
      window.localStorage.setItem('ui:mode', mode);
    } catch {}
    applyHtmlTheme(mode);
  }, [mode]);

  const ctx: ColorModeCtx = React.useMemo(
    () => ({
      mode,
      setMode,
      toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    }),
    [mode],
  );

  const theme = React.useMemo(() => {
    // se precisares, podes deepmerge com overrides próprios
    return deepmerge(baseTheme(mode), {});
  }, [mode]);

  return (
    <ColorModeContext.Provider value={ctx}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
