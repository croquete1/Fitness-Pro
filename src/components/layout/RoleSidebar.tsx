'use client';

import * as React from 'react';
import SidebarAdmin from './SidebarAdmin';
import SidebarClient from './SidebarClient';
import SidebarPT from './SidebarPT';
import type { AdminCounts, ClientCounts } from '@/lib/hooks/useCounts';
import type { NavigationSummary } from '@/lib/navigation/types';

type Props = {
  role?: string | null;
  initialCounts?: { admin?: AdminCounts; client?: ClientCounts; trainer?: ClientCounts };
  navigationSummary?: NavigationSummary | null;
  navigationLoading?: boolean;
  onRefreshNavigation?: () => Promise<unknown> | unknown;
};

export default function RoleSidebar({
  role,
  initialCounts,
  navigationSummary,
  navigationLoading,
  onRefreshNavigation,
}: Props) {
  const resolvedRole = React.useMemo(
    () => String(role || 'CLIENT').toUpperCase(),
    [role],
  );

  if (resolvedRole === 'ADMIN') {
    return (
      <SidebarAdmin
        initialCounts={initialCounts?.admin}
        summary={navigationSummary}
        loading={navigationLoading}
        onRefreshNavigation={onRefreshNavigation}
      />
    );
  }

  if (resolvedRole === 'TRAINER' || resolvedRole === 'PT') {
    return (
      <SidebarPT
        initialCounts={initialCounts?.trainer}
        summary={navigationSummary}
        loading={navigationLoading}
        onRefreshNavigation={onRefreshNavigation}
      />
    );
  }

  return (
    <SidebarClient
      initialCounts={initialCounts?.client}
      summary={navigationSummary}
      loading={navigationLoading}
      onRefreshNavigation={onRefreshNavigation}
    />
  );
}
