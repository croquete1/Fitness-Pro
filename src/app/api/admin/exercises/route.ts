import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const sb = createServerClient();
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get('page') ?? 0);
  const pageSize = Math.min(Number(searchParams.get('pageSize') ?? 20), 100);

  let q = sb.from('exercises').select('*', { count: 'exact' }).order('created_at', { ascending: false });

  const qtext = searchParams.get('q');
  const muscle = searchParams.get('muscle_group');
  const difficulty = searchParams.get('difficulty');
  const equipment = searchParams.get('equipment');

  if (qtext) q = q.ilike('name', `%${qtext}%`);
  if (muscle) q = q.ilike('muscle_group', `%${muscle}%`);
  if (equipment) q = q.ilike('equipment', `%${equipment}%`);
  if (difficulty) q = q.eq('difficulty', difficulty);

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await q.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ rows: data, count: count ?? data?.length ?? 0 });
}

export async function POST(req: Request) {
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));

  const payload = {
    name: String(body.name ?? ''),
    muscle_group: body.muscle_group ?? null,
    equipment: body.equipment ?? null,
    difficulty: body.difficulty ?? null,
    description: body.description ?? null,
    video_url: body.video_url ?? null,
  };

  if (!payload.name || String(payload.name).length < 2) {
    return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
  }

  const { data, error } = await sb.from('exercises').insert(payload).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}
