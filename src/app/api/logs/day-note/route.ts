// src/app/api/logs/day-note/route.ts
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

  if (!planId) {
    return NextResponse.json({ ok: false, error: 'MISSING_PLAN_ID' }, { status: 400 });
  }

  try {
    let query = sb
      .from('workout_notes' as any)
      .select('id,plan_id,day_index,note,photo_path,created_at')
      .eq('user_id', auth.user.id)
      .eq('plan_id', planId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (dayIndex != null) {
      query = query.eq('day_index', dayIndex);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, notes: data ?? [] });
  } catch (error) {
    console.error('Failed to load workout notes', error);
    return NextResponse.json({ ok: false, error: 'FAILED_TO_LOAD_NOTES' }, { status: 500 });
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

  if (!body?.plan_id || typeof body.day_index !== 'number') {
    return NextResponse.json({ ok: false, error: 'MISSING_FIELDS' }, { status: 400 });
  }

  const row = {
    user_id: auth.user.id,
    plan_id: body.plan_id,
    day_index: body.day_index,
    note: String(body.note ?? ''),
    photo_path: body.photo_path ? String(body.photo_path) : null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from('workout_notes' as any)
    .insert(row)
    .select('id,plan_id,day_index,note,photo_path,created_at')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, note: data });
}
