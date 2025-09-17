'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AppRole } from '@/lib/roles';

type Item = { href: string; label: string; icon: string };

export function getRoleNav(role: AppRole): Item[] {
  if (role === 'ADMIN') {
    return [
      { href: '/dashboard/admin', label: 'Início', icon: '🏠' },
      { href: '/dashboard/admin/users', label: 'Utilizadores', icon: '👥' },
      { href: '/dashboard/admin/approvals', label: 'Aprovações', icon: '✅' },
      { href: '/dashboard/admin/exercises', label: 'Exercícios', icon: '📚' },
      { href: '/dashboard/admin/plans', label: 'Planos', icon: '📝' },
      { href: '/dashboard/admin/pt-schedule', label: 'Agenda PTs', icon: '📅' },
      { href: '/dashboard/admin/profile', label: 'O meu perfil', icon: '⚙️' },
    ];
  }
  if (role === 'PT') {
    return [
      { href: '/dashboard/pt', label: 'Início', icon: '🏠' },
      { href: '/dashboard/pt/clients', label: 'Clientes', icon: '🧑‍🤝‍🧑' },
      { href: '/dashboard/pt/plans', label: 'Planos', icon: '📝' },
      { href: '/dashboard/pt/exercises', label: 'Exercícios', icon: '📚' },
      { href: '/dashboard/pt/profile', label: 'O meu perfil', icon: '⚙️' },
    ];
  }
  return [
    { href: '/dashboard/clients', label: 'Início', icon: '🏠' },
    { href: '/dashboard/my-plan', label: 'Os meus planos', icon: '🏋️' },
    { href: '/dashboard/notifications', label: 'Notificações', icon: '🔔' },
    { href: '/dashboard/profile', label: 'Conta', icon: '👤' },
  ];
}

export default function RoleSidebar({
  role,
  onNavigate,
}: {
  role: AppRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = getRoleNav(role);

  // ACTIVE ÚNICO → item com href mais longo que coincide
  const matches = items.filter(i => pathname === i.href || pathname.startsWith(i.href + '/'));
  const activeHref = matches.sort((a, b) => b.href.length - a.href.length)[0]?.href ?? '';

  return (
    <aside className="fp-sidebar">
      <div className="fp-sb-head">
        <div className="fp-sb-brand">
          <img src="/assets/logo.png" alt="Fitness Pro" className="logo" />
          <div className="brand-name">Fitness Pro</div>
        </div>
      </div>

      <nav className="fp-nav" data-variant="colorful">
        <div className="nav-group">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="nav-item"
              data-active={i.href === activeHref}
              onClick={onNavigate}
            >
              <span className="nav-icon nav-emoji" aria-hidden>{i.icon}</span>
              <span className="nav-label">{i.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
