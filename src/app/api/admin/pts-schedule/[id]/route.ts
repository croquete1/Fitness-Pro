import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = createServerClient();

  let r = await sb.from('pt_sessions').select('*').eq('id', params.id).maybeSingle();
  if (!r.data && !r.error) r = await sb.from('sessions').select('*').eq('id', params.id).maybeSingle();

  if (!r.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ row: r.data });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

  const tryUpdate = async (table: string) =>
    sb.from(table).update(payload).eq('id', params.id).select('*').maybeSingle();

  let r = await tryUpdate('pt_sessions');
  if ((r.error && r.error.code === '42P01') || (!r.data && !r.error)) {
    r = await tryUpdate('sessions');
  }

  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });
  if (!r.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ok: true, row: r.data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const sb = createServerClient();

  const tryDelete = async (table: string) => sb.from(table).delete().eq('id', params.id);

  let r = await tryDelete('pt_sessions');
  if (r.error?.code === '42P01' || (!r.data && !r.error)) r = await tryDelete('sessions');
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
