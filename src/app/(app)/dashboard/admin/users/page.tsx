// src/app/(app)/dashboard/admin/users/page.tsx
import * as React from 'react';
import { createServerClient } from '@/lib/supabaseServer';
import UsersGrid from './users.client';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const sb = createServerClient();

  const { data, error } = await sb
    .from('users')
    .select('id, name, email, role, approved, active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    // fallback simples (podes trocar por erro amigável na UI)
    return <div style={{ padding: 16 }}>Falha a carregar utilizadores: {error.message}</div>;
  }

  const rows = (data ?? []).map((u: any) => ({
    id: String(u.id),
    name: u.name ?? null,
    email: u.email ?? null,
    role: (u.role ?? 'CLIENT').toUpperCase(),
    approved: !!u.approved,
    active: !!u.active,
    created_at: u.created_at ?? null,
  }));

  return <UsersGrid initial={rows} />;
}
