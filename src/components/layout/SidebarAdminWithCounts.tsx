'use client';
import * as React from 'react';
import SidebarAdmin from './SidebarAdmin';
import { useAdminCounts } from '@/lib/hooks/useCounts';
import { Skeleton } from '@mui/material';

export default function SidebarAdminWithCounts() {
  const { approvalsCount, notificationsCount, loading } = useAdminCounts();

  if (loading) {
    return (
      <div style={{ padding: 12 }}>
        <Skeleton variant="rounded" height={36} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={36} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={36} />
      </div>
    );
  }

  return <SidebarAdmin approvalsCount={approvalsCount} notificationsCount={notificationsCount} />;
}
