'use client';

import * as React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// tema mínimo (podes trocar depois)
const theme = createTheme({
  palette: { mode: 'dark', primary: { main: '#1976d2' } },
  shape: { borderRadius: 12 },
});

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <SessionProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </SessionProvider>
    </AppRouterCacheProvider>
  );
}
