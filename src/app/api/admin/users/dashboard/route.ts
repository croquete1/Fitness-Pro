import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { getAdminUsersDashboardFallback } from '@/lib/fallback/users';
import { buildAdminUsersDashboard } from '@/lib/users/dashboard';
import type { AdminUserRecord } from '@/lib/users/types';

export async function GET() {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = tryCreateServerClient();
  if (!sb) {
    const fallback = getAdminUsersDashboardFallback();
    return NextResponse.json({ ok: true, source: 'fallback' as const, ...fallback });
  }

  const { data, error } = await sb
    .from('users')
    .select(
      'id,name,email,role,status,approved,active:is_active,created_at,last_login_at,last_seen_at,online',
    )
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('[admin-users-dashboard] falha ao carregar utilizadores', error);
    const fallback = getAdminUsersDashboardFallback();
    return NextResponse.json({ ok: true, source: 'fallback' as const, ...fallback });
  }

  const records: AdminUserRecord[] = (data ?? []).map((row: any) => ({
    id: String(row.id ?? crypto.randomUUID()),
    name: row.name ?? null,
    email: row.email ?? null,
    role: row.role ?? null,
    status: row.status ?? null,
    approved: typeof row.approved === 'boolean' ? row.approved : row.approved ?? null,
    active:
      typeof row.active === 'boolean'
        ? row.active
        : typeof row.is_active === 'boolean'
          ? row.is_active
          : row.active ?? row.is_active ?? null,
    createdAt: row.created_at ?? null,
    lastLoginAt: row.last_login_at ?? row.last_sign_in_at ?? null,
    lastSeenAt: row.last_seen_at ?? null,
    online: typeof row.online === 'boolean' ? row.online : row.is_online ?? null,
  }));

  const dashboard = buildAdminUsersDashboard(records, { supabase: true });

  return NextResponse.json({ ok: true, source: 'supabase' as const, ...dashboard });
}
