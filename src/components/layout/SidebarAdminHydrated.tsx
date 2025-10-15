'use client';

import * as React from 'react';
import SidebarAdmin from '@/components/layout/SidebarAdmin';
import { useAdminCounts, type AdminCounts } from '@/lib/hooks/useCounts';

export default function SidebarAdminHydrated(props: {
  /** valores SSR para não “piscar” */
  initial: AdminCounts;
}) {
  const { approvalsCount, notificationsCount, loading } = useAdminCounts();

  // Enquanto o SWR não devolve nada, usamos o inicial do SSR
  const a = loading ? props.initial.approvalsCount : approvalsCount;
  const n = loading ? props.initial.notificationsCount : notificationsCount;

  return <SidebarAdmin approvalsCount={a} notificationsCount={n} />;
}
