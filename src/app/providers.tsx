// src/app/providers.tsx
'use client';

import * as React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

function MuiBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const mode = resolvedTheme === 'dark' ? 'dark' : 'light';

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: { mode },
        shape: { borderRadius: 12 },
        components: {
          MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
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

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <MuiBridge>{children}</MuiBridge>
      </NextThemesProvider>
    </SessionProvider>
  );
}
