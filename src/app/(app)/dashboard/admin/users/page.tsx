import { createServerClient } from '@/lib/supabaseServer';
import UsersGrid, { type Row } from './users.client';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({ searchParams }: { searchParams?: { q?: string } }) {
  const sb = createServerClient();
  const q = (searchParams?.q ?? '').trim();

  let rows: Row[] = [];
  try {
    const query = sb.from('users' as any)
      .select('id, email, name, role, approved, is_active, created_at')
      .order('created_at', { ascending: false });

    if (q) {
      // pesquisa simples por nome/email
      query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data, error } = await query;

    if (!error && Array.isArray(data)) {
      rows = data.map((u: any) => ({
        id: String(u.id),
        email: u.email ?? '',
        name: u.name ?? '',
        role: String(u.role ?? 'CLIENT').toUpperCase(),
        approved: u.approved ?? null,
        active: Boolean(u.is_active ?? true),
        created_at: u.created_at ?? null,
      }));
    }
  } catch {}

  return <UsersGrid rows={rows} initialQuickFilter={q} />;
}
