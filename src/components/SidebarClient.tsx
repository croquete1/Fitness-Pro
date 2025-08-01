// src/components/SidebarClient.tsx
'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'

interface SidebarClientProps {
  user: Session['user'] & { role?: string }
}

export default function SidebarClient({ user }: SidebarClientProps) {
  return (
    <nav className="h-full p-4 bg-white">
      <h2 className="text-2xl font-semibold mb-6">Fitness Pro</h2>
      <ul className="space-y-2">
        <li>
          <Link
            href={user.role === 'admin' ? '/admin' : '/home'}
            className="block py-2 px-3 hover:bg-gray-100 rounded"
          >
            Visão Geral
          </Link>
        </li>
        {user.role === 'client' && (
          <li>
            <Link
              href="/dashboard/workouts"
              className="block py-2 px-3 hover:bg-gray-100 rounded"
            >
              Meus Treinos
            </Link>
          </li>
        )}
        {user.role === 'trainer' && (
          <li>
            <Link
              href="/trainer/clients"
              className="block py-2 px-3 hover:bg-gray-100 rounded"
            >
              Meus Clientes
            </Link>
          </li>
        )}
        {user.role === 'admin' && (
          <>
            <li>
              <Link
                href="/admin/users"
                className="block py-2 px-3 hover:bg-gray-100 rounded"
              >
                Contas
              </Link>
            </li>
            <li>
              <Link
                href="/admin/assign-clients"
                className="block py-2 px-3 hover:bg-gray-100 rounded"
              >
                Atribuição
              </Link>
            </li>
          </>
        )}

        <li className="mt-4">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left text-red-600 hover:underline"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  )
}
