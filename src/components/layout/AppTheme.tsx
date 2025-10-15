'use client';

import * as React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createNeoTheme } from '@/theme';

const theme = createNeoTheme('light');

export default function AppTheme({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
