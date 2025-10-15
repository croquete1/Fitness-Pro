// src/app/api/logs/exercise/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

function parseDayIndex(value: string | null): number | null {
  if (value == null) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(req: Request) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user?.id) {
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  const url = new URL(req.url);
  const planId = url.searchParams.get('planId');
  const dayIndex = parseDayIndex(url.searchParams.get('dayIndex'));
  const exerciseId = url.searchParams.get('exerciseId');

  if (!planId) {
    return NextResponse.json({ ok: false, error: 'MISSING_PLAN_ID' }, { status: 400 });
  }

  try {
    let query = sb
      .from('exercise_logs' as any)
      .select('id,plan_id,day_index,exercise_id,sets,reps,rest_seconds,payload,note,created_at')
      .eq('user_id', auth.user.id)
      .eq('plan_id', planId)
      .order('created_at', { ascending: false });

    if (dayIndex != null) {
      query = query.eq('day_index', dayIndex);
    }

    if (exerciseId) {
      query = query.eq('exercise_id', exerciseId).limit(1);
    } else {
      query = query.limit(50);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, logs: data ?? [] });
  } catch (error) {
    console.error('Failed to load exercise logs', error);
    return NextResponse.json({ ok: false, error: 'FAILED_TO_LOAD_LOGS' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const sb = createServerClient();
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

  if (!body?.plan_id || !body?.exercise_id) {
    return NextResponse.json({ ok: false, error: 'MISSING_FIELDS' }, { status: 400 });
  }

  const row = {
    user_id: auth.user.id,
    plan_id: body.plan_id,
    day_index: typeof body.day_index === 'number' ? body.day_index : null,
    exercise_id: body.exercise_id,
    sets: Number.isFinite(Number(body.sets)) ? Number(body.sets) : 0,
    reps: String(body.reps ?? ''),
    rest_seconds: Number.isFinite(Number(body.rest_seconds)) ? Number(body.rest_seconds) : 0,
    payload: Array.isArray(body.loads) ? body.loads : null,
    note: body.note ? String(body.note) : null,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await sb
      .from('exercise_logs' as any)
      .insert(row)
      .select('id,plan_id,day_index,exercise_id,sets,reps,rest_seconds,payload,note,created_at')
      .single();

    if (error && !/does not exist/i.test(error.message)) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, log: data });
  } catch (error) {
    console.error('Failed to insert exercise log', error);
    return NextResponse.json({ ok: false, error: 'FAILED_TO_SAVE_LOG' }, { status: 500 });
  }
}
