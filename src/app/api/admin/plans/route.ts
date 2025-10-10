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
      // tenta match por name/title
      sel = sel.or(`name.ilike.%${q}%,title.ilike.%${q}%`);
    }
    if (difficulty) {
      sel = sel.or(`difficulty.eq.${difficulty},level.eq.${difficulty}`);
    }
    const fromIdx = page * pageSize;
    const toIdx = fromIdx + pageSize - 1;
    sel = sel.range(fromIdx, toIdx).order('created_at', { ascending: false }).order('id', { ascending: true });
    return sel;
  }

  let data: any[] | null = null, count = 0, err: any = null;
  let r = await base('plans');
  if (r.data || r.count || r.error) { data = r.data ?? null; count = r.count ?? 0; err = r.error ?? null; }

  if (!data && !err) {
    const r2 = await base('programs');
    data = r2.data ?? null; count = r2.count ?? 0; err = r2.error ?? null;
  }
  if (err) {
    console.warn('[admin/plans] list failed', err);
    return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
  }

  const rows = (data ?? []).map((d: any) => ({
    id: String(d.id),
    name: pick(d, ['name', 'title']) ?? '',
    description: pick(d, ['description', 'details']) ?? '',
    difficulty: pick(d, ['difficulty', 'level']) ?? null,
    duration_weeks: pick(d, ['duration_weeks', 'duration']) ?? null,
    is_public: pick(d, ['is_public', 'public']) ?? false,
    created_at: d.created_at ?? null,
  }));

  return NextResponse.json({ rows, count });
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

  let r = await tryInsert('plans');
  if (r.error?.code === '42P01' || r.error?.message?.includes('relation')) {
    r = await tryInsert('programs');
  }
  if (r.error) {
    console.warn('[admin/plans] insert failed', r.error);
    return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
  }

  return NextResponse.json({ ok: true, row: r.data });
}
