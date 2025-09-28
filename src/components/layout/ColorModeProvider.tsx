'use client';

import * as React from 'react';
import { createTheme, ThemeProvider, CssBaseline, PaletteMode } from '@mui/material';

type Ctx = { mode: PaletteMode; toggle: () => void; set: (m: PaletteMode) => void };
const ColorModeCtx = React.createContext<Ctx | null>(null);

function makeTheme(mode: PaletteMode) {
  return createTheme({
    palette: { mode },
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: { defaultProps: { elevation: 0 } },
      MuiAppBar: { styleOverrides: { root: { borderBottom: '1px solid', borderColor: 'divider' } } },
      MuiListItemButton: { styleOverrides: { root: { borderRadius: 12 } } },
    },
  });
}

export default function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<PaletteMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = (localStorage.getItem('fp-mode') as PaletteMode | null) ?? null;
    if (saved) return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Mantém o atributo no <html> para o teu globals.css
  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
    localStorage.setItem('fp-mode', mode);
  }, [mode]);

  const value = React.useMemo<Ctx>(() => ({
    mode,
    toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    set: setMode,
  }), [mode]);

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
