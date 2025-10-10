import { NextResponse } from 'next/server';
import { z } from 'zod';
import { tryGetSBC } from '@/lib/supabase/server';
import { MissingSupabaseEnvError } from '@/lib/supabaseServer';
import { getTrainerId } from '@/lib/auth/getTrainerId';
import { supabaseConfigErrorResponse, supabaseFallbackJson } from '@/lib/supabase/responses';

function readPage(req: Request) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') ?? 0);
  const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
  return { page, pageSize, searchParams: url.searchParams };
}
function rangeFor(page: number, pageSize: number) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

const Body = z.object({
  client_id: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  status: z.enum(['scheduled','done','cancelled']).default('scheduled'),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const { trainerId, reason } = await getTrainerId();
  if (!trainerId) {
    if (reason === 'SUPABASE_OFFLINE') {
      return supabaseFallbackJson({ rows: [], count: 0, error: 'SUPABASE_OFFLINE' });
    }
    const code = reason === 'NO_SESSION' ? 401 : 403;
    return NextResponse.json({ rows: [], count: 0, error: reason }, { status: code });
  }

  const sb = await tryGetSBC();
  if (!sb) {
    return supabaseFallbackJson({ rows: [], count: 0, error: 'SUPABASE_OFFLINE' });
  }
  const { page, pageSize, searchParams } = readPage(req);
  const status = searchParams.get('status') || '';
  const { from, to } = rangeFor(page, pageSize);

  let q = sb.from('sessions')
    .select('id,trainer_id,client_id,start_time,end_time,status,location,notes,created_at', { count: 'exact' })
    .eq('trainer_id', trainerId)
    .order('start_time', { ascending: false });

  if (status) q = q.eq('status', status);

  const { data, error, count } = await q.range(from, to);
  if (error) return NextResponse.json({ rows: [], count: 0, error: error.message }, { status: 400 });

  const rows = (data ?? []).map(r => ({
    id: String(r.id),
    trainer_id: r.trainer_id ?? null,
    client_id: r.client_id ?? null,
    start_time: r.start_time ?? null,
    end_time: r.end_time ?? null,
    status: r.status ?? null,
    location: r.location ?? null,
    notes: r.notes ?? null,
    created_at: r.created_at ?? null,
  }));
  return NextResponse.json({ rows, count: count ?? rows.length });
}

export async function POST(req: Request) {
  const { trainerId, reason } = await getTrainerId();
  if (!trainerId) {
    if (reason === 'SUPABASE_OFFLINE') {
      return supabaseFallbackJson({ error: 'SUPABASE_OFFLINE' }, { status: 503 });
    }
    const code = reason === 'NO_SESSION' ? 401 : 403;
    return NextResponse.json({ error: reason }, { status: code });
  }

  try {
    const sb = await tryGetSBC();
    if (!sb) {
      return supabaseFallbackJson({ error: 'SUPABASE_OFFLINE' }, { status: 503 });
    }
    const body = Body.parse(await req.json());

    const { data, error } = await sb.from('sessions')
      .insert({
        trainer_id: trainerId,
        client_id: body.client_id,
        start_time: body.start_time,
        end_time: body.end_time,
        status: body.status,
        location: body.location ?? null,
        notes: body.notes ?? null,
      })
      .select('id').single();

    if (error) throw error;
    return NextResponse.json({ id: data?.id });
  } catch (e:any) {
    const config = supabaseConfigErrorResponse(e);
    if (config) return config;
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
