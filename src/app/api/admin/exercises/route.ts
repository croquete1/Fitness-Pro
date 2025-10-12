import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { parseTagList } from '@/lib/exercises/tags';

const DEFAULT_PAGE_SIZE = 20;

export async function GET(req: Request) {
  const sb = createServerClient();
  const { searchParams } = new URL(req.url);

  if (searchParams.get('facets') === '1') {
    const { data, error } = await sb
      .from('exercises')
      .select('muscle_group,equipment,difficulty', { head: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const muscles = new Set<string>();
    const equipments = new Set<string>();
    const difficulties = new Set<string>();

    for (const row of data ?? []) {
      for (const tag of parseTagList(row.muscle_group as any)) {
        muscles.add(tag);
      }
      for (const tag of parseTagList(row.equipment as any)) {
        equipments.add(tag);
      }
      if (row.difficulty) difficulties.add(String(row.difficulty));
    }

    return NextResponse.json({
      ok: true,
      muscles: Array.from(muscles).sort((a, b) => a.localeCompare(b, 'pt')),
      equipments: Array.from(equipments).sort((a, b) => a.localeCompare(b, 'pt')),
      difficulties: Array.from(difficulties).sort((a, b) => a.localeCompare(b, 'pt')),
    });
  }

  const scope = (searchParams.get('scope') ?? 'global').toLowerCase();
  const publishedFilter = (searchParams.get('published') ?? 'all').toLowerCase();

  const page = Number(searchParams.get('page') ?? '0') || 0;
  const pageSize = Math.min(Number(searchParams.get('pageSize') ?? DEFAULT_PAGE_SIZE), 100);

  let query = sb
    .from('exercises')
    .select(
      'id,name,muscle_group,equipment,difficulty,description,video_url,is_global,is_published,published_at,owner_id,created_at,updated_at,owner:users!exercises_owner_id_fkey(id,name,email)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false, nullsFirst: false });

  if (scope === 'global') {
    query = query.eq('is_global', true);
  } else if (scope === 'personal') {
    query = query.eq('is_global', false);
  }

  if (publishedFilter === 'published') query = query.eq('is_published', true);
  if (publishedFilter === 'draft') query = query.eq('is_published', false);

  const qtext = searchParams.get('q');
  const muscle = searchParams.get('muscle_group');
  const difficulty = searchParams.get('difficulty');
  const equipment = searchParams.get('equipment');

  if (qtext) {
    query = query.or(
      [
        `name.ilike.%${qtext}%`,
        `muscle_group.ilike.%${qtext}%`,
        `equipment.ilike.%${qtext}%`,
        `description.ilike.%${qtext}%`,
      ].join(','),
    );
  }
  if (muscle) query = query.ilike('muscle_group', `%${muscle}%`);
  if (equipment) query = query.ilike('equipment', `%${equipment}%`);
  if (difficulty) query = query.eq('difficulty', difficulty);

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ rows: data ?? [], count: count ?? 0 });
}

export async function POST(req: Request) {
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
  }

  const payload = {
    name,
    muscle_group: body.muscle_group ?? null,
    equipment: body.equipment ?? null,
    difficulty: body.difficulty ?? null,
    description: body.description ?? null,
    video_url: body.video_url ?? null,
    is_global: true,
    owner_id: null,
    is_published: Boolean(body?.is_published),
    published_at: body?.is_published ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from('exercises')
    .insert(payload)
    .select(
      'id,name,muscle_group,equipment,difficulty,description,video_url,is_global,is_published,published_at,owner_id,created_at,updated_at',
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
