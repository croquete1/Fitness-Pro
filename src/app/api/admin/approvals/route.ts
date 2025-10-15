import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { supabaseFallbackJson, supabaseUnavailableResponse } from '@/lib/supabase/responses';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { getSampleApprovals } from '@/lib/fallback/users';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') ?? '0');
  const pageSize = Math.min(Number(url.searchParams.get('pageSize') ?? '20'), 100);
  const q = (url.searchParams.get('q') || '').trim();
  const status = (url.searchParams.get('status') || '').trim().toLowerCase();

  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(
      getSampleApprovals({ page, pageSize, search: q, status }),
    );
  }

  async function base(table: string) {
    let sel = sb.from(table).select('*', { count: 'exact' });
    if (q) sel = sel.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
    if (status) sel = sel.eq('status', status);
    const from = page * pageSize;
    const to = from + pageSize - 1;
    return sel
      .range(from, to)
      .order('requested_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: true });
  }

  try {
    const headers = { 'cache-control': 'no-store' as const };
    let tableFound = false;
    let emptyResult: { rows: any[]; count: number } | null = null;

    const sources = ['admin_approval_requests', 'approvals', 'pending_approvals'];

    for (const table of sources) {
      const r = await base(table);
      if (r.error) {
        const code = r.error.code ?? '';
        if (code === 'PGRST205' || code === 'PGRST301') continue;
        throw r.error;
      }

      tableFound = true;
      const rows = r.data ?? [];
      const count = typeof r.count === 'number' ? r.count : rows.length;

      if (rows.length > 0 || count > 0) {
        return NextResponse.json({ rows, count }, { headers });
      }

      emptyResult = { rows: [], count };
    }

    if (tableFound) {
      return NextResponse.json(emptyResult ?? { rows: [], count: 0 }, { headers });
    }

    // Nenhuma tabela encontrada → devolve fallback para manter a UI funcional
    return supabaseFallbackJson(
      getSampleApprovals({ page, pageSize, search: q, status }),
      { headers },
    );
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as any).code : 'unknown';
    console.warn('[admin/approvals] list failed', { code });
    return NextResponse.json(
      { rows: [], count: 0, error: 'UNAVAILABLE' },
      { status: 200, headers: { 'cache-control': 'no-store' } },
    );
  }
}

export async function POST(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const sb = tryCreateServerClient();
  if (!sb) return supabaseUnavailableResponse();
  const b = await req.json().catch(() => ({}));

  const payload: Record<string, any> = {
    user_id: b.user_id ?? b.uid ?? null,
    trainer_id: b.trainer_id ?? b.coach_id ?? null,
    name: b.name ?? b.full_name ?? null,
    email: b.email ?? b.user_email ?? null,
    status: (b.status ?? 'pending') as string,
  };

  if (b.requested_at) {
    const iso = new Date(b.requested_at);
    payload.requested_at = Number.isNaN(iso.getTime()) ? b.requested_at : iso.toISOString();
  }
  if (b.metadata !== undefined) {
    let metadata = b.metadata ?? {};
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        metadata = {};
      }
    }
    payload.metadata = metadata && typeof metadata === 'object' ? metadata : {};
  }

  if (payload.user_id) {
    payload.user_id = String(payload.user_id).trim();
  }
  if (payload.name) {
    const trimmed = String(payload.name).trim();
    payload.name = trimmed.length ? trimmed : null;
  }
  if (payload.email) {
    const trimmed = String(payload.email).trim();
    payload.email = trimmed.length ? trimmed : null;
  }
  if (payload.trainer_id) {
    const trainerId = String(payload.trainer_id).trim();
    payload.trainer_id = trainerId.length ? trainerId : null;
  }

  if (!payload.user_id) {
    return NextResponse.json({ error: 'USER_REQUIRED' }, { status: 400 });
  }

  payload.status = String(payload.status ?? 'pending').toLowerCase();
  if (!['pending', 'approved', 'rejected'].includes(payload.status)) {
    payload.status = 'pending';
  }
  const ins = async (table: string) => sb.from(table).insert(payload).select('*').single();
  let r = await ins('approvals'); if (r.error?.code === '42P01') r = await ins('pending_approvals');
  if (r.error) {
    const code = typeof r.error === 'object' && r.error && 'code' in r.error ? (r.error as any).code : 'unknown';
    console.warn('[admin/approvals] insert failed', { code });
    return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, row: r.data });
}
