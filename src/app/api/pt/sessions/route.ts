// src/app/api/pt/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { client_id, title, start_at, end_at, kind = 'presencial', status = 'scheduled', core_exercise, notes } = body;

  if (!client_id || !title || !start_at) {
    return NextResponse.json({ error: 'Dados obrigatórios em falta' }, { status: 400 });
  }

  const ins = {
    trainer_id: user.id,
    client_id,
    title,
    start_at,
    end_at: end_at ?? null,
    kind,
    status,
    core_exercise: core_exercise ?? null,
    notes: notes ?? null,
  };

  const { error } = await sb.from('sessions').insert(ins);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
