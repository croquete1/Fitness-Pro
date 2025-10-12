import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { ExerciseFormSchema } from '@/lib/exercises/schema';

const DEFAULT_PAGE_SIZE = 20;

type Scope = 'personal' | 'global';

function normalizeScope(raw: string | null): Scope {
  return raw === 'global' ? 'global' : 'personal';
}

export async function GET(req: Request) {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const scope = normalizeScope(url.searchParams.get('scope'));
  const page = Number(url.searchParams.get('page') ?? '0') || 0;
  const pageSize = Math.min(Number(url.searchParams.get('pageSize') ?? DEFAULT_PAGE_SIZE), 100);

  const sb = createServerClient();

  let query = sb
    .from('exercises')
    .select(
      'id,name,muscle_group,equipment,difficulty,description,video_url,is_global,is_published,owner_id,published_at,created_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false, nullsFirst: false });

  if (scope === 'global') {
    query = query.eq('is_global', true).eq('is_published', true);
  } else {
    query = query.eq('owner_id', me.id).eq('is_global', false);
  }

  const q = url.searchParams.get('q');
  const muscle = url.searchParams.get('muscle_group');
  const difficulty = url.searchParams.get('difficulty');
  const equipment = url.searchParams.get('equipment');

  if (q) {
    query = query.or(
      [
        `name.ilike.%${q}%`,
        `muscle_group.ilike.%${q}%`,
        `equipment.ilike.%${q}%`,
        `description.ilike.%${q}%`,
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
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const sb = createServerClient();

  if (body?.sourceId) {
    const { data: source, error: srcErr } = await sb
      .from('exercises')
      .select('name,muscle_group,equipment,difficulty,description,video_url,is_global,is_published')
      .eq('id', body.sourceId)
      .maybeSingle();

    if (srcErr || !source) {
      return NextResponse.json({ error: srcErr?.message ?? 'Exercício não encontrado' }, { status: 404 });
    }
    if (!source.is_global || !source.is_published) {
      return NextResponse.json({ error: 'Exercício indisponível para duplicação' }, { status: 400 });
    }

    const insertPayload = {
      name: source.name,
      muscle_group: source.muscle_group ?? null,
      equipment: source.equipment ?? null,
      difficulty: source.difficulty ?? null,
      description: source.description ?? null,
      video_url: source.video_url ?? null,
      owner_id: me.id,
      created_by: me.id,
      is_global: false,
      is_published: false,
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await sb
      .from('exercises')
      .insert(insertPayload)
      .select(
        'id,name,muscle_group,equipment,difficulty,description,video_url,is_global,is_published,owner_id,published_at,created_at',
      )
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  const parsed = ExerciseFormSchema.safeParse(body ?? {});
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const payload = parsed.data;

  const insertPayload = {
    name: payload.name,
    muscle_group: payload.muscle_group ?? null,
    equipment: payload.equipment ?? null,
    difficulty: payload.difficulty ?? null,
    description: payload.description ?? null,
    video_url: payload.video_url ?? null,
    owner_id: me.id,
    created_by: me.id,
    is_global: false,
    is_published: false,
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from('exercises')
    .insert(insertPayload)
    .select(
      'id,name,muscle_group,equipment,difficulty,description,video_url,is_global,is_published,owner_id,published_at,created_at',
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
