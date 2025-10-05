'use client';

import * as React from 'react';
import SidebarAdmin from './SidebarAdmin';
import { useHybridAdminCounts } from '@/lib/hooks/useCounts';

export default function SidebarAdminWithCounts() {
  const { approvalsCount, notificationsCount } = useHybridAdminCounts({
    approvalsCount: 0,
    notificationsCount: 0,
  });

  return (
    <SidebarAdmin
      approvalsCount={approvalsCount}
      notificationsCount={notificationsCount}
    />
  );
}
