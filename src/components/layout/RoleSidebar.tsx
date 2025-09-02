'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import SidebarAdmin from './SidebarAdmin';
import SidebarPT from './SidebarPT';
import SidebarClient from './SidebarClient';

import { toAppRole } from '@/lib/roles';
import type { AppRole } from '@/lib/roles';

/** Converte o pathname para um AppRole válido (em MAIÚSCULAS). */
function roleFromPathname(pathname: string): AppRole {
  if (pathname.startsWith('/dashboard/admin')) return 'ADMIN';
  if (pathname.startsWith('/dashboard/pt')) return 'PT';
  return 'CLIENT';
}

export default function RoleSidebar() {
  const pathname = usePathname();
  const { data } = useSession();

  // Fallback imediato pelo caminho (evita "salto" visual antes de a sessão carregar)
  const fallbackRole = useMemo<AppRole>(() => roleFromPathname(pathname), [pathname]);

  // Quando a sessão existir, preferimos o role real do utilizador
  const effectiveRole = useMemo<AppRole>(() => {
    const sessionRole = toAppRole((data?.user as any)?.role);
    return sessionRole ?? fallbackRole;
  }, [data?.user, fallbackRole]);

  switch (effectiveRole) {
    case 'ADMIN':
      return <SidebarAdmin />;
    case 'PT':
      return <SidebarPT />;
    default:
      return <SidebarClient />;
  }
}