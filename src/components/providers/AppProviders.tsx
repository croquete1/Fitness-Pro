'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { CssBaseline } from '@mui/material';
import ToastProvider from '@/components/ui/ToastProvider';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <CssBaseline />
      <ToastProvider>{children}</ToastProvider>
    </AppRouterCacheProvider>
  );
}
