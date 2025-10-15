'use client';
import * as React from 'react';
import SidebarClient from './SidebarClient';
import { useClientCounts } from '@/lib/hooks/useCounts';

export default function SidebarClientWithCounts() {
  const { messagesCount, notificationsCount, loading } = useClientCounts();

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-3">
        <div className="h-10 rounded-2xl bg-black/5 animate-pulse dark:bg-white/10" />
        <div className="h-10 rounded-2xl bg-black/5 animate-pulse dark:bg-white/10" />
        <div className="h-10 rounded-2xl bg-black/5 animate-pulse dark:bg-white/10" />
      </div>
    );
  }

  return <SidebarClient messagesCount={messagesCount} notificationsCount={notificationsCount} />;
}
