// app/dashboard/layout.tsx
import React from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Container } from '../../components/Container'
import { getUserRole } from '@/lib/auth'   // Hook de sessão/autorização

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = getUserRole();          // ex: 'client' | 'trainer' | 'admin'

  return (
    <div className="flex h-screen">
      <Sidebar role={role} />
      <Container>{children}</Container>
    </div>
  );
}
