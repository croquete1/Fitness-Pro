// src/components/layout/DashboardFrame.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from './AppLogo';

type Role = 'ADMIN'|'PT'|'CLIENT';

export default function DashboardFrame({
  role,
  userLabel,
  children,
}: {
  role: Role;
  userLabel: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const isActive = (href: string) => path?.startsWith(href);

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Início', emoji: '🏠' },
    { href: '/dashboard/admin/users', label: 'Utilizadores', emoji: '👥' },
    { href: '/dashboard/admin/approvals', label: 'Aprovações', emoji: '✅' },
    { href: '/dashboard/admin/exercises', label: 'Exercícios', emoji: '📚' },
    { href: '/dashboard/admin/plans', label: 'Planos', emoji: '📝' },
    { href: '/dashboard/notifications', label: 'Centro de notificações', emoji: '🔔' },
  ];

  const ptLinks = [
    { href: '/dashboard/pt', label: 'Início', emoji: '🏠' },
    { href: '/dashboard/pt/clients', label: 'Clientes', emoji: '🧑‍🤝‍🧑' },
    { href: '/dashboard/pt/plans', label: 'Planos', emoji: '📝' },
    { href: '/dashboard/pt/exercises', label: 'Exercícios', emoji: '📚' },
  ];

  const clientLinks = [
    { href: '/dashboard/clients', label: 'Início', emoji: '🏠' },
    { href: '/dashboard/my-plan', label: 'Os meus planos', emoji: '📝' },
    { href: '/dashboard/notifications', label: 'Notificações', emoji: '🔔' },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'PT' ? ptLinks : clientLinks;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="hidden md:flex flex-col gap-3 p-4 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur">
        <div className="flex items-center gap-2 px-2">
          <AppLogo size={28} />
          <div className="text-lg font-bold">Fitness Pro</div>
        </div>
        <nav className="mt-2 grid gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 rounded-lg border ${
                isActive(l.href)
                  ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'border-transparent hover:bg-[var(--hover)]'
              }`}
            >
              <span className="mr-2">{l.emoji}</span>{l.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-h-screen p-4 md:p-6 bg-[var(--bg)]">
        {children}
      </main>
    </div>
  );
}
