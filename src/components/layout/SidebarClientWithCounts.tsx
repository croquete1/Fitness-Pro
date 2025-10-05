'use client';

import * as React from 'react';
import SidebarClient from './SidebarClient';
import { useHybridClientCounts } from '@/lib/hooks/useCounts';

export default function SidebarClientWithCounts() {
  // valores iniciais seguros; se quiseres, podes recebê-los por props via SSR
  const { messagesCount, notificationsCount } = useHybridClientCounts({
    messagesCount: 0,
    notificationsCount: 0,
  });

  return (
    <SidebarClient
      messagesCount={messagesCount}
      notificationsCount={notificationsCount}
    />
  );
}
