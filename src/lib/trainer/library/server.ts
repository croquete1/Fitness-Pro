import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildTrainerLibraryDashboard } from '@/lib/trainer/library/dashboard';
import type {
  TrainerLibraryDashboardData,
  TrainerLibraryExerciseRecord,
  TrainerLibraryScope,
} from '@/lib/trainer/library/types';
import { getTrainerLibraryDashboardFallback, getTrainerLibraryRecordsFallback } from '@/lib/fallback/trainer-library';
import { parseTagList } from '@/lib/exercises/tags';

export type TrainerLibraryDashboardResponse = TrainerLibraryDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

type Row = {
  id: string;
  name: string | null;
  description: string | null;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
  video_url: string | null;
  is_global: boolean | null;
  is_published: boolean | null;
  owner_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  published_at: string | null;
};

function mapRow(row: Row, scope: TrainerLibraryScope): TrainerLibraryExerciseRecord {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    name: row.name?.trim() || 'Exercício sem nome',
    description: row.description ?? null,
    scope,
    muscleGroup: row.muscle_group ?? null,
    muscleTags: parseTagList(row.muscle_group ?? undefined),
    equipment: row.equipment ?? null,
    equipmentTags: parseTagList(row.equipment ?? undefined),
    difficulty: 'unspecified',
    difficultyRaw: row.difficulty ?? null,
    isPublished: Boolean(row.is_published ?? (scope === 'global')), 
    videoUrl: row.video_url ?? null,
    createdAt: row.created_at ?? row.published_at ?? null,
    updatedAt: row.updated_at ?? row.published_at ?? row.created_at ?? null,
    ownerId: row.owner_id ?? null,
  } satisfies TrainerLibraryExerciseRecord;
}

export async function loadTrainerLibraryDashboard(trainerId: string): Promise<TrainerLibraryDashboardResponse> {
  const fallback = getTrainerLibraryDashboardFallback(trainerId);
  const client = tryCreateServerClient();
  if (!client) {
    return { ...fallback, ok: true, source: 'fallback' };
  }

  let personal: Row[] = [];
  let catalog: Row[] = [];

  try {
    const personalQuery = client
      .from('exercises')
      .select(
        'id,name,description,muscle_group,equipment,difficulty,video_url,is_global,is_published,owner_id,created_at,updated_at,published_at',
      )
      .eq('owner_id', trainerId)
      .eq('is_global', false)
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(480);

    const catalogQuery = client
      .from('exercises')
      .select(
        'id,name,description,muscle_group,equipment,difficulty,video_url,is_global,is_published,owner_id,created_at,updated_at,published_at',
      )
      .eq('is_global', true)
      .eq('is_published', true)
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(480);

    const [{ data: personalData, error: personalError }, { data: catalogData, error: catalogError }] = await Promise.all([
      personalQuery,
      catalogQuery,
    ]);

    if (personalError) throw personalError;
    if (catalogError) throw catalogError;

    personal = Array.isArray(personalData) ? (personalData as Row[]) : [];
    catalog = Array.isArray(catalogData) ? (catalogData as Row[]) : [];
  } catch (error) {
    console.error('[trainer-library] falha ao carregar dados do servidor', error);
    return { ...fallback, ok: true, source: 'fallback' };
  }

  const personalRecords = personal.map((row) => mapRow(row, 'personal'));
  const catalogRecords = catalog.map((row) => mapRow(row, 'global'));
  const records = [...personalRecords, ...catalogRecords];

  if (!records.length) {
    const fallbackRecords = getTrainerLibraryRecordsFallback(trainerId);
    return {
      ...buildTrainerLibraryDashboard(fallbackRecords, { supabase: false }),
      ok: true,
      source: 'fallback',
    } satisfies TrainerLibraryDashboardResponse;
  }

  const dashboard = buildTrainerLibraryDashboard(records, { supabase: true });
  return { ...dashboard, ok: true, source: 'supabase' } satisfies TrainerLibraryDashboardResponse;
}
