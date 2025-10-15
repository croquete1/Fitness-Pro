// src/app/providers.tsx
'use client';

import * as React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createNeoTheme } from '@/theme';

function MuiBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const mode = resolvedTheme === 'dark' ? 'dark' : 'light';

  const theme = React.useMemo(() => createNeoTheme(mode), [mode]);

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
