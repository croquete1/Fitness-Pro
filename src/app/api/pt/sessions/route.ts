import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });

  const url = new URL(req.url);
  const from = url.searchParams.get('from') || new Date().toISOString();
  const to   = url.searchParams.get('to')   || new Date(Date.now() + 7*86400000).toISOString();

  const { data, error } = await sb
    .from('sessions')
    .select('id, client_id, title, kind, start_at, end_at')
    .eq('trainer_id', user.id)
    .gte('start_at', from)
    .lte('start_at', to)
    .order('start_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const b = await req.json().catch(()=>({}));
  const start = b.start ? new Date(b.start) : null;
  const durationMin = Number(b.durationMin || 60);
  const end = start ? new Date(start.getTime() + durationMin*60000) : null;

  if (!start) return NextResponse.json({ error: 'start obrigatório' }, { status: 400 });

  const insert: any = {
    trainer_id: user.id,
    client_id: b.client_id ?? null,
    title: b.title ?? 'Sessão',
    kind: b.kind ?? 'presencial',
    start_at: start.toISOString(),
    end_at: end?.toISOString() ?? null,
  };

  const { error } = await sb.from('sessions').insert(insert);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
