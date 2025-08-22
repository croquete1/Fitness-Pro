'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SidebarAdmin from '@/components/layout/SidebarAdmin';
import SidebarPT from '@/components/layout/SidebarPT';
import SidebarClient from '@/components/layout/SidebarClient';

type RoleKey = 'admin' | 'pt' | 'client';

function normalizeRole(input?: string | null): RoleKey {
  if (!input) return 'client';
  const v = input.toUpperCase();
  if (v === 'ADMIN') return 'admin';
  if (v === 'TRAINER' || v === 'PT') return 'pt';
  return 'client';
}

export default function RoleSidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const roleFromPath: RoleKey =
    pathname.startsWith('/dashboard/admin')
      ? 'admin'
      : pathname.startsWith('/dashboard/pt')
      ? 'pt'
      : 'client';

  const role: RoleKey =
    status === 'loading' ? roleFromPath : normalizeRole((session?.user as any)?.role);

  if (role === 'admin') return <SidebarAdmin />;
  if (role === 'pt') return <SidebarPT />;
  return <SidebarClient />;
}
