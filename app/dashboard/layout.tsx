// app/dashboard/layout.tsx
import React from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Container } from '@/components/Container'
import { useSession } from '@/lib/auth'   // Hook de sessão/autorização

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role } = useSession()          // ex: 'client' | 'trainer' | 'admin'

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar role={role} />             {/* menus dinâmicos */}
      <Container>
        <header className="py-4">
          <h1 className="text-2xl font-semibold">Fitness-Pro</h1>
        </header>
        <main>{children}</main>
      </Container>
    </div>
  )
}
