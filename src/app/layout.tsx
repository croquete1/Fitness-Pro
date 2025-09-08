// src/app/(app)/dashboard/layout.tsx
import React from 'react';
import AppProviders from '@/components/layout/AppProviders';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
