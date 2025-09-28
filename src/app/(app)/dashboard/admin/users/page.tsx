import { createServerClient } from '@/lib/supabaseServer';
import UsersGrid, { type Row, type Role } from './users.client';

export const dynamic = 'force-dynamic';

function asRole(x: unknown): Role {
  const v = String(x ?? '').toUpperCase();
  return (v === 'ADMIN' || v === 'TRAINER' || v === 'CLIENT') ? (v as Role) : 'CLIENT';
}

export default async function AdminUsersPage() {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('users')
    .select('id, name, email, role, approved, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) console.warn('[admin/users] fetch error:', error);

  const rows: Row[] = (data ?? []).map((u: any): Row => ({
    id: String(u.id),
    name: u.name ?? null,
    email: u.email ?? null,
    role: asRole(u.role),
    approved: !!u.approved,
    active: (u.is_active ?? true) as boolean,
    created_at: u.created_at ?? null,
  }));

  // ✅ UsersGrid espera "initial"
  return <UsersGrid initial={rows} />;
}
