'use client';

import * as React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Toaster } from 'sonner';
import { SidebarProvider } from '../layout/SidebarProvider'; // se o teu provider for ./SidebarCtx, ajusta este import
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

function MuiThemeBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const mode = resolvedTheme === 'dark' ? 'dark' : 'light';

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? {
                background: { default: '#0b0d10', paper: '#13161b' },
                divider: 'rgba(255,255,255,0.08)',
              }
            : {
                background: { default: '#f7f8fb', paper: '#ffffff' },
                divider: 'rgba(0,0,0,0.08)',
              }),
        },
        shape: { borderRadius: 12 },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: { backgroundImage: 'none' },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: { backgroundImage: 'none' },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: { borderBottomColor: 'var(--mui-palette-divider)' },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      <Toaster richColors closeButton position="top-right" />
    </ThemeProvider>
  );
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <SidebarProvider>
        <MuiThemeBridge>{children}</MuiThemeBridge>
      </SidebarProvider>
    </NextThemesProvider>
  );
}
