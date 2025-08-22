'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import SidebarProvider from '@/components/SidebarWrapper';
import ToastProvider from '@/components/ui/ToastProvider';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <ToastProvider>{children}</ToastProvider>
      </SidebarProvider>
    </SessionProvider>
  );
}
