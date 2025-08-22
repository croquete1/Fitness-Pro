// src/components/layout/RoleSidebar.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SidebarAdmin from '@/components/layout/SidebarAdmin';
import SidebarPT from '@/components/layout/SidebarPT';
import SidebarClient from '@/components/layout/SidebarClient';

type RoleKey = 'admin' | 'pt' | 'client';

function toAppRole(input?: unknown): RoleKey {
  if (typeof input !== 'string') return 'client';
  const v = input.toUpperCase();
  if (v === 'ADMIN') return 'admin';
  if (v === 'TRAINER' || v === 'PT') return 'pt';
  if (v === 'CLIENT') return 'client';
  // também aceitar os slugs já normalizados
  if (input === 'admin' || input === 'pt' || input === 'client') return input;
  return 'client';
}

export default function RoleSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // papel “forçado” pelo path – útil enquanto a sessão carrega
  const roleFromPath: RoleKey =
    pathname.startsWith('/dashboard/admin') ? 'admin' :
    pathname.startsWith('/dashboard/pt')    ? 'pt'    :
    pathname.startsWith('/dashboard/client')? 'client': 'client';

  const role: RoleKey = status === 'loading' ? roleFromPath : toAppRole((session?.user as any)?.role);

  if (role === 'admin') return <SidebarAdmin />;
  if (role === 'pt') return <SidebarPT />;
  return <SidebarClient />;
}
