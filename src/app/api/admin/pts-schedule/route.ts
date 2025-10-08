import { NextResponse } from 'next/server';
import { z } from 'zod';
import { serverSB } from '@/lib/supabase/server';
import { readPageParams, rangeFor } from '@/app/api/_utils/pagination';

const SessionSchema = z.object({
  trainer_id: z.string().min(1),
  client_id: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  status: z.enum(['scheduled','done','cancelled']).default('scheduled'),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const sb = serverSB();
    const { page, pageSize, searchParams } = readPageParams(req);
    const status = searchParams.get('status') || '';
    const { from, to } = rangeFor(page, pageSize);

    let query = sb.from('pts_sessions')
      .select('id,trainer_id,client_id,start_time,end_time,status,location,notes,created_at', { count: 'exact' })
      .order('start_time', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

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
  } catch (e: any) {
    return NextResponse.json({ rows: [], count: 0, error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sb = serverSB();
    const body = await req.json();
    const parsed = SessionSchema.parse(body);

    const { data, error } = await sb.from('pts_sessions')
      .insert({
        trainer_id: parsed.trainer_id,
        client_id: parsed.client_id,
        start_time: parsed.start_time,
        end_time: parsed.end_time,
        status: parsed.status,
        location: parsed.location ?? null,
        notes: parsed.notes ?? null,
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data?.id });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 400 });
  }
}
