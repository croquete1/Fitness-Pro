'use client';

import * as React from 'react';
import SidebarClient from '@/components/layout/SidebarClient';
import { useClientCounts, type ClientCounts } from '@/lib/hooks/useCounts';
import { Skeleton } from '@mui/material';

export default function SidebarClientHydrated(props: {
  initial: ClientCounts;
}) {
  const { messagesCount, notificationsCount, loading } = useClientCounts();

  const m = loading ? props.initial.messagesCount : messagesCount;
  const n = loading ? props.initial.notificationsCount : notificationsCount;

  // opcional: skeleton só se não existir inicial (aqui temos sempre)
  return <SidebarClient messagesCount={m} notificationsCount={n} />;
}
