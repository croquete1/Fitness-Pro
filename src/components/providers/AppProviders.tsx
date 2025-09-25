'use client';

import * as React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { SidebarProvider } from '@/components/layout/SidebarContext';

function MuiBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const mode = (resolvedTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#1976d2' },
          secondary: { main: '#9c27b0' },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <AppRouterCacheProvider>
          <MuiBridge>
            {/* ✅ Sidebar context disponível em toda a app */}
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </MuiBridge>
        </AppRouterCacheProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}
