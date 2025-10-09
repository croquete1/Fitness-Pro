'use client';
import * as React from 'react';
import SidebarAdminWithCounts from './SidebarAdminWithCounts';
import SidebarAdminHydrated from './SidebarAdminHydrated';
import SidebarClientWithCounts from './SidebarClientWithCounts';
import SidebarClientHydrated from './SidebarClientHydrated';
import SidebarPTWithCounts from './SidebarPTWithCounts';

import type { AdminCounts, ClientCounts } from '@/lib/hooks/useCounts';

type Props = {
  role?: string | null;
  initialCounts?: { admin?: AdminCounts; client?: ClientCounts; trainer?: ClientCounts };
};

export default function RoleSidebar({ role, initialCounts }: Props) {
  const r = String(role || 'CLIENT').toUpperCase();

  if (r === 'ADMIN') {
    return initialCounts?.admin
      ? <SidebarAdminHydrated initial={initialCounts.admin} />
      : <SidebarAdminWithCounts />;
  }

  if (r === 'TRAINER' || r === 'PT') {
    return initialCounts?.trainer
      ? <SidebarPTWithCounts initial={initialCounts.trainer} />
      : <SidebarPTWithCounts />;
  }

  // CLIENT
  return initialCounts?.client
    ? <SidebarClientHydrated initial={initialCounts.client} />
    : <SidebarClientWithCounts />;
}
