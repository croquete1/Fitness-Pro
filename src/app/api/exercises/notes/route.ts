// src/app/api/exercises/notes/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, isPT, isAdmin } from '@/lib/roles';

type NoteRow = {
  id: string;
  exercise_id: string;
  trainer_id: string;
  note: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// GET /api/exercises/notes?exerciseId=...
export async function GET(req: Request) {
  const me = await getSessionUserSafe();
  if (!me?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = toAppRole(me.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const exerciseId = url.searchParams.get('exerciseId') || url.searchParams.get('exercise_id');
  if (!exerciseId) {
    return NextResponse.json({ error: 'Missing exerciseId' }, { status: 400 });
  }

  const s = supabaseAdmin;

  const base = s
    .from('exercise_notes')
    .select('id,exercise_id,trainer_id,note,created_at,updated_at')
    .eq('exercise_id', exerciseId)
    .eq('trainer_id', me.user.id)
    .limit(1);

  const { data, error } = await base.returns<NoteRow[]>();
  if (error) {
    return NextResponse.json({ error: 'Failed to load note' }, { status: 500 });
  }

  const row = data?.[0] ?? null;
  return NextResponse.json({
    exerciseId,
    note: row?.note ?? '',
    updatedAt: row?.updated_at ?? null,
  });
}

// POST /api/exercises/notes
// body: { exerciseId: string, note: string }
export async function POST(req: Request) {
  const me = await getSessionUserSafe();
  if (!me?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = toAppRole(me.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const exerciseId: string | undefined = body?.exerciseId ?? body?.exercise_id;
  let note: string = String(body?.note ?? '');

  if (!exerciseId) {
    return NextResponse.json({ error: 'Missing exerciseId' }, { status: 400 });
  }
  // trims + sane limit
  note = note.trim().slice(0, 10000);

  const s = supabaseAdmin;

  const upsertQuery = s
    .from('exercise_notes')
    .upsert(
      { exercise_id: exerciseId, trainer_id: me.user.id, note },
      { onConflict: 'exercise_id,trainer_id' }
    )
    .select('id,exercise_id,trainer_id,note,updated_at')
    .limit(1);

  const { data, error } = await upsertQuery.returns<NoteRow[]>();
  if (error) {
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }

  const row = data?.[0] ?? null;
  return NextResponse.json(
    {
      ok: true,
      exerciseId,
      note: row?.note ?? note,
      updatedAt: row?.updated_at ?? null,
    },
    { status: 200 }
  );
}
