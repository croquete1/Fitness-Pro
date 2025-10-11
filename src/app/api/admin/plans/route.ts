import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { supabaseFallbackJson, supabaseUnavailableResponse } from '@/lib/supabase/responses';

export const dynamic = 'force-dynamic';

function pick<T extends Record<string, any>>(row: T, keys: string[]) {
  for (const k of keys) if (row[k] != null) return row[k];
  return null;
}

export async function GET(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') ?? '0');
  const pageSize = Math.min(Number(url.searchParams.get('pageSize') ?? '20'), 100);
  const q = (url.searchParams.get('q') || '').trim();
  const difficulty = (url.searchParams.get('difficulty') || '').trim();

  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson({ rows: [], count: 0 });
  }

  async function base(table: string) {
    let sel = sb.from(table).select('*', { count: 'exact' });
    if (q) {
      sel = sel.or(`name.ilike.%${q}%,title.ilike.%${q}%`);
    }
    if (difficulty) {
      sel = sel.or(`difficulty.eq.${difficulty},level.eq.${difficulty}`);
    }
    const fromIdx = page * pageSize;
    const toIdx = fromIdx + pageSize - 1;
    return sel
      .range(fromIdx, toIdx)
      .order('created_at', { ascending: false })
      .order('id', { ascending: true });
  }

  const candidates = ['plans', 'training_plans', 'programs'];
  let data: any[] | null = null;
  let count = 0;

  for (const table of candidates) {
    const r = await base(table);
    if (r.error) {
      const code = r.error.code ?? '';
      if (code === 'PGRST205' || code === 'PGRST301') continue;
      console.warn('[admin/plans] list failed', r.error);
      return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
    }
    if ((r.data?.length ?? 0) === 0 && (r.count ?? 0) === 0) continue;
    data = r.data ?? [];
    count = r.count ?? data.length;
    break;
  }

  if (!data) {
    return NextResponse.json({ rows: [], count: 0 }, { headers: { 'cache-control': 'no-store' } });
  }

  const rows = data.map((d: any) => ({
    id: String(d.id),
    name: pick(d, ['name', 'title']) ?? '',
    description: pick(d, ['description', 'details']) ?? '',
    difficulty: pick(d, ['difficulty', 'level']) ?? null,
    duration_weeks: pick(d, ['duration_weeks', 'duration']) ?? null,
    is_public: pick(d, ['is_public', 'public']) ?? false,
    created_at: d.created_at ?? null,
  }));

  return NextResponse.json({ rows, count }, { headers: { 'cache-control': 'no-store' } });
}

export async function POST(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const sb = tryCreateServerClient();
  if (!sb) return supabaseUnavailableResponse();
  const body = await req.json().catch(() => ({}));

  const payload = {
    name: body.name ?? body.title ?? null,
    description: body.description ?? body.details ?? null,
    difficulty: body.difficulty ?? body.level ?? null,
    duration_weeks: body.duration_weeks ?? body.duration ?? null,
    is_public: body.is_public ?? body.public ?? false,
  };

  const tryInsert = async (table: string) => sb.from(table).insert(payload).select('*').single();

  for (const table of ['plans', 'training_plans', 'programs']) {
    const r = await tryInsert(table);
    if (r.error) {
      const code = r.error.code ?? '';
      if (code === 'PGRST205' || code === '42P01' || code === 'PGRST301' || r.error.message?.includes('relation')) {
        continue;
      }
      console.warn('[admin/plans] insert failed', r.error);
      return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
    }
    return NextResponse.json({ ok: true, row: r.data });
  }

  return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
}
