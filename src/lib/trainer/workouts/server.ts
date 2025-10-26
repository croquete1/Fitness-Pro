import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildTrainerWorkoutsDashboard } from './dashboard';
import type { TrainerWorkoutRecord, TrainerWorkoutsDashboardData } from './types';
import { getTrainerWorkoutsFallback, getTrainerWorkoutRecordsFallback } from '@/lib/fallback/trainer-workouts';

type LoadResult = TrainerWorkoutsDashboardData & { ok: true; source: 'supabase' | 'fallback' };

type ProfilesMap = Map<string, { name: string | null; email: string | null }>;

type UsersMap = Map<string, { name: string | null; email: string | null }>;

function mapRow(row: any): TrainerWorkoutRecord {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    title: row.title ?? row.session_title ?? row.notes ?? null,
    trainerId: row.trainer_id ?? row.trainerId ?? null,
    clientId: row.client_id ?? row.clientId ?? null,
    clientName: row.client_name ?? row.client_full_name ?? row.clientName ?? null,
    clientEmail: row.client_email ?? row.clientEmail ?? null,
    startAt: row.start_at ?? row.scheduled_at ?? row.startAt ?? null,
    endAt: row.end_at ?? row.ends_at ?? row.endAt ?? null,
    durationMinutes: row.duration_min ?? row.duration_minutes ?? row.duration ?? null,
    status: row.status ?? row.session_status ?? null,
    attendanceStatus: row.client_attendance_status ?? row.attendance_status ?? row.attendanceStatus ?? null,
    location: row.location ?? null,
    planId: row.plan_id ?? row.planId ?? null,
    planTitle: row.plan_title ?? row.planTitle ?? null,
    focusArea: row.focus_area ?? row.focusArea ?? null,
    intensity: row.intensity ?? null,
    notes: row.notes ?? null,
  } satisfies TrainerWorkoutRecord;
}

async function hydrateClientDetails(
  sb: ReturnType<typeof tryCreateServerClient>,
  rows: TrainerWorkoutRecord[],
): Promise<void> {
  if (!sb) return;
  const missingIds = rows
    .filter((row) => row.clientId && (!row.clientName || !row.clientEmail))
    .map((row) => row.clientId) as string[];
  const uniqueIds = Array.from(new Set(missingIds));
  if (!uniqueIds.length) return;

  let profilesMap: ProfilesMap | null = null;
  try {
    const { data: profiles } = await sb
      .from('profiles')
      .select('id,full_name,name,email')
      .in('id', uniqueIds);
    profilesMap = new Map(
      (profiles ?? []).map((profile) => [
        profile.id,
        {
          name: profile.full_name ?? profile.name ?? null,
          email: profile.email ?? null,
        },
      ]),
    );
  } catch (error) {
    console.warn('[trainer-workouts] falha ao carregar perfis', error);
  }

  const unresolved = rows
    .filter((row) => row.clientId)
    .filter((row) => {
      const profile = row.clientId ? profilesMap?.get(row.clientId) : null;
      if (profile) {
        if (!row.clientName && profile.name) row.clientName = profile.name;
        if (!row.clientEmail && profile.email) row.clientEmail = profile.email;
      }
      return row.clientId != null && (!row.clientName || !row.clientEmail);
    })
    .map((row) => row.clientId) as string[];

  const unresolvedUnique = Array.from(new Set(unresolved));
  if (!unresolvedUnique.length) return;

  try {
    const { data: users } = await sb
      .from('users')
      .select('id,name,email')
      .in('id', unresolvedUnique);
    const usersMap: UsersMap = new Map(
      (users ?? []).map((user) => [user.id, { name: user.name ?? null, email: user.email ?? null }]),
    );
    rows.forEach((row) => {
      if (!row.clientId) return;
      const user = usersMap.get(row.clientId);
      if (user) {
        if (!row.clientName && user.name) row.clientName = user.name;
        if (!row.clientEmail && user.email) row.clientEmail = user.email;
      }
    });
  } catch (error) {
    console.warn('[trainer-workouts] falha ao carregar utilizadores', error);
  }
}

export async function loadTrainerWorkoutsDashboard(trainerId: string): Promise<LoadResult> {
  const fallback = getTrainerWorkoutsFallback(trainerId);
  const sb = tryCreateServerClient();
  if (!sb) {
    return { ...fallback, ok: true, source: 'fallback' } satisfies LoadResult;
  }

  const { data, error } = await sb
    .from('sessions')
    .select(
      'id,start_at,end_at,scheduled_at,duration_min,location,notes,status,client_attendance_status,client_attendance_at,client_id,trainer_id'
    )
    .eq('trainer_id', trainerId)
    .order('scheduled_at', { ascending: true, nullsFirst: false })
    .limit(720);

  if (error) {
    console.error('[trainer-workouts] falha ao sincronizar com o servidor', error);
    return { ...fallback, ok: true, source: 'fallback' } satisfies LoadResult;
  }

  const rows = (data ?? []).map(mapRow);
  if (!rows.length) {
    const fallbackRows = getTrainerWorkoutRecordsFallback(trainerId);
    return {
      ...buildTrainerWorkoutsDashboard(fallbackRows, { supabase: false }),
      ok: true,
      source: 'fallback',
    } satisfies LoadResult;
  }

  await hydrateClientDetails(sb, rows);
  const dashboard = buildTrainerWorkoutsDashboard(rows, { supabase: true });
  return { ...dashboard, ok: true, source: 'supabase' } satisfies LoadResult;
}
