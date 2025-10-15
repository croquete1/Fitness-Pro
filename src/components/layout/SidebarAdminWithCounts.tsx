'use client';
import * as React from 'react';
import SidebarAdmin from './SidebarAdmin';
import { useAdminCounts } from '@/lib/hooks/useCounts';

export default function SidebarAdminWithCounts() {
  const { approvalsCount, notificationsCount, loading } = useAdminCounts();

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-3">
        <div className="h-10 rounded-2xl bg-black/5 animate-pulse dark:bg-white/10" />
        <div className="h-10 rounded-2xl bg-black/5 animate-pulse dark:bg-white/10" />
        <div className="h-10 rounded-2xl bg-black/5 animate-pulse dark:bg-white/10" />
      </div>
    );
  }

  return <SidebarAdmin approvalsCount={approvalsCount} notificationsCount={notificationsCount} />;
}
