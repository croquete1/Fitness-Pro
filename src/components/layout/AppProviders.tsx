// src/components/layout/AppProviders.tsx (excerto)
'use client';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import SidebarProvider from './SidebarProvider';
import Toaster from '@/components/ui/Toaster';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <Toaster>
          {children}
        </Toaster>
      </SidebarProvider>
    </SessionProvider>
  );
}
