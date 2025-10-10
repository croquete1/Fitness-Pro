'use client';

import * as React from 'react';
import { SessionProvider } from 'next-auth/react';
import ColorModeProvider from '@/components/layout/ColorModeProvider';
import { ToastProvider } from '@/components/ui/ToastProvider';

type Props = { children: React.ReactNode; initialMode?: 'light' | 'dark' };

export default function AppProviders({ children, initialMode }: Props) {
  return (
    <SessionProvider>
      <ColorModeProvider initialMode={initialMode}>
        <ToastProvider>{children}</ToastProvider>
      </ColorModeProvider>
    </SessionProvider>
  );
}
