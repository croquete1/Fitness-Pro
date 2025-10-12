import { NextResponse } from 'next/server';
import { createServerClient, tryCreateServiceRoleClient } from '@/lib/supabaseServer';
import { parseTagList } from '@/lib/exercises/tags';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';

const DEFAULT_PAGE_SIZE = 20;

export async function GET(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (toAppRole((me as any).role) !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sb = tryCreateServiceRoleClient() ?? createServerClient();
  const { searchParams } = new URL(req.url);
  const scope = (searchParams.get('scope') ?? 'all').toLowerCase();
  const publishedFilter = (searchParams.get('published') ?? 'all').toLowerCase();

  if (searchParams.get('facets') === '1') {
    let facetQuery = sb
      .from('exercises')
      .select('muscle_group,equipment,difficulty,is_global,is_published');

    if (scope === 'global') {
      facetQuery = facetQuery.eq('is_global', true);
    } else if (scope === 'personal') {
      facetQuery = facetQuery.eq('is_global', false);
    }

    if (publishedFilter === 'published') facetQuery = facetQuery.eq('is_published', true);
    if (publishedFilter === 'draft') facetQuery = facetQuery.eq('is_published', false);

    const { data, error } = await facetQuery;

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

  const page = Number(searchParams.get('page') ?? '0') || 0;
  const pageSize = Math.min(Number(searchParams.get('pageSize') ?? DEFAULT_PAGE_SIZE), 100);

  let query = sb
    .from('exercises')
    .select(
      'id,name,muscle_group,equipment,difficulty,description,video_url,is_global,is_published,published_at,owner_id,created_at,updated_at,created_by,owner:users!exercises_owner_id_fkey(id,name,email),creator:users!exercises_created_by_fkey(id,name,email)',
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

  const rows = data ?? [];
  const idSet = new Set<string>();
  for (const row of rows) {
    if (row?.owner_id) idSet.add(String(row.owner_id));
    if (row?.created_by) idSet.add(String(row.created_by));
  }

  if (idSet.size > 0) {
    const ids = Array.from(idSet);
    try {
      const { data: profiles } = await sb
        .from('profiles')
        .select('id,full_name,name,email')
        .in('id', ids);

      if (Array.isArray(profiles)) {
        const lookup = new Map<string, { name?: string | null; email?: string | null }>();
        for (const profile of profiles) {
          const label = profile?.full_name ?? profile?.name ?? null;
          lookup.set(String(profile.id), {
            name: label,
            email: profile?.email ?? null,
          });
        }

        for (const row of rows) {
          const ownerProfile = row?.owner_id ? lookup.get(String(row.owner_id)) : null;
          const creatorProfile = row?.created_by ? lookup.get(String(row.created_by)) : null;
          if (ownerProfile && !(row as any).owner_name) {
            (row as any).owner_name = ownerProfile.name ?? ownerProfile.email ?? null;
          }
          if (creatorProfile && !(row as any).creator_name) {
            (row as any).creator_name = creatorProfile.name ?? creatorProfile.email ?? null;
          }
          if (ownerProfile?.email && !(row as any).owner_email) {
            (row as any).owner_email = ownerProfile.email;
          }
          if (creatorProfile?.email && !(row as any).creator_email) {
            (row as any).creator_email = creatorProfile.email;
          }
        }
      }
    } catch (profileErr) {
      console.warn('[admin/exercises] falha ao enriquecer perfis', profileErr);
    }
  }

  return NextResponse.json({ rows, count: count ?? rows.length });
}

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (toAppRole((me as any).role) !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sb = tryCreateServiceRoleClient() ?? createServerClient();
  const body = await req.json().catch(() => ({}));

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
  }

  const nowIso = new Date().toISOString();

  const payload = {
    name,
    muscle_group: body.muscle_group ?? null,
    equipment: body.equipment ?? null,
    difficulty: body.difficulty ?? null,
    description: body.description ?? null,
    video_url: body.video_url ?? null,
    is_global: true,
    owner_id: null,
    created_by: me.id,
    is_published: Boolean(body?.is_published),
    published_at: body?.is_published ? nowIso : null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const { data, error } = await sb
    .from('exercises')
    .insert(payload)
    .select(
      'id,name,muscle_group,equipment,difficulty,description,video_url,is_global,is_published,published_at,owner_id,created_at,updated_at,created_by',
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
