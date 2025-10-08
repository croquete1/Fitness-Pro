'use client';
import * as React from 'react';
import SidebarClient from './SidebarClient';
import { useClientCounts } from '@/lib/hooks/useCounts';
import { Skeleton } from '@mui/material';

export default function SidebarClientWithCounts() {
  const { messagesCount, notificationsCount, loading } = useClientCounts();

  if (loading) {
    return (
      <div style={{ padding: 12 }}>
        <Skeleton variant="rounded" height={36} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={36} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={36} />
      </div>
    );
  }

  return <SidebarClient messagesCount={messagesCount} notificationsCount={notificationsCount} />;
}
