import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase.server';
import { getSessionUserSafe, assertRole } from '@/lib/session-bridge';

export async function POST(req: Request) {
  const user = await getSessionUserSafe();
  if (!assertRole(user, ['ADMIN'])) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json().catch(() => null) as null | {
    name: string; muscleGroup?: string; equipment?: string; difficulty?: string; instructions?: string; videoUrl?: string;
  };

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
  }

  const s = supabaseAdmin();
  const { error } = await s.from('exercises').insert({
    name: body.name.trim(),
    muscle_group: body.muscleGroup || null,
    equipment: body.equipment || null,
    difficulty: body.difficulty || null,
    instructions: body.instructions || null,
    video_url: body.videoUrl || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
