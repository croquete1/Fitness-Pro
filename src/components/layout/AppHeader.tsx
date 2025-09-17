// src/components/layout/AppHeader.tsx
'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useSidebar } from '@/components/layout/SidebarProvider';

function greetingByHour(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Bom dia';
  if (h < 19) return 'Boa tarde';
  return 'Boa noite';
}

export default function AppHeader() {
  const { data: session } = useSession();
  const name = session?.user?.name || session?.user?.email || 'Utilizador';
  const role = (session?.user as any)?.role ? String((session!.user as any).role).toUpperCase() : 'CLIENTE';

  const { toggleCollapsed, openMobile } = useHeaderSidebarBridge();

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="h-14 grid grid-cols-[auto_1fr_auto] items-center gap-2 px-3">
        {/* Botões menu */}
        <div className="flex items-center gap-2">
          <button
            className="inline-flex lg:hidden rounded-md border border-slate-300 dark:border-slate-700 px-2.5 py-1.5"
            onClick={openMobile}
            aria-label="Abrir menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2"/></svg>
          </button>

          <button
            className="hidden lg:inline-flex rounded-md border border-slate-300 dark:border-slate-700 px-2.5 py-1.5"
            onClick={toggleCollapsed}
            aria-label="Alternar largura do menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M7 6h10v2H7V6m0 5h10v2H7v-2m0 5h10v2H7v-2"/></svg>
          </button>
        </div>

        {/* Pesquisa */}
        <div className="px-2">
          <label className="relative block">
            <span className="sr-only">Pesquisar</span>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2A4.5 4.5 0 0 0 5 9.5A4.5 4.5 0 0 0 9.5 14A4.5 4.5 0 0 0 14 9.5A4.5 4.5 0 0 0 9.5 5"/></svg>
            </span>
            <input
              type="search"
              placeholder="Pesquisar…"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </div>

        {/* Greeting + ações */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end leading-tight mr-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {greetingByHour()}, {name}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {role}
            </span>
          </div>

          <button
            className="rounded-md border border-slate-300 dark:border-slate-700 px-2.5 py-1.5"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Terminar sessão
          </button>
        </div>
      </div>
    </header>
  );
}

function useHeaderSidebarBridge() {
  // Separado para manter o AppHeader conciso
  const { toggleCollapsed, openMobile } = useSidebar();
  return { toggleCollapsed, openMobile };
}
