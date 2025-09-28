// src/app/(app)/dashboard/admin/users/page.tsx
import { createServerClient } from '@/lib/supabaseServer';
import UsersGrid, { type Row, type Role } from './users.client';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('users')
    .select('id, name, email, role, approved, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    // fallback vazio — podes trocar por erro UI
    return <UsersGrid initial={[]} />;
  }

  const rows: Row[] = (data ?? []).map((u: any) => ({
    id: String(u.id),
    name: u.name ?? null,
    email: u.email,
    role: (u.role ?? 'CLIENT') as Role,
    approved: Boolean(u.approved),
    active: Boolean(u.is_active ?? u.active ?? true),
    created_at: u.created_at ?? null,
  }));

  return <UsersGrid initial={rows} />;
}
