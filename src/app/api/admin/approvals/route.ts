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
  const status = (url.searchParams.get('status') || '').trim();

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
    return sel.range(from, to).order('created_at', { ascending: false }).order('id', { ascending: true });
  }

  try {
    for (const table of ['approvals', 'pending_approvals']) {
      const r = await base(table);
      if (r.error) {
        const code = r.error.code ?? '';
        if (code === 'PGRST205' || code === 'PGRST301') continue;
        throw r.error;
      }
      if ((r.data?.length ?? 0) === 0 && (r.count ?? 0) === 0) continue;
      return NextResponse.json(
        { rows: r.data ?? [], count: r.count ?? 0 },
        { headers: { 'cache-control': 'no-store' } },
      );
    }

    // Nenhuma tabela encontrada → devolve fallback para manter a UI funcional
    return supabaseFallbackJson(
      getSampleApprovals({ page, pageSize, search: q, status }),
      { headers: { 'cache-control': 'no-store' } },
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

  const payload = {
    user_id: b.user_id ?? b.uid ?? null,
    name: b.name ?? null,
    email: b.email ?? null,
    status: b.status ?? 'pending',
  };
  const ins = async (table: string) => sb.from(table).insert(payload).select('*').single();
  let r = await ins('approvals'); if (r.error?.code === '42P01') r = await ins('pending_approvals');
  if (r.error) {
    const code = typeof r.error === 'object' && r.error && 'code' in r.error ? (r.error as any).code : 'unknown';
    console.warn('[admin/approvals] insert failed', { code });
    return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, row: r.data });
}
