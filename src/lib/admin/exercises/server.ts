import { createServerClient, tryCreateServiceRoleClient } from '@/lib/supabaseServer';
import { buildAdminExercisesDashboard } from './dashboard';
import {
  type AdminExerciseRecord,
  type AdminExercisesDashboardParams,
  type AdminExercisesDashboardResult,
} from './types';
import { fallbackAdminExercisesDashboard } from '@/lib/fallback/admin-exercises';

const MAX_ANALYTICS_ROWS = 1500;
const DEFAULT_PAGE_SIZE = 20;
const DAY_MS = 86_400_000;

type RawExerciseRow = {
  id: string;
  name: string | null;
  description: string | null;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
  video_url: string | null;
  is_global: boolean | null;
  is_published: boolean | null;
  published_at: string | null;
  owner_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  owner?: { id?: string | null; name?: string | null; email?: string | null } | null;
  creator?: { id?: string | null; name?: string | null; email?: string | null } | null;
};

function sanitizeRecord(row: RawExerciseRow, profileLookup: Map<string, { name?: string | null; email?: string | null }>): AdminExerciseRecord {
  const ownerId = row.owner_id ? String(row.owner_id) : row.owner?.id ? String(row.owner.id) : null;
  const creatorId = row.created_by ? String(row.created_by) : row.creator?.id ? String(row.creator.id) : null;

  const ownerProfile = ownerId ? profileLookup.get(ownerId) : null;
  const creatorProfile = creatorId ? profileLookup.get(creatorId) : null;

  const ownerName = row.owner?.name ?? ownerProfile?.name ?? null;
  const ownerEmail = row.owner?.email ?? ownerProfile?.email ?? null;
  const creatorName = row.creator?.name ?? creatorProfile?.name ?? ownerName ?? null;
  const creatorEmail = row.creator?.email ?? creatorProfile?.email ?? ownerEmail ?? null;

  return {
    id: String(row.id),
    name: row.name ?? 'Sem nome',
    description: row.description ?? null,
    muscleGroup: row.muscle_group ?? null,
    equipment: row.equipment ?? null,
    difficulty: row.difficulty ?? null,
    videoUrl: row.video_url ?? null,
    isGlobal: Boolean(row.is_global),
    isPublished: Boolean(row.is_published),
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    ownerId,
    ownerName,
    ownerEmail,
    creatorId,
    creatorName,
    creatorEmail,
  };
}

function resolveRangeDays(range?: AdminExercisesDashboardParams['range']): number {
  switch (range) {
    case '30d':
      return 30;
    case '90d':
      return 90;
    case '180d':
      return 180;
    case '365d':
      return 365;
    default:
      return 180;
  }
}

function applyFilters(query: any, params: AdminExercisesDashboardParams) {
  let next = query;
  const scope = params.scope ?? 'all';
  const published = params.published ?? 'all';
  const { q, difficulty, equipment, muscle } = params;

  if (scope === 'global') next = next.eq('is_global', true);
  if (scope === 'personal') next = next.eq('is_global', false);

  if (published === 'published') next = next.eq('is_published', true);
  if (published === 'draft') next = next.eq('is_published', false);

  if (difficulty) next = next.eq('difficulty', difficulty);
  if (equipment) next = next.ilike('equipment', `%${equipment}%`);
  if (muscle) next = next.ilike('muscle_group', `%${muscle}%`);

  if (q) {
    const term = q.trim();
    if (term) {
      next = next.or(
        [
          `name.ilike.%${term}%`,
          `muscle_group.ilike.%${term}%`,
          `equipment.ilike.%${term}%`,
          `description.ilike.%${term}%`,
        ].join(','),
      );
    }
  }

  return next;
}

function resolveSort(sort?: AdminExercisesDashboardParams['sort']): { column: string; ascending: boolean } {
  switch (sort) {
    case 'name_asc':
      return { column: 'name', ascending: true };
    case 'updated_desc':
      return { column: 'updated_at', ascending: false };
    default:
      return { column: 'created_at', ascending: false };
  }
}

export async function loadAdminExercisesDashboard(
  params: AdminExercisesDashboardParams = {},
): Promise<AdminExercisesDashboardResult> {
  const rangeDays = resolveRangeDays(params.range);
  const page = Math.max(0, params.page ?? 0);
  const pageSize = Math.min(Math.max(params.pageSize ?? DEFAULT_PAGE_SIZE, 5), 100);

  const sb = tryCreateServiceRoleClient() ?? createServerClient();
  if (!sb) {
    return { ok: true, data: fallbackAdminExercisesDashboard({ rangeDays, page, pageSize }) };
  }

  try {
    const selection =
      'id,name,description,muscle_group,equipment,difficulty,video_url,is_global,is_published,published_at,owner_id,created_at,updated_at,created_by,owner:users!exercises_owner_id_fkey(id,name,email),creator:users!exercises_created_by_fkey(id,name,email)';

    const analyticsQuery = applyFilters(
      sb.from('exercises').select(selection).order('created_at', { ascending: false }),
      params,
    ).limit(MAX_ANALYTICS_ROWS);

    const tableSort = resolveSort(params.sort);
    const tableQuery = applyFilters(
      sb
        .from('exercises')
        .select(selection, { count: 'exact' })
        .order(tableSort.column, { ascending: tableSort.ascending, nullsFirst: false })
        .order('created_at', { ascending: false, nullsFirst: false }),
      params,
    );

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const [{ data: analyticsData, error: analyticsError }, { data: tableData, error: tableError, count }] = await Promise.all([
      analyticsQuery,
      tableQuery.range(from, to),
    ]);

    if (analyticsError) throw analyticsError;
    if (tableError) throw tableError;

    const combined = [...(analyticsData ?? []), ...(tableData ?? [])];
    const profileIds = new Set<string>();
    for (const row of combined) {
      if (row?.owner_id) profileIds.add(String(row.owner_id));
      if (row?.created_by) profileIds.add(String(row.created_by));
    }

    const profileLookup = new Map<string, { name?: string | null; email?: string | null }>();
    if (profileIds.size > 0) {
      const { data: profiles } = await sb
        .from('profiles')
        .select('id,full_name,name,email')
        .in('id', Array.from(profileIds));
      for (const profile of profiles ?? []) {
        if (!profile?.id) continue;
        const key = String(profile.id);
        profileLookup.set(key, {
          name: profile.full_name ?? profile.name ?? null,
          email: profile.email ?? null,
        });
      }
    }

    const analyticsRecords: AdminExerciseRecord[] = (analyticsData ?? []).map((row) =>
      sanitizeRecord(row as RawExerciseRow, profileLookup),
    );
    const tableRecords: AdminExerciseRecord[] = (tableData ?? []).map((row) =>
      sanitizeRecord(row as RawExerciseRow, profileLookup),
    );

    // Limit analytics to selected range for computation heavy sections.
    const rangeCutoff = new Date(Date.now() - (Math.max(rangeDays, 1) - 1) * DAY_MS);
    rangeCutoff.setHours(0, 0, 0, 0);
    const filteredAnalytics = analyticsRecords.filter((record) => {
      if (!record.createdAt) return false;
      const created = new Date(record.createdAt);
      if (!Number.isFinite(created.getTime())) return false;
      return created.getTime() >= rangeCutoff.getTime();
    });

    const dashboard = buildAdminExercisesDashboard({
      allRecords: analyticsRecords,
      rangeDays,
      tableRecords,
      tableTotal: count ?? tableRecords.length,
      page,
      pageSize,
    });

    // Replace timeline dataset with filtered range to avoid old noise.
    if (filteredAnalytics.length !== analyticsRecords.length) {
      const patched = buildAdminExercisesDashboard({
        allRecords: filteredAnalytics,
        rangeDays,
        tableRecords,
        tableTotal: count ?? tableRecords.length,
        page,
        pageSize,
      });
      return { ok: true, data: { ...patched, table: dashboard.table, facets: dashboard.facets } };
    }

    return { ok: true, data: dashboard };
  } catch (error) {
    console.error('[admin-exercises] dashboard fallback', error);
    return { ok: true, data: fallbackAdminExercisesDashboard({ rangeDays, page, pageSize }) };
  }
}
