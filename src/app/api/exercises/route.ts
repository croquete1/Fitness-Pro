import { NextRequest, NextResponse } from 'next/server';

import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { getTrainerLibraryRecordsFallback } from '@/lib/fallback/trainer-library';

type SearchScope = 'personal' | 'global';

type ExerciseSearchRow = {
  id: string | number;
  name: string | null;
  description: string | null;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
  video_url: string | null;
  owner_id: string | null;
  is_global: boolean | null;
  is_published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type ExerciseSearchItem = {
  id: string;
  name: string;
  description: string | null;
  muscleGroup: string | null;
  equipment: string | null;
  difficulty: string | null;
  mediaUrl: string | null;
  scope: SearchScope;
  ownerId: string | null;
  updatedAt: string | null;
};

function normaliseId(value: string | number) {
  return typeof value === 'string' ? value : String(value);
}

function mapRowToItem(row: ExerciseSearchRow): ExerciseSearchItem {
  const scope: SearchScope = row.is_global ? 'global' : 'personal';
  const name = row.name?.trim();
  return {
    id: normaliseId(row.id),
    name: name && name.length ? name : 'Exercício sem nome',
    description: row.description ?? null,
    muscleGroup: row.muscle_group ?? null,
    equipment: row.equipment ?? null,
    difficulty: row.difficulty ?? null,
    mediaUrl: row.video_url ?? null,
    scope,
    ownerId: row.owner_id ?? null,
    updatedAt: row.updated_at ?? row.created_at ?? null,
  } satisfies ExerciseSearchItem;
}

function mapFallbackToItem(record: ReturnType<typeof getTrainerLibraryRecordsFallback>[number]): ExerciseSearchItem {
  return {
    id: record.id,
    name: record.name,
    description: record.description ?? null,
    muscleGroup: record.muscleGroup ?? null,
    equipment: record.equipment ?? null,
    difficulty: record.difficultyRaw ?? record.difficulty ?? null,
    mediaUrl: record.videoUrl ?? null,
    scope: record.scope,
    ownerId: record.ownerId ?? null,
    updatedAt: record.updatedAt ?? record.createdAt ?? null,
  } satisfies ExerciseSearchItem;
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

function buildSearchFilter(term: string) {
  if (!term) return null;
  const safe = escapeLike(term);
  const pattern = `%${safe}%`;
  return [
    `name.ilike.${pattern}`,
    `description.ilike.${pattern}`,
    `muscle_group.ilike.${pattern}`,
    `equipment.ilike.${pattern}`,
  ].join(',');
}

function normaliseLimit(raw: string | null | undefined, fallback: number) {
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, 1), 50);
}

function filterFallback(records: ExerciseSearchItem[], term: string) {
  if (!term) return records;
  const normalised = term
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return records.filter((record) => {
    const searchable = [
      record.name,
      record.description ?? '',
      record.muscleGroup ?? '',
      record.equipment ?? '',
    ]
      .join(' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return searchable.includes(normalised);
  });
}

export async function GET(req: NextRequest) {
  const session = await getSessionUserSafe();
  const me = session?.user ?? session;
  const userId = typeof me?.id === 'string' ? me.id : null;
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const role = toAppRole(me?.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const term = (url.searchParams.get('q') ?? '').trim();
  const limit = normaliseLimit(url.searchParams.get('limit'), 20);
  const ownerIdParam = url.searchParams.get('ownerId');
  const ownerId = role === 'ADMIN' ? ownerIdParam?.trim() || null : userId;

  const includePersonal = Boolean(ownerId);

  try {
    const sb = createServerClient();
    const selection =
      'id,name,description,muscle_group,equipment,difficulty,video_url,owner_id,is_global,is_published,created_at,updated_at';
    const filters = buildSearchFilter(term);

    const items = new Map<string, ExerciseSearchItem>();

    if (includePersonal && ownerId) {
      let personal = sb
        .from('exercises')
        .select(selection)
        .eq('owner_id', ownerId)
        .eq('is_global', false)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(limit);
      if (filters) personal = personal.or(filters);

      const { data: personalData, error: personalError } = await personal;
      if (personalError) {
        throw new Error(personalError.message || 'Erro ao consultar exercícios pessoais.');
      }
      for (const row of personalData ?? []) {
        const item = mapRowToItem(row);
        if (!items.has(item.id)) {
          items.set(item.id, item);
        }
      }
    }

    let global = sb
      .from('exercises')
      .select(selection)
      .eq('is_global', true)
      .eq('is_published', true)
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(limit);
    if (filters) global = global.or(filters);

    const { data: globalData, error: globalError } = await global;
    if (globalError) {
      throw new Error(globalError.message || 'Erro ao consultar o catálogo de exercícios.');
    }
    for (const row of globalData ?? []) {
      const item = mapRowToItem(row);
      if (!items.has(item.id)) {
        items.set(item.id, item);
      }
    }

    const ordered = Array.from(items.values())
      .sort((a, b) => {
        const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
        const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
        return bTime - aTime;
      })
      .slice(0, limit);

    return NextResponse.json({
      ok: true,
      source: 'supabase' as const,
      generatedAt: new Date().toISOString(),
      items: ordered,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Serviço indisponível.';
    const fallbackRecords = getTrainerLibraryRecordsFallback(ownerId ?? userId);
    const fallbackItems = filterFallback(fallbackRecords.map(mapFallbackToItem), term).slice(0, limit);
    return NextResponse.json(
      {
        ok: true,
        source: 'fallback' as const,
        generatedAt: new Date().toISOString(),
        items: fallbackItems,
        message,
      },
      { status: 200 },
    );
  }
}

export async function POST(req: NextRequest) {
  const sb = createServerClient();

  const body = await req.json().catch(() => ({}));
  const { name, muscle_group, description, equipment, difficulty, video_url } = body ?? {};

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
  }

  // Monta o payload somente com colunas conhecidas da tabela "exercises"
  const payload: Record<string, any> = {
    name: name.trim(),
    muscle_group: muscle_group ?? null,
    description: description ?? null,
    equipment: equipment ?? null,
    difficulty: difficulty ?? null,
    video_url: video_url ?? null,
    is_global: true,
    owner_id: null,
    is_published: false,
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb.from('exercises').insert(payload);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
