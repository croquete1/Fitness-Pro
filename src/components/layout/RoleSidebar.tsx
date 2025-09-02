// src/components/layout/RoleSidebar.tsx
'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import SidebarAdmin from './SidebarAdmin';
import SidebarPT from './SidebarPT';
import SidebarClient from './SidebarClient';

import type { AppRole } from '@/lib/roles';

/** Normaliza qualquer valor para um AppRole válido do teu tipo. */
function normalizeToAppRole(r: unknown): AppRole | null {
  if (!r) return null;
  const s = String(r).toUpperCase();
  if (s === 'ADMIN') return 'ADMIN';
  if (s === 'PT' || s === 'TRAINER') return 'TRAINER';
  if (s === 'CLIENT' || s === 'USER') return 'CLIENT';
  return null;
}

/** Fallback imediato pelo pathname enquanto a sessão carrega. */
function roleFromPathname(pathname: string): AppRole {
  if (pathname.startsWith('/dashboard/admin')) return 'ADMIN';
  if (pathname.startsWith('/dashboard/pt')) return 'TRAINER';
  return 'CLIENT';
}

export default function RoleSidebar() {
  const pathname = usePathname();
  const { data } = useSession();

  const fallbackRole = useMemo<AppRole>(() => roleFromPathname(pathname), [pathname]);

  // Preferimos o role real quando a sessão existir; caso contrário usamos o fallback pelo caminho
  const effectiveRole = useMemo<AppRole>(() => {
    return normalizeToAppRole((data?.user as any)?.role) ?? fallbackRole;
  }, [data?.user, fallbackRole]);

  switch (effectiveRole) {
    case 'ADMIN':
      return <SidebarAdmin />;
    case 'TRAINER':
      return <SidebarPT />;
    default:
      return <SidebarClient />;
  }
}