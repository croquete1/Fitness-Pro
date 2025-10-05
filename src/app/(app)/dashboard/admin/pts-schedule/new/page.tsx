import * as React from 'react';
import { Container } from '@mui/material';
import SessionFormClient from '@/app/(app)/dashboard/admin/pts-schedule/SessionFormClient';

export const dynamic = 'force-dynamic';

function toIso(v?: string | null) {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

export default function Page({
  searchParams,
}: {
  searchParams?: { trainer?: string; client?: string; from?: string; to?: string; location?: string };
}) {
  const initial = {
    trainer_id: searchParams?.trainer ?? '',
    client_id: searchParams?.client ?? '',
    start_time: toIso(searchParams?.from) || new Date().toISOString(),
    end_time:
      toIso(searchParams?.to) ||
      new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: 'scheduled' as const,
    location: searchParams?.location ?? '',
    notes: '',
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'grid', gap: 2 }}>
      <SessionFormClient mode="create" initial={initial} />
    </Container>
  );
}
