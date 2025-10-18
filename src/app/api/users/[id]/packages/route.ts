import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { assertCanViewClient } from '@/lib/acl';
import { toAppRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

type PackageRow = {
  id: string;
  user_id: string;
  package_id: string | null;
  name: string | null;
  status: string | null;
  started_at: string | null;
  ends_at: string | null;
  sessions_total: number | null;
  sessions_used: number | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const ENDED_STATUS = new Set(['ENDED', 'CANCELLED', 'EXPIRED', 'ARCHIVED']);
const ACTIVE_STATUS = new Set(['ACTIVE', 'PAUSED', 'UPCOMING', 'PENDING']);

function isCurrentPackage(row: PackageRow, now: Date) {
  const status = (row.status ?? '').toUpperCase();
  if (ACTIVE_STATUS.has(status)) return true;
  if (ENDED_STATUS.has(status)) return false;
  if (row.ends_at) {
    const ends = Date.parse(row.ends_at);
    if (!Number.isNaN(ends)) return ends >= now.getTime();
  }
  return !status; // se não houver estado assume-se ativo
}

function mapPackage(row: PackageRow) {
  return {
    id: row.id,
    name: row.name ?? null,
    status: row.status ?? null,
    startedAt: row.started_at ?? row.created_at ?? null,
    endsAt: row.ends_at ?? null,
    sessionsTotal: row.sessions_total ?? null,
    sessionsUsed: row.sessions_used ?? null,
    notes: row.notes ?? null,
  };
}

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await getSessionUserSafe();
  const meId = session?.id ?? session?.user?.id ?? null;
  if (!meId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const role = toAppRole(session?.role ?? session?.user?.role) ?? null;
  const sb = createServerClient();

  try {
    await assertCanViewClient({ id: meId, role }, id, sb);
  } catch (error: any) {
    const status = error?.status === 403 ? 403 : 500;
    return NextResponse.json({ error: 'forbidden' }, { status });
  }

  const { data, error } = await sb
    .from('client_packages')
    .select('*')
    .eq('user_id', id)
    .order('started_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[client-packages] failed to load packages', error);
    return NextResponse.json({ error: 'failed_to_load_packages' }, { status: 500 });
  }

  const rows = (data ?? []) as PackageRow[];
  if (!rows.length) {
    return NextResponse.json({ current: null, history: [] });
  }

  const now = new Date();
  const current = rows.find((row) => isCurrentPackage(row, now)) ?? null;
  const history = rows
    .filter((row) => (current ? row.id !== current.id : true))
    .sort((a, b) => {
      const aDate = Date.parse(a.started_at ?? a.created_at ?? '') || 0;
      const bDate = Date.parse(b.started_at ?? b.created_at ?? '') || 0;
      return bDate - aDate;
    });

  return NextResponse.json({
    current: current ? mapPackage(current) : null,
    history: history.map(mapPackage),
  });
}
