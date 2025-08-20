// src/components/layout/AppHeader.tsx
'use client';

import { Bell } from 'lucide-react';
import { signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

export default function AppHeader() {
  return (
    <div className="flex items-center gap-2">
      {/* NOTIFICAÇÕES */}
      <button
        type="button"
        className="btn icon"
        aria-label="Notificações"
        title="Notificações"
      >
        <Bell size={18} />
      </button>

      {/* TEMA (usa o componente centralizado) */}
      <ThemeToggle />

      {/* SAIR */}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="btn ghost"
        aria-label="Terminar sessão"
        title="Terminar sessão"
      >
        Terminar sessão
      </button>
    </div>
  );
}
