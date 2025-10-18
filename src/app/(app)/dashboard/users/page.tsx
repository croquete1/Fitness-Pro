export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import UsersClient from './UsersClient';
import { getAdminUsersDashboardFallback } from '@/lib/fallback/users';
import { buildAdminUsersDashboard } from '@/lib/users/dashboard';
import type { AdminUserRecord } from '@/lib/users/types';

export default async function UsersAdminPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = tryCreateServerClient();
  if (!sb) {
    const fallback = getAdminUsersDashboardFallback();
    return <UsersClient initialData={fallback} viewerName={session.user.email ?? null} />;
  }

  const { data, error } = await sb
    .from('users')
    .select('id,name,email,role,status,approved,active,created_at,last_login_at,last_seen_at,online')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('[admin-users-page] erro ao listar utilizadores', error);
    const fallback = getAdminUsersDashboardFallback();
    return <UsersClient initialData={fallback} viewerName={session.user.email ?? null} />;
  }

  const records: AdminUserRecord[] = (data ?? []).map((row: any) => ({
    id: String(row.id ?? crypto.randomUUID()),
    name: row.name ?? null,
    email: row.email ?? null,
    role: row.role ?? null,
    status: row.status ?? null,
    approved: row.approved ?? null,
    active: row.active ?? null,
    createdAt: row.created_at ?? null,
    lastLoginAt: row.last_login_at ?? row.last_sign_in_at ?? null,
    lastSeenAt: row.last_seen_at ?? null,
    online: row.online ?? row.is_online ?? null,
  }));

  const dashboard = buildAdminUsersDashboard(records, { supabase: true });

  return <UsersClient initialData={dashboard} viewerName={session.user.email ?? null} />;
}
