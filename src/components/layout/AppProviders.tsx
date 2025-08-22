'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import SidebarProvider from '@/components/layout/SidebarProvider';

export default function AppProviders({ children }: { children: ReactNode }) {
  // Providers de cliente têm de envolver TODA a app “app shell”
  return (
    <SessionProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </SessionProvider>
  );
}
