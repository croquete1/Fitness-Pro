// src/components/providers/MuiProviders.tsx
'use client';

import * as React from 'react';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useTheme as useNextTheme } from 'next-themes';

export default function MuiProviders({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const mode = resolvedTheme === 'dark' ? 'dark' : 'light';

  const theme = React.useMemo(
    () =>
      createTheme({
        cssVariables: true,
        palette: { mode },
        shape: { borderRadius: 12 },
        components: {
          MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
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
