'use client';

import Link from 'next/link';
import SidebarBase from './SidebarBase';

function Brand() {
  return (
    <Link href="/dashboard/admin" className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-neutral-900 text-white grid place-items-center dark:bg-white dark:text-neutral-900 font-semibold">
        FP
      </div>
      <span className="font-semibold tracking-tight">Fitness Pro</span>
    </Link>
  );
}

const Icon = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" fill="currentColor" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM3 20a7 7 0 0118 0v1H3v-1z" fill="currentColor" />
    </svg>
  ),
  clients: (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM3 21a9 9 0 1118 0v1H3v-1z" fill="currentColor" />
    </svg>
  ),
  plans: (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M4 5h16v14H4zM8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  ),
  exercises: (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M5 12h14M7 7v10M17 7v10" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M10 17l5-5-5-5M3 12h12" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  ),
};

export default function SidebarAdmin() {
  return (
    <SidebarBase
      brand={<Brand />}
      groups={[
        {
          items: [
            { href: '/dashboard/admin', label: 'Dashboard', icon: Icon.grid },
            { href: '/dashboard/admin/users', label: 'Utilizadores', icon: Icon.users, match: ['/dashboard/admin/users'] },
            // Ajusta os paths de acordo com o teu projeto:
            { href: '/dashboard/admin/clients', label: 'Clientes & Pacotes', icon: Icon.clients, match: ['/dashboard/admin/clients', '/dashboard/admin/packages'] },
            { href: '/dashboard/admin/plans', label: 'Planos (Admin)', icon: Icon.plans },
            { href: '/dashboard/admin/exercises', label: 'Exercícios (Catálogo)', icon: Icon.exercises, match: ['/dashboard/admin/exercises'] },
            { href: '/api/auth/signout', label: 'Sair', icon: Icon.logout },
          ],
        },
      ]}
    />
  );
}