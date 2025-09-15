import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase.server';
import { getSessionUserSafe, assertRole } from '@/lib/session-bridge';

export async function GET(req: Request) {
  const user = await getSessionUserSafe();
  if (!assertRole(user, ['PT', 'ADMIN'])) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const exerciseId = searchParams.get('exerciseId');
  if (!exerciseId) return NextResponse.json({ error: 'exerciseId requerido' }, { status: 400 });

  const s = supabaseAdmin();
  const trainerId = user!.id;

  const { data, error } = await s
    .from('exercise_notes')
    .select('id, exercise_id, content, updated_at')
    .eq('exercise_id', exerciseId)
    .eq('trainer_id', trainerId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    item: data
      ? { id: data.id, exerciseId: data.exercise_id, content: data.content, updatedAt: data.updated_at }
      : null,
  });
}

export async function POST(req: Request) {
  const user = await getSessionUserSafe();
  if (!assertRole(user, ['PT', 'ADMIN'])) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json().catch(() => null) as null | { exerciseId?: string; content?: string };
  if (!body?.exerciseId) return NextResponse.json({ error: 'exerciseId requerido' }, { status: 400 });

  const s = supabaseAdmin();
  const trainerId = user!.id;

  const { error } = await s.from('exercise_notes')
    .upsert({
      exercise_id: body.exerciseId,
      trainer_id: trainerId,
      content: body.content ?? '',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'exercise_id,trainer_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
