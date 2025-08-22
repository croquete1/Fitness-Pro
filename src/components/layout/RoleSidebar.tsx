'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SidebarAdmin from '@/components/layout/SidebarAdmin';
import SidebarPT from '@/components/layout/SidebarPT';
import SidebarClient from '@/components/layout/SidebarClient';
import { toAppRole, type AppRole } from '@/lib/roles';

export default function RoleSidebar() {
  const pathname = usePathname() || '';
  const { data: session, status } = useSession();

  // 1) Fallback imediato pelo caminho (evita “salto” visual enquanto a sessão carrega)
  const roleFromPath: AppRole =
    pathname.startsWith('/dashboard/admin') ? 'admin'
    : pathname.startsWith('/dashboard/pt') ? 'pt'
    : 'client';

  // 2) Quando a sessão estiver disponível, usamos a role “real”
  const roleFromSession: AppRole = toAppRole((session?.user as any)?.role);

  // 3) Efetiva: sessão se autenticado; senão, fallback do path
  const role: AppRole = status === 'authenticated' ? roleFromSession : roleFromPath;

  if (role === 'admin') return <SidebarAdmin />;
  if (role === 'pt') return <SidebarPT />;
  return <SidebarClient />;
}
