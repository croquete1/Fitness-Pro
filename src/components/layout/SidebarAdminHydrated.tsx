'use client';

import * as React from 'react';
import SidebarAdmin from '@/components/layout/SidebarAdmin';
import { useAdminCounts, type AdminCounts } from '@/lib/hooks/useCounts';
import { Skeleton } from '@mui/material';

export default function SidebarAdminHydrated(props: {
  /** valores SSR para não “piscar” */
  initial: AdminCounts;
}) {
  const { approvalsCount, notificationsCount, loading } = useAdminCounts();

  // Enquanto o SWR não devolve nada, usamos o inicial do SSR
  const a = loading ? props.initial.approvalsCount : approvalsCount;
  const n = loading ? props.initial.notificationsCount : notificationsCount;

  // Placeholder ultra-leve caso queiras segurar layout durante 1º paint
  // (opcional — pode remover se preferires)
  if (loading && !props.initial) {
    return <Skeleton variant="rounded" width={240} height={360} sx={{ mx: 1, my: 2 }} />;
  }

  return <SidebarAdmin approvalsCount={a} notificationsCount={n} />;
}
