// src/components/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const path = usePathname()

  const commonLinks = [
    { href: '/', label: 'Visão Geral' },
  ]
  const clientLinks = [
    { href: '/dashboard/client', label: 'Meus Treinos' },
  ]
  const trainerLinks = [
    { href: '/dashboard/trainer', label: 'Meus Clientes' },
  ]
  const adminLinks = [
    { href: '/admin', label: 'Dashboard Admin' },
    { href: '/admin/users', label: 'Contas' },
    { href: '/admin/assign-clients', label: 'Atribuição' },
    // adicione os restantes...
  ]

  const links =
    user?.role === 'admin'
      ? [...commonLinks, ...adminLinks]
      : user?.role === 'trainer'
      ? [...commonLinks, ...trainerLinks]
      : user?.role === 'client'
      ? [...commonLinks, ...clientLinks]
      : commonLinks

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-4 font-bold text-xl border-b">Fitness Pro</div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map(({ href, label }) => (
          <Link key={href} href={href}>
            <a
              className={`block px-3 py-2 rounded ${
                path === href ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              {label}
            </a>
          </Link>
        ))}
      </nav>
      {user && (
        <button
          onClick={logout}
          className="m-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      )}
    </aside>
  )
}
