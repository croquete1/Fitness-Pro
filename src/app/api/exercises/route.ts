import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase.server';
import { getSessionUserSafe, assertRole } from '@/lib/session-bridge';

export async function GET() {
  const s = supabaseAdmin();
  const { data, error } = await s
    .from('exercises')
    .select('id, name, muscle_group, equipment, difficulty')
    .order('name', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const items = (data ?? []).map((x) => ({
    id: x.id,
    name: x.name,
    muscleGroup: x.muscle_group,
    equipment: x.equipment,
    difficulty: x.difficulty,
  }));
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getSessionUserSafe();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!assertRole(user, ['ADMIN'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const payload = {
    name: String(body?.name ?? '').trim(),
    muscle_group: (body?.muscleGroup ?? null) || null,
    equipment: (body?.equipment ?? null) || null,
    difficulty: (body?.difficulty ?? null) || null,
    instructions: (body?.instructions ?? null) || null,
    video_url: (body?.videoUrl ?? null) || null,
  };
  if (!payload.name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const s = supabaseAdmin();
  const { data, error } = await s.from('exercises').insert(payload).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data?.id });
}
