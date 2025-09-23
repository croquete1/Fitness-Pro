// src/app/api/sessions/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { touchSessions } from '@/lib/revalidate';

export async function POST(req: Request) {
  const sb = createServerClient();

  // auth
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) {
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  // valida mínimos
  if (!body?.scheduled_at) {
    return NextResponse.json({ ok: false, error: 'MISSING_scheduled_at' }, { status: 400 });
  }
  if (!body?.trainer_id && !body?.client_id) {
    return NextResponse.json({ ok: false, error: 'MISSING_trainer_or_client' }, { status: 400 });
  }

  const insert = {
    trainer_id: body.trainer_id ?? null,
    client_id : body.client_id  ?? null,
    scheduled_at: body.scheduled_at,
    location: body.location ?? null,
    status: body.status ?? 'SCHEDULED',
    notes: body.notes ?? null,
  };

  const { error, data } = await sb.from('sessions').insert(insert).select('id').maybeSingle();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  // revalida
  touchSessions();

  return NextResponse.json({ ok: true, id: data?.id });
}
