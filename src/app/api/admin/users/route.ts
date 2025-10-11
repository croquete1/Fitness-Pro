import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES, AUDIT_TABLE_CANDIDATES, isMissingAuditTableError } from '@/lib/audit';
import { supabaseFallbackJson, supabaseUnavailableResponse } from '@/lib/supabase/responses';
import { getSampleUsers } from '@/lib/fallback/users';
import type { SupabaseClient } from '@supabase/supabase-js';

type PresenceRecord = { lastLogin: string | null; lastLogout: string | null };

async function fetchPresenceMap(sb: SupabaseClient, ids: string[]): Promise<Map<string, PresenceRecord>> {
  const presence = new Map<string, PresenceRecord>();
  if (!ids.length) return presence;

  for (const table of AUDIT_TABLE_CANDIDATES) {
    try {
      const { data, error } = await sb
        .from(table as any)
        .select('actor_id, kind, created_at')
        .in('actor_id', ids)
        .in('kind', ['LOGIN', 'LOGOUT'])
        .order('created_at', { ascending: false });

      if (error) {
        if (isMissingAuditTableError(error)) continue;
        console.warn(`[admin/users] falha a ler ${table}`, error);
        return presence;
      }

      for (const row of data ?? []) {
        const actorId = String(row.actor_id ?? '').trim();
        if (!actorId) continue;
        const kind = String(row.kind ?? '').toUpperCase();
        const createdAt = row.created_at ? new Date(row.created_at).toISOString() : null;
        if (!createdAt) continue;
        const current = presence.get(actorId) ?? { lastLogin: null, lastLogout: null };
        if (kind === 'LOGIN' && !current.lastLogin) current.lastLogin = createdAt;
        if (kind === 'LOGOUT' && !current.lastLogout) current.lastLogout = createdAt;
        presence.set(actorId, current);
      }
      break;
    } catch (err) {
      if (isMissingAuditTableError(err)) continue;
      console.warn(`[admin/users] erro inesperado ao consultar ${table}`, err);
      return presence;
    }
  }

  return presence;
}

export async function GET(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? 0);
  const pageSize = Math.min(Number(searchParams.get('pageSize') ?? searchParams.get('perPage') ?? 20), 100);
  const q = searchParams.get('q') ?? searchParams.get('search') ?? undefined;
  const role = searchParams.get('role');
  const status = searchParams.get('status');

  const sb = tryCreateServerClient();
  if (!sb) {
    const fallback = getSampleUsers({ page, pageSize, search: q, role, status });
    return supabaseFallbackJson(fallback);
  }
  let s = sb.from('users').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (q) s = s.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  if (role) s = s.eq('role', role);
  if (status) s = s.eq('status', status);

  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await s.range(from, to);
  if (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as any).code : 'unknown';
    console.warn('[admin/users] list failed', { code });
    return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
  }

  const rowsRaw = data ?? [];
  const ids = rowsRaw
    .map((row: any) => row?.id)
    .filter((value): value is string | number => Boolean(value))
    .map((value) => String(value));
  const presence = await fetchPresenceMap(sb, ids);

  const now = Date.now();
  const onlineWindow = 1000 * 60 * 15; // 15 minutos

  const rows = rowsRaw.map((row: any) => {
    const record = presence.get(String(row.id)) ?? { lastLogin: null, lastLogout: null };
    const lastLoginDate = record.lastLogin ? new Date(record.lastLogin) : null;
    const lastLogoutDate = record.lastLogout ? new Date(record.lastLogout) : null;
    const lastSeenDate = [lastLoginDate, lastLogoutDate]
      .filter((d): d is Date => Boolean(d))
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

    const online = Boolean(
      lastLoginDate &&
      (!lastLogoutDate || lastLoginDate > lastLogoutDate) &&
      now - lastLoginDate.getTime() <= onlineWindow
    );

    return {
      ...row,
      created_at: row?.created_at ?? null,
      status: typeof row?.status === 'string' ? String(row.status).toUpperCase() : row?.status ?? null,
      state: typeof row?.state === 'string' ? String(row.state).toUpperCase() : row?.state ?? null,
      last_login_at: record.lastLogin,
      last_seen_at: lastSeenDate ? lastSeenDate.toISOString() : record.lastLogin ?? null,
      online,
    };
  });

  return NextResponse.json({ rows, count: count ?? rows.length });
}

export async function POST(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const body = await req.json().catch(() => ({}));
  const sb = tryCreateServerClient();
  if (!sb) return supabaseUnavailableResponse();

  const payload = {
    name: body.name ?? null,
    email: body.email ?? null,
    role: typeof body.role === 'string' ? body.role.toUpperCase() : 'CLIENT',
    status: typeof body.status === 'string' ? body.status.toUpperCase() : 'ACTIVE',
    approved: Boolean(body.approved ?? false),
    active: Boolean(body.active ?? true),
  };

  const { data, error } = await sb.from('users').insert(payload).select('*').single();
  if (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as any).code : 'unknown';
    console.warn('[admin/users] create failed', { code });
    return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
  }

  await logAudit(sb, {
    kind: AUDIT_KINDS.USER_CREATE,
    target_type: AUDIT_TARGET_TYPES.USER,
    target_id: data.id,
    note: `Utilizador criado (${payload.role})`,
  });

  return NextResponse.json(data);
}
