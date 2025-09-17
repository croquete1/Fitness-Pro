'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import NotificationMenu from '@/components/notifications/NotificationMenu';
import RoleSidebar from '@/components/layout/RoleSidebar';
import { useSidebar } from '@/components/layout/SidebarCtx';

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

  const IconBurger = () => (
    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2"/></svg>
  );
  const IconChevron = () => collapsed
    ? (<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M9.29 6.71L13.58 11l-4.29 4.29L10 17l6-6l-6-6z"/></svg>)
    : (<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M14.71 17.29L10.41 13l4.3-4.29L13 7l-6 6l6 6z"/></svg>);
  const IconSun = () => (<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6.76 4.84l-1.8-1.79l-1.41 1.41l1.79 1.8l1.42-1.42M1 13h3v-2H1v2m10 10h2v-3h-2v3m9-10v-2h-3v2h3m-2.05 7.36l1.41-1.41l-1.79-1.8l-1.41 1.42l1.79 1.79M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m6.24-2.16l1.79-1.8l-1.41-1.41l-1.8 1.79l1.42 1.42M4.22 17.66l1.8-1.79l-1.42-1.42l-1.79 1.8l1.41 1.41Z"/></svg>);
  const IconMoon = () => (<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a9.931 9.931 0 0 0-7.071 2.929A9.931 9.931 0 0 0 2 12c0 2.652 1.03 5.147 2.929 7.071A9.931 9.931 0 0 0 12 22a10 10 0 0 0 9.446-6.684a.75.75 0 0 0-1.04-.93A7.5 7.5 0 0 1 9.614 5.594a7.48 7.48 0 0 1 4.93-2.291a.75.75 0 0 0 .659-.99A10 10 0 0 0 12 2Z"/></svg>);

  return (
    <div className="fp-shell">
      {/* Sidebar (com brand + nav). Toggle só no header */}
      <RoleSidebar role={role} onNavigate={closeMobile} />

      <div className="fp-content">
        <header className="fp-header">
          <div className="fp-header-inner">
            <div className="flex items-center gap-2">
              <button className="btn icon md:hidden" aria-label="Menu" onClick={openMobile}><IconBurger/></button>

              {/* ÚNICO TOGGLE da sidebar */}
              <button
                className="btn icon"
                title={collapsed ? 'Expandir sidebar' : 'Compactar sidebar'}
                onClick={toggleCollapse}
                aria-pressed={collapsed}
                data-role="sb-toggle"
              >
                <IconChevron/>
              </button>

              {/* Saudação (sem role) */}
              <div className="text-sm text-muted">Bom dia,</div>
              <div className="font-semibold">{userLabel}</div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button className="btn icon" onClick={toggleTheme} title="Tema">
                {theme === 'dark' ? <IconSun/> : <IconMoon/>}
              </button>

              <NotificationMenu />

              <button className="btn" onClick={() => signOut({ callbackUrl: '/login' })}>
                Terminar sessão
              </button>
            </div>
          </div>
        </header>

        <main className="fp-main">{children}</main>
      </div>
    </div>
  );
}
