'use client';

import * as React from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#F7F9FC',
      paper: '#FFFFFF',
    },
    divider: '#E6EAF2',
    primary: { main: '#3b82f6', dark: '#2563eb' },
    secondary: { main: '#7c3aed' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    text: {
      primary: '#0f172a',
      secondary: '#5b677a',
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans"',
    h5: { fontWeight: 800 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: '0 8px 24px rgba(15,23,42,.06), 0 2px 6px rgba(15,23,42,.04)' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backdropFilter: 'saturate(140%) blur(6px)' },
      },
    },
  },
});

export default function AppTheme({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
