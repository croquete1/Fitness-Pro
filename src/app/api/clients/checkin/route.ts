// src/app/api/clients/checkin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

function ymd(d = new Date()) { return new Date(d).toISOString().slice(0,10); }

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ item: null }, { status: 401 });

  const url = new URL(req.url);
  const from = url.searchParams.get('from');
  const to   = url.searchParams.get('to');

  // Histórico (se vier from/to)  -------------------------------
  if (from || to) {
    const f = from || ymd(new Date(Date.now() - 13*86400000)); // 14 dias
    const t = to   || ymd();
    const { data, error } = await sb
      .from('checkins')
      .select('*')
      .eq('client_id', user.id)
      .gte('date', f)
      .lte('date', t)
      .order('date', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ items: data ?? [] });
  }

  // Registo do dia (default)  -----------------------------------
  const date = url.searchParams.get('date') || ymd();
  const { data, error } = await sb
    .from('checkins')
    .select('*')
    .eq('client_id', user.id)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ item: data ?? null });
}

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const b = await req.json().catch(()=>({}));

  const answerRaw = String(b.answer ?? '').toLowerCase();
  const answer = answerRaw === 'ok' ? 'ok' : (answerRaw === 'difficult' ? 'difficult' : null);

  const date = b.date ? String(b.date) : ymd();
  const question = b.question ? String(b.question) : null;
  const note = b.note ? String(b.note) : null;

  const energy   = b.energy   != null ? Math.max(1, Math.min(5, Number(b.energy)))   : null;
  const sleep    = b.sleep    != null ? Math.max(1, Math.min(5, Number(b.sleep)))    : null;
  const soreness = b.soreness != null ? Math.max(1, Math.min(5, Number(b.soreness))) : null;

  // opcional: trainer_id do perfil
  let trainer_id: string | null = null;
  try {
    const { data: prof } = await sb.from('profiles').select('trainer_id').eq('id', user.id).single();
    trainer_id = (prof as any)?.trainer_id ?? null;
  } catch {}

  const payload: any = { client_id: user.id, trainer_id, date, question, note };
  if (answer)   payload.answer   = answer;
  if (energy)   payload.energy   = energy;
  if (sleep)    payload.sleep    = sleep;
  if (soreness) payload.soreness = soreness;

  const { data, error } = await sb
    .from('checkins')
    .upsert(payload, { onConflict: 'client_id,date' })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}
