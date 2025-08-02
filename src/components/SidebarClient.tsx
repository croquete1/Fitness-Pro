'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface SidebarClientProps {
  user: { id?: string; email?: string; role?: string }
}

export default function SidebarClient({ user }: SidebarClientProps) {
  const role = user.role ?? 'client'

  return (
    <nav className="h-full p-6 bg-white flex flex-col">
      <h2 className="text-xl font-bold mb-6">Fitness Pro</h2>
      <ul className="flex flex-col gap-4">
        <li>
          <Link
            href={role === 'admin' ? '/admin' : '/home'}
            className="text-gray-700 hover:text-blue-600"
          >
            Visão Geral
          </Link>
        </li>
        {role === 'client' && (
          <li>
            <Link href="/dashboard/workouts" className="text-gray-700 hover:text-blue-600">
              Meus Treinos
            </Link>
          </li>
        )}
        {role === 'trainer' && (
          <li>
            <Link href="/trainer/clients" className="text-gray-700 hover:text-blue-600">
              Meus Clientes
            </Link>
          </li>
        )}
        {role === 'admin' && (
          <>
            <li>
              <Link href="/admin/users" className="text-gray-700 hover:text-blue-600">
                Contas
              </Link>
            </li>
            <li>
              <Link href="/admin/assign-clients" className="text-gray-700 hover:text-blue-600">
                Atribuição
              </Link>
            </li>
          </>
        )}
        <li className="mt-auto pt-4">
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-red-600 text-left">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  )
}
