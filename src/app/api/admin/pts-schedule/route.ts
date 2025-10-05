import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

// Helpers para naming variável
function colStart() { return ['start_time', 'start', 'starts_at', 'begin_at', 'begin']; }
function colEnd() { return ['end_time', 'end', 'ends_at', 'finish_at', 'finish']; }
function colTrainer() { return ['trainer_id', 'pt_id']; }
function colClient() { return ['client_id', 'member_id']; }

function pickFirst<T extends Record<string, any>>(row: T, keys: string[]) {
  for (const k of keys) if (k in row && row[k] != null) return row[k];
  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') ?? '0');
  const pageSize = Math.min(Number(url.searchParams.get('pageSize') ?? '20'), 100);
  const trainer = url.searchParams.get('trainer') || '';
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const status = url.searchParams.get('status') || '';

  const sb = createServerClient();

  // Tenta primeiro pt_sessions; se não existir, sessions
  async function queryFrom(table: string) {
    let q = sb.from(table).select('*', { count: 'exact' });

    if (trainer) {
      // tentar trainer_id e pt_id
      q = q.or(`${colTrainer().map(c => `${c}.eq.${trainer}`).join(',')}`);
    }
    if (status) {
      q = q.or(`status.eq.${status},state.eq.${status}`);
    }
    if (from) {
      q = q.or(colStart().map(c => `${c}.gte.${from}`).join(','));
    }
    if (to) {
      q = q.or(colEnd().map(c => `${c}.lte.${to}`).join(','));
    }

    const fromIdx = page * pageSize;
    const toIdx = fromIdx + pageSize - 1;
    q = q.range(fromIdx, toIdx).order(colStart()[0], { ascending: true }).order('id', { ascending: true });
    return q;
  }

  let data: any[] | null = null;
  let count = 0;
  let err: any = null;

  let r = await queryFrom('pt_sessions');
  if (r.data || r.count || r.error) {
    data = r.data ?? null; count = r.count ?? 0; err = r.error ?? null;
  }
  if (!data && !err) {
    const r2 = await queryFrom('sessions');
    data = r2.data ?? null; count = r2.count ?? 0; err = r2.error ?? null;
  }
  if (err) return NextResponse.json({ error: err.message || String(err) }, { status: 500 });

  const rows = (data ?? []).map(d => ({
    id: String(d.id),
    trainer_id: String(pickFirst(d, colTrainer()) ?? ''),
    client_id: String(pickFirst(d, colClient()) ?? ''),
    start_time: String(pickFirst(d, colStart()) ?? ''),
    end_time: String(pickFirst(d, colEnd()) ?? ''),
    status: (d.status ?? d.state ?? 'scheduled') as 'scheduled'|'completed'|'cancelled',
    location: d.location ?? d.place ?? '',
    notes: d.notes ?? d.note ?? '',
  }));

  return NextResponse.json({ rows, count });
}

export async function POST(req: Request) {
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));

  const payload = {
    trainer_id: body.trainer_id,
    client_id: body.client_id,
    start_time: body.start_time,
    end_time: body.end_time,
    status: body.status ?? 'scheduled',
    location: body.location ?? null,
    notes: body.notes ?? null,
  };

  // tenta pt_sessions, senão sessions
  const tryInsert = async (table: string) => {
    const res = await sb.from(table).insert(payload).select('*').single();
    return res;
  };

  let r = await tryInsert('pt_sessions');
  if (r.error?.message?.includes('relation') || r.error?.code === '42P01') {
    r = await tryInsert('sessions');
  }
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });

  return NextResponse.json({ ok: true, row: r.data });
}
