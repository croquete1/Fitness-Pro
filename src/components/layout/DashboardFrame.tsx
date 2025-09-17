// src/components/layout/DashboardFrame.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
  const isActive = (href: string) => path === href || path?.startsWith(href + '/');

  const [pinned, setPinned] = useState<boolean>(() => (typeof window === 'undefined') ? true : (localStorage.getItem('sbPinned') ?? '1') === '1');
  const [collapsed, setCollapsed] = useState<boolean>(() => (typeof window === 'undefined') ? false : (localStorage.getItem('sbCollapsed') ?? '0') === '1');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-sb-pinned', pinned ? '1' : '0');
    if (collapsed) html.setAttribute('data-sb-collapsed', '1'); else html.removeAttribute('data-sb-collapsed');
    if (mobileOpen) html.setAttribute('data-sb-mobile-open', '1'); else html.removeAttribute('data-sb-mobile-open');
    localStorage.setItem('sbPinned', pinned ? '1' : '0');
    localStorage.setItem('sbCollapsed', collapsed ? '1' : '0');
  }, [pinned, collapsed, mobileOpen]);

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

  const IconBurger = () => (<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2"/></svg>);
  const IconChevron = () => collapsed
    ? (<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M9.29 6.71L13.58 11l-4.29 4.29L10 17l6-6l-6-6z"/></svg>)
    : (<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M14.71 17.29L10.41 13l4.3-4.29L13 7l-6 6l6 6z"/></svg>);
  const IconPin = () => (<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M16 12V4l1-1V2H7v1l1 1v8l-3 3v1h7.06V22l.94.94L14.94 22v-6H21v-1z"/></svg>);

  return (
    <div className="fp-shell">
      <div className="fp-sb-overlay" onClick={() => setMobileOpen(false)} />
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
            <button className={`btn icon btn-pin ${pinned ? 'is-pinned' : ''}`} title={pinned ? 'Desafixar' : 'Afixar'} onClick={() => setPinned(v => !v)}><IconPin/></button>
            <button className="btn icon" title={collapsed ? 'Expandir' : 'Compactar'} onClick={() => setCollapsed(v => !v)}><IconChevron/></button>
          </div>
        </div>
        <nav className="fp-nav">
          <div className="nav-group">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="nav-item" data-active={isActive(l.href)} onClick={() => setMobileOpen(false)}>
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
              <button className="btn icon md:hidden" aria-label="Menu" onClick={() => setMobileOpen(true)}><IconBurger/></button>
              <div className="hidden md:flex items-center gap-2">
                <button className="btn icon" title={collapsed ? 'Expandir sidebar' : 'Compactar sidebar'} onClick={() => setCollapsed(v => !v)}><IconChevron/></button>
                <button className={`btn icon btn-pin ${pinned ? 'is-pinned' : ''}`} title={pinned ? 'Desafixar sidebar' : 'Afixar sidebar'} onClick={() => setPinned(v => !v)}><IconPin/></button>
              </div>
              <input className="search-input" placeholder="Pesquisar…" />
            </div>
            <div className="flex items-center gap-2">
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
