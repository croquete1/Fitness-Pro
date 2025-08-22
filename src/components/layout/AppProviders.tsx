'use client';

import { SessionProvider } from 'next-auth/react';
import SidebarProvider from './SidebarProvider';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </SessionProvider>
  );
}
