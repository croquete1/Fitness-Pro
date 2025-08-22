// src/components/layout/RoleSidebar.tsx
'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import SidebarAdmin from '@/components/layout/SidebarAdmin';
import SidebarPT from '@/components/layout/SidebarPT';
import SidebarClient from '@/components/layout/SidebarClient';
import { toAppRole, type AppRole } from '@/lib/roles';

function roleFromPath(pathname: string): AppRole {
  if (pathname.startsWith('/dashboard/admin')) return 'admin';
  if (pathname.startsWith('/dashboard/pt')) return 'pt';
  return 'client';
}

export default function RoleSidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const role: AppRole = useMemo(() => {
    // Enquanto a sessão carrega, garantimos menu coerente com a rota atual
    if (status === 'loading') return roleFromPath(pathname);
    // Depois, normalizamos o role vindo da sessão (aceita ADMIN/TRAINER/CLIENT)
    const sessRole = (session?.user as any)?.role;
    const normalized = toAppRole(sessRole);
    return normalized ?? roleFromPath(pathname);
  }, [status, pathname, session?.user]);

  switch (role) {
    case 'admin':
      return <SidebarAdmin />;
    case 'pt':
      return <SidebarPT />;
    default:
      return <SidebarClient />;
  }
}
