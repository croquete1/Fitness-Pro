// src/components/providers/MuiProviders.tsx
'use client';

import * as React from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useTheme as useNextTheme } from 'next-themes';
import { createNeoTheme } from '@/theme';

export default function MuiProviders({ children }: { children: React.ReactNode }) {
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
