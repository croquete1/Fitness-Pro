'use client';

import React from 'react';
import {useSidebar} from './SidebarCtx';
import NotificationMenu from '@/components/notifications/NotificationMenu';
import { signOut } from 'next-auth/react';

export default function AppHeader() {
  const { openMobile, toggleCollapse, toggleTheme, theme } = useSidebar();

  const IconBurger = () => (
    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2"/></svg>
  );

  return (
    <header className="fp-header">
      <div className="fp-header-inner">
        <div className="flex items-center gap-2">
          <button className="btn icon md:hidden" aria-label="Menu" onClick={openMobile}><IconBurger/></button>
          <button className="btn icon hidden md:inline-flex" onClick={toggleCollapse} title="Expandir/compactar sidebar">↔</button>
          <input className="search-input" placeholder="Pesquisar…" />
        </div>

        <div className="flex items-center gap-2">
          <button className="btn" onClick={toggleTheme} title="Tema">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <NotificationMenu />
          <button className="btn" onClick={() => signOut({ callbackUrl: '/login' })}>Terminar sessão</button>
        </div>
      </div>
    </header>
  );
}
