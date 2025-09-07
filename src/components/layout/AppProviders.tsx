// src/components/layout/AppProviders.tsx
'use client';

import React from 'react';
import { SidebarProvider } from './SidebarProvider';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
