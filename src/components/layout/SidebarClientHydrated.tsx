'use client';

import * as React from 'react';
import SidebarClient from '@/components/layout/SidebarClient';
import { useHybridClientCounts } from '@/lib/hooks/useCounts';

export default function SidebarClientHydrated(props: {
  initial: { messagesCount: number; notificationsCount: number };
}) {
  const { messagesCount, notificationsCount } = useHybridClientCounts(props.initial);
  return (
    <SidebarClient
      messagesCount={messagesCount}
      notificationsCount={notificationsCount}
    />
  );
}
