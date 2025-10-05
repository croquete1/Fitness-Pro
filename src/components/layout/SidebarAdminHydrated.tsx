'use client';

import * as React from 'react';
import SidebarAdmin from '@/components/layout/SidebarAdmin';
import { useHybridAdminCounts } from '@/lib/hooks/useCounts';

export default function SidebarAdminHydrated(props: {
  initial: { approvalsCount: number; notificationsCount: number };
}) {
  const { approvalsCount, notificationsCount } = useHybridAdminCounts(props.initial);
  return (
    <SidebarAdmin
      approvalsCount={approvalsCount}
      notificationsCount={notificationsCount}
    />
  );
}
