import * as React from 'react';
import { notFound } from 'next/navigation';
import { Container } from '@mui/material';
import { createServerClient } from '@/lib/supabaseServer';
import UserFormClient, { type Role, type Status } from '../UserFormClient';

export const dynamic = 'force-dynamic';

function asRole(v: any): Role {
  const s = String(v ?? '').toLowerCase();
  if (s === 'admin' || s === 'trainer' || s === 'client') return s as Role;
  return 'client';
}
function asStatus(v: any): Status {
  const s = String(v ?? '').toLowerCase();
  if (s === 'active' || s === 'inactive') return s as Status;
  return 'active';
}

function mapRow(r: any) {
  return {
    id: String(r.id),
    name: r.name ?? r.full_name ?? '',
    email: r.email ?? r.mail ?? '',
    role: asRole(r.role ?? r.user_role),
    status: asStatus(r.status ?? r.state),
    approved: Boolean(r.approved ?? r.is_approved ?? true),
    active: Boolean(r.active ?? r.is_active ?? true),
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const sb = createServerClient();

  // tenta em users; se falhar, tenta em profiles
  let data: any | null = null;
  const a = await sb.from('users').select('*').eq('id', params.id).maybeSingle();
  if (a?.data) data = a.data;
  else {
    const b = await sb.from('profiles').select('*').eq('id', params.id).maybeSingle();
    if (b?.data) data = b.data;
  }
  if (!data) return notFound();

  return (
    <Container maxWidth="sm" sx={{ display: 'grid', gap: 2 }}>
      <UserFormClient mode="edit" initial={mapRow(data)} />
    </Container>
  );
}
