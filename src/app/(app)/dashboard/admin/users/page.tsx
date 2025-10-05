import * as React from 'react';
import { createServerClient } from '@/lib/supabaseServer';
import UsersGrid, { type Row, type Role, type Status } from './users.client';

export const dynamic = 'force-dynamic';

function normalizeRole(v: any): Role {
  const s = String(v ?? '').trim().toUpperCase();
  if (s === 'ADMIN') return 'ADMIN';
  if (s === 'PT' || s === 'TRAINER' || s === 'COACH') return 'PT';
  return 'CLIENT';
}

function normalizeStatus(v: any, approved?: any, active?: any): Status {
  const s = String(v ?? '').trim().toUpperCase();
  if (s === 'ACTIVE' || s === 'PENDING' || s === 'SUSPENDED') return s as Status;
  // Derivação a partir dos flags, se status não existir
  const isApproved = Boolean(approved ?? false);
  const isActive = Boolean(active ?? true);
  if (!isApproved) return 'PENDING';
  return isActive ? 'ACTIVE' : 'SUSPENDED';
}

export default async function AdminUsersPage() {
  const sb = createServerClient();
  const pageSize = 20;

  const { data, count, error } = await sb
    .from('users')
    .select('id, name, email, role, status, approved, active, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(pageSize);

  if (error) {
    return <div style={{ padding: 16 }}>Falha a carregar utilizadores: {error.message}</div>;
  }

  const rows: Row[] = (data ?? []).map((u: any) => ({
    id: String(u.id),
    name: u.name ?? null,
    email: u.email ?? null,
    role: normalizeRole(u.role),
    status: normalizeStatus(u.status, u.approved, u.active),
    approved: Boolean(u.approved ?? false),
    active: Boolean(u.active ?? true),
    created_at: u.created_at ?? null,
  }));

  return <UsersGrid initial={rows} total={count ?? rows.length} pageSize={pageSize} />;
}
