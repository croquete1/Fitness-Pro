import * as React from 'react';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { Container } from '@mui/material';
import SessionFormClient from '../SessionFormClient';

export const dynamic = 'force-dynamic';

function mapRow(r: any) {
  const start_time = r.start_time ?? r.start ?? r.starts_at ?? r.begin_at ?? r.begin ?? null;
  const end_time = r.end_time ?? r.end ?? r.ends_at ?? r.finish_at ?? r.finish ?? null;
  const trainer_id = r.trainer_id ?? r.pt_id ?? null;
  const client_id = r.client_id ?? r.member_id ?? null;

  return {
    id: String(r.id),
    trainer_id: trainer_id ? String(trainer_id) : '',
    client_id: client_id ? String(client_id) : '',
    start_time: start_time ? String(start_time) : '',
    end_time: end_time ? String(end_time) : '',
    status: r.status ?? r.state ?? 'scheduled',
    location: r.location ?? r.place ?? '',
    notes: r.notes ?? r.note ?? '',
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServerClient();

  let row: any | null = null;
  const a = await sb.from('pt_sessions').select('*').eq('id', id).maybeSingle();
  if (a.data) row = a.data;
  else {
    const b = await sb.from('sessions').select('*').eq('id', id).maybeSingle();
    if (b.data) row = b.data;
  }
  if (!row) return notFound();

  return (
    <Container maxWidth="md" sx={{ display: 'grid', gap: 2 }}>
      <SessionFormClient mode="edit" initial={mapRow(row)} />
    </Container>
  );
}
