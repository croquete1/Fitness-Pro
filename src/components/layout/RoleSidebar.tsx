'use client';
import * as React from 'react';
import SidebarAdminWithCounts from './SidebarAdminWithCounts';
import SidebarAdminHydrated from './SidebarAdminHydrated';
import SidebarClientWithCounts from './SidebarClientWithCounts';
import SidebarClientHydrated from './SidebarClientHydrated';
import SidebarClient from './SidebarClient'; // fallback p/ TRAINER/PT enquanto não existir SidebarPT

import type { AdminCounts, ClientCounts } from '@/lib/hooks/useCounts';

type Props = {
  role?: string | null;
  initialCounts?: { admin?: AdminCounts; client?: ClientCounts };
};

export default function RoleSidebar({ role, initialCounts }: Props) {
  const r = String(role || 'CLIENT').toUpperCase();

  if (r === 'ADMIN') {
    return initialCounts?.admin
      ? <SidebarAdminHydrated initial={initialCounts.admin} />
      : <SidebarAdminWithCounts />;
  }

  if (r === 'TRAINER' || r === 'PT') {
    // TODO: quando adicionares SidebarPT, troca aqui:
    return <SidebarClientWithCounts />;
  }

  // CLIENT
  return initialCounts?.client
    ? <SidebarClientHydrated initial={initialCounts.client} />
    : <SidebarClientWithCounts />;
}
