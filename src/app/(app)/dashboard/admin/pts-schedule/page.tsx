import * as React from 'react';
import { Container } from '@mui/material';
import { createServerClient } from '@/lib/supabaseServer';
import AdminPtsScheduleClient from './AdminPtsScheduleClient';

export const dynamic = 'force-dynamic';

async function getInitial() {
  const sb = createServerClient();

  // trainers para autocomplete (id, name/email)
  let trainers: { id: string; name: string | null; email: string | null }[] = [];
  try {
    const r = await sb.from('users').select('id,name,email,role').eq('role', 'trainer').limit(200);
    trainers = (r.data ?? []).map((u: any) => ({ id: String(u.id), name: u.name ?? null, email: u.email ?? null }));
  } catch {}

  return { trainers };
}

export default async function Page() {
  const { trainers } = await getInitial();
  return (
    <Container maxWidth="lg" sx={{ display: 'grid', gap: 2 }}>
      <AdminPtsScheduleClient trainers={trainers} />
    </Container>
  );
}
