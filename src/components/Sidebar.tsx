// src/components/Sidebar.tsx
'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

interface SidebarProps {
  role?: string
}

export default function Sidebar({ role }: SidebarProps) {
  const { data: session, status } = useSession()

  if (status !== 'authenticated') return null

  return (
    <nav className="h-full p-4">
      <h2 className="text-xl font-bold mb-4">Fitness Pro</h2>
      <ul className="space-y-2">
        <li><Link href={role === 'admin' ? '/admin' : '/home'}>Visão Geral</Link></li>
        {role === 'client' && (
          <li><Link href="/dashboard/workouts">Meus Treinos</Link></li>
        )}
        {role === 'trainer' && (
          <li><Link href="/trainer/clients">Meus Clientes</Link></li>
        )}
        {role === 'admin' && (
          <>
            <li><Link href="/admin/users">Contas</Link></li>
            <li><Link href="/admin/assign-clients">Atribuição</Link></li>
            {/* … outras links … */}
          </>
        )}
        <li>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mt-4 w-full text-left text-red-600"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  )
}
