// src/app/api/logs/exercise/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ ok:false, error:'INVALID_JSON' }, { status: 400 }); }

  const row = {
    user_id: auth.user.id,
    plan_id: body.plan_id ?? null,
    day_index: typeof body.day_index === 'number' ? body.day_index : null,
    exercise_id: body.exercise_id ?? null,
    sets: Number(body.sets ?? 0),
    reps: String(body.reps ?? ''),
    rest_seconds: Number(body.rest_seconds ?? 0),
    payload: body.loads ?? null, // { set, weight }[]
    note: body.note ?? null,     // ← NOVO
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await sb.from('exercise_logs' as any).insert(row);
    if (error && !/does not exist/i.test(error.message)) {
      return NextResponse.json({ ok:false, error:error.message }, { status: 400 });
    }
  } catch {}
  return NextResponse.json({ ok: true });
}
