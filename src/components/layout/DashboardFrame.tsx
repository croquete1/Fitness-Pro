'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useSidebar } from './SidebarCtx';
import NotificationMenu from '@/components/notifications/NotificationMenu';
import { signOut } from 'next-auth/react';

type Role = 'ADMIN' | 'PT' | 'CLIENT';

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
  const { collapsed, toggleCollapse, openMobile, closeMobile, toggleTheme, theme } = useSidebar();
  const isActive = (href: string) => path === href || path?.startsWith(href + '/');

  const links = useMemo(() => {
    if (role === 'ADMIN') {
      return [
        { href: '/dashboard/admin', label: 'Início', emoji: '🏠' },
        { href: '/dashboard/admin/users', label: 'Utilizadores', emoji: '👥' },
        { href: '/dashboard/admin/approvals', label: 'Aprovações', emoji: '✅' },
        { href: '/dashboard/admin/exercises', label: 'Exercícios', emoji: '📚' },
        { href: '/dashboard/admin/plans', label: 'Planos', emoji: '📝' },
        { href: '/dashboard/admin/pt-schedule', label: 'Agenda PTs', emoji: '📅' },
        { href: '/dashboard/admin/profile', label: 'O meu perfil', emoji: '⚙️' },
      ];
    }
    if (role === 'PT') {
      return [
        { href: '/dashboard/pt', label: 'Início', emoji: '🏠' },
        { href: '/dashboard/pt/clients', label: 'Clientes', emoji: '🧑‍🤝‍🧑' },
        { href: '/dashboard/pt/plans', label: 'Planos', emoji: '📝' },
        { href: '/dashboard/pt/exercises', label: 'Exercícios', emoji: '📚' },
      ];
    }
    return [
      { href: '/dashboard/clients', label: 'Início', emoji: '🏠' },
      { href: '/dashboard/my-plan', label: 'Os meus planos', emoji: '📝' },
      { href: '/dashboard/notifications', label: 'Notificações', emoji: '🔔' },
    ];
  }, [role]);

  const IconBurger = () => (
    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2"/></svg>
  );
  const IconChevron = () => (
    <svg width="20" height="20" viewBox="0 0 24 24"
      style={{ transition: 'transform .26s var(--sb-ease)', transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
      <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
    </svg>
  );
  const IconTheme = () => (
    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v1.06a7.002 7.002 0 0 1 6.94 6.02H21a1 1 0 1 1 0 2h-1.06A7.002 7.002 0 0 1 13 18.94V20a1 1 0 1 1-2 0v-1.06A7.002 7.002 0 0 1 4.06 13H3a1 1 0 1 1 0-2h1.06A7.002 7.002 0 0 1 11 5.06V4a1 1 0 0 1 1-1Z"/></svg>
  );

  return (
    <div className="fp-shell">
      <div className="fp-sb-overlay" onClick={closeMobile} />

      <aside className="fp-sidebar">
        <div className="fp-sb-head">
          <div className="fp-sb-brand">
            <img src="/assets/logo.png" alt="Fitness Pro" className="logo" />
            <div>
              <div className="brand-name">Fitness Pro</div>
              <div className="brand-role">{userLabel}</div>
            </div>
          </div>
          <div className="fp-sb-actions">
            <button className="btn icon" title={collapsed ? 'Expandir' : 'Compactar'}
              onClick={toggleCollapse} aria-label="Alternar sidebar">
              <IconChevron />
            </button>
          </div>
        </div>

        <nav className="fp-nav">
          <div className="nav-group">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="nav-item" data-active={isActive(l.href)} onClick={closeMobile}>
                <span className="nav-icon nav-emoji">{l.emoji}</span>
                <span className="nav-label">{l.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      <div className="fp-content">
        <header className="fp-header">
          <div className="fp-header-inner">
            <div className="flex items-center gap-2">
              <button className="btn icon md:hidden" aria-label="Menu" onClick={openMobile}><IconBurger/></button>
              <input className="search-input" placeholder="Pesquisar…" />
            </div>
            <div className="flex items-center gap-2">
              <button className="btn icon" aria-label="Alternar tema" title={theme === 'light' ? 'Modo escuro' : 'Modo claro'} onClick={toggleTheme}>
                <IconTheme />
              </button>
              <NotificationMenu />
              <button className="btn" onClick={() => signOut({ callbackUrl: '/login' })}>Terminar sessão</button>
            </div>
          </div>
        </header>

        <main className="fp-main">{children}</main>
      </div>
    </div>
  );
}
