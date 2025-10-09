'use client';
import * as React from 'react';
import SidebarAdminWithCounts from './SidebarAdminWithCounts';
import SidebarAdminHydrated from './SidebarAdminHydrated';
import SidebarClientWithCounts from './SidebarClientWithCounts';
import SidebarClientHydrated from './SidebarClientHydrated';
import SidebarPT from './SidebarPT';

import type { Role } from '@/components/header/HeaderCountsContext';
import type { DashboardCountsSnapshot } from '@/types/dashboard-counts';

type Props = {
  role?: Role | string | null;
  initialCounts?: DashboardCountsSnapshot;
};

function normalizeRole(role?: Role | string | null): Role {
  const value = String(role ?? 'CLIENT').toUpperCase();
  if (value === 'ADMIN' || value === 'TRAINER' || value === 'CLIENT') {
    return value;
  }
  return 'CLIENT';
}

export default function RoleSidebar({ role, initialCounts }: Props) {
  const normalized = normalizeRole(role);

  if (normalized === 'ADMIN') {
    return initialCounts?.admin
      ? <SidebarAdminHydrated initial={initialCounts.admin} />
      : <SidebarAdminWithCounts />;
  }

  if (normalized === 'TRAINER') {
    return <SidebarPT />;
  }

  // CLIENT
  return initialCounts?.client
    ? <SidebarClientHydrated initial={initialCounts.client} />
    : <SidebarClientWithCounts />;
}
