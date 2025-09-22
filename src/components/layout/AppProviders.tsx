'use client';

import * as React from 'react';
import { SidebarProvider } from './SidebarCtx';

// MUI + Next.js App Router (SSR cache para Emotion)
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Tema claro/escuro (usado pelo teu ThemeToggle)
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

function makeMuiTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: { mode },
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: { defaultProps: { elevation: 0 } },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiTooltip: { defaultProps: { arrow: true } },
    },
  });
}

/** Liga o modo do next-themes ao tema do MUI */
function MuiModeBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Evita “mismatch” de hidratação; só cria o tema depois de montar
  const mode: 'light' | 'dark' =
    mounted && resolvedTheme === 'dark' ? 'dark' : 'light';

  const theme = React.useMemo(() => makeMuiTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <MuiModeBridge>
          <SidebarProvider>{children}</SidebarProvider>
        </MuiModeBridge>
      </NextThemesProvider>
    </AppRouterCacheProvider>
  );
}
