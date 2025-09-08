import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase.server';
import { getSessionUserSafe, assertRole } from '@/lib/session-bridge';

export async function GET(req: Request) {
  const user = await getSessionUserSafe();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const exerciseId = url.searchParams.get('exerciseId');
  if (!exerciseId) return NextResponse.json({ error: 'exerciseId required' }, { status: 400 });

  const s = supabaseAdmin();

  if (assertRole(user, ['ADMIN'])) {
    const { data, error } = await s
      .from('exercise_notes')
      .select('id, content, updated_at, trainer:trainer_id ( id, name, email )')
      .eq('exercise_id', exerciseId)
      .order('updated_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      items: (data ?? []).map((n: any) => ({
        id: n.id,
        content: n.content,
        updatedAt: n.updated_at,
        trainer: n.trainer ?? null,
      })),
    });
  }

  if (assertRole(user, ['PT'])) {
    const { data, error } = await s
      .from('exercise_notes')
      .select('id, exercise_id, content, updated_at')
      .eq('exercise_id', exerciseId)
      .eq('trainer_id', user.id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data ? {
      id: data.id, exerciseId: data.exercise_id, content: data.content, updatedAt: data.updated_at,
    } : null });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: Request) {
  const user = await getSessionUserSafe();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!assertRole(user, ['PT', 'ADMIN'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const exerciseId = String(body?.exerciseId ?? '').trim();
  const content = String(body?.content ?? '').trim();
  if (!exerciseId) return NextResponse.json({ error: 'exerciseId required' }, { status: 400 });

  const s = supabaseAdmin();
  const trainerId = user.id;

  if (!content) {
    const { error } = await s.from('exercise_notes').delete().match({ exercise_id: exerciseId, trainer_id: trainerId });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, deleted: true });
  }

  const { error } = await s
    .from('exercise_notes')
    .upsert({ exercise_id: exerciseId, trainer_id: trainerId, content }, { onConflict: 'exercise_id,trainer_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
