// src/app/(app)/dashboard/layout.tsx
import type { ReactNode } from 'react';
import DashboardGate from '@/components/auth/DashboardGate';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DashboardGate />
      {children}
    </>
  );
}
