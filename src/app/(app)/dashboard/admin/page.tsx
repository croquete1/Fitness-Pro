import * as React from 'react';
import AdminDashboardClient, { type AdminDashboardData } from './AdminDashboardClient';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { getSampleAdminDashboard } from '@/lib/fallback/users';

type SupabaseClient = NonNullable<ReturnType<typeof tryCreateServerClient>>;

type SessionRow = {
  id: string | number;
  trainer_id: string | number | null;
  client_id: string | number | null;
  scheduled_at: string | null;
  location: string | null;
  trainer?: { id: string | number; name: string | null; email: string | null } | null;
  client?: { id: string | number; name: string | null; email: string | null } | null;
};

type TrainerLeaderboardRow = {
  trainer_id: string | number | null;
  trainer_name: string | null;
  total: number | null;
};

type TrainerLeaderboardResult = Pick<AdminDashboardData, 'topTrainers' | 'topTrainersSource'>;

function resolveTrainerName(
  id: string,
  candidate: string | null | undefined,
  directory: Map<string, string>,
) {
  const fromDirectory = directory.get(id);
  const fromDirectoryTrimmed = fromDirectory?.trim();
  const cleaned = candidate?.trim();

  if (cleaned) {
    if (!fromDirectoryTrimmed || fromDirectoryTrimmed === id) {
      directory.set(id, cleaned);
      return cleaned;
    }
  }

  if (fromDirectoryTrimmed) {
    return fromDirectoryTrimmed;
  }

  if (cleaned) {
    directory.set(id, cleaned);
    return cleaned;
  }

  directory.set(id, id);
  return id;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 86_400_000);
}

function toIso(date: Date): string {
  return date.toISOString();
}

async function countRows(
  sb: SupabaseClient,
  table: 'users' | 'sessions',
  build?: (query: any) => any,
) {
  let query = sb.from(table).select('id', { count: 'exact', head: true });
  if (build) {
    const maybe = build(query as any);
    if (maybe) query = maybe as any;
  }
  const { count, error } = await (query as any);
  if (error) {
    console.warn('[admin dashboard] falha ao contar registos', table, error);
    return 0;
  }
  return count ?? 0;
}

async function refreshMaterializedView(sb: SupabaseClient) {
  try {
    const { error } = await sb.rpc('refresh_mv_sessions_next7_by_trainer');
    if (error) {
      console.warn('[admin dashboard] falha ao actualizar vista materializada de sessões', error);
      return false;
    }
    return true;
  } catch (error) {
    console.warn('[admin dashboard] erro inesperado ao actualizar vista materializada de sessões', error);
    return false;
  }
}

async function loadTrainerAggregates(
  sb: SupabaseClient,
  sessionsUpcoming: SessionRow[],
  trainerNames: Map<string, string>,
): Promise<TrainerLeaderboardResult> {
  const buildFallback = (): TrainerLeaderboardResult => {
    const totals = new Map<string, number>();
    for (const row of sessionsUpcoming ?? []) {
      if (!row?.trainer_id) continue;
      const id = String(row.trainer_id);
      totals.set(id, (totals.get(id) ?? 0) + 1);
    }
    const leaderboard = Array.from(totals.entries())
      .map<TrainerLeaderboardResult['topTrainers'][number]>(([id, total]) => ({
        id,
        name: resolveTrainerName(id, null, trainerNames),
        total,
      }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
      .slice(0, 5);
    return { topTrainers: leaderboard, topTrainersSource: 'sessions-fallback' };
  };

  const refreshed = await refreshMaterializedView(sb);
  if (refreshed) {
    const { data: mvRows, error } = await sb.rpc('get_mv_sessions_next7_totals', { limit_count: 5 });
    if (!error && Array.isArray(mvRows)) {
      const leaderboard = (mvRows as TrainerLeaderboardRow[])
        .filter((row) => row?.trainer_id)
        .map<TrainerLeaderboardResult['topTrainers'][number]>((row) => {
          const id = String(row.trainer_id);
          const total = Number(row.total ?? 0);
          const name = resolveTrainerName(id, row.trainer_name, trainerNames);
          return { id, name, total };
        })
        .filter((row) => Number.isFinite(row.total))
        .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

      if (leaderboard.length > 0) {
        return { topTrainers: leaderboard.slice(0, 5), topTrainersSource: 'materialized-view' };
      }
    } else if (error) {
      console.warn('[admin dashboard] falha ao ler ranking materializado', error);
    }
  }

  return buildFallback();
}

function collectDirectory(
  rows: SessionRow[],
): { trainers: Map<string, string>; clients: Map<string, string> } {
  const trainers = new Map<string, string>();
  const clients = new Map<string, string>();

  for (const row of rows ?? []) {
    if (row?.trainer_id) {
      const trainer = row.trainer ?? null;
      const id = String(row.trainer_id);
      const name = trainer?.name ?? trainer?.email ?? id;
      trainers.set(id, name);
    }
    if (row?.client_id) {
      const client = row.client ?? null;
      const id = String(row.client_id);
      const name = client?.name ?? client?.email ?? id;
      clients.set(id, name);
    }
  }

  return { trainers, clients };
}

export const dynamic = 'force-dynamic';

async function loadAdminDashboard(): Promise<{ data: AdminDashboardData; supabase: boolean }> {
  const sb = tryCreateServerClient();
  if (!sb) {
    const sample = getSampleAdminDashboard();
    return { data: sample, supabase: false };
  }

  try {
    const now = new Date();
    const startToday = startOfUtcDay(now);
    const startTomorrow = addUtcDays(startToday, 1);
    const inSevenDays = addUtcDays(startToday, 7);
    const startTodayIso = toIso(startToday);
    const startTomorrowIso = toIso(startTomorrow);
    const inSevenDaysIso = toIso(inSevenDays);

    const [usersCount, clientsCount, trainersCount, pendingCount, sessionsToday] = await Promise.all([
      countRows(sb, 'users'),
      countRows(sb, 'users', (q) => q.eq('role', 'CLIENT')),
      countRows(sb, 'users', (q) => q.in('role', ['TRAINER', 'PT'])),
      countRows(sb, 'users', (q) => q.eq('status', 'PENDING')),
      countRows(sb, 'sessions', (q) => q.gte('scheduled_at', startTodayIso).lt('scheduled_at', startTomorrowIso)),
    ]);

    const { data: lastUsers, error: lastUsersError } = await sb
      .from('users')
      .select('id,name,email,created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (lastUsersError) {
      console.warn('[admin dashboard] falha ao carregar últimos utilizadores', lastUsersError);
    }

    const { data: sessionsUpcomingRaw, error: sessionsError } = await sb
      .from('sessions')
      .select(
        `
          id,
          trainer_id,
          client_id,
          scheduled_at,
          location,
          trainer:users!sessions_trainer_id_fkey(id,name,email),
          client:users!sessions_client_id_fkey(id,name,email)
        `,
      )
      .gte('scheduled_at', startTodayIso)
      .lt('scheduled_at', inSevenDaysIso)
      .order('scheduled_at', { ascending: true });
    if (sessionsError) {
      console.warn('[admin dashboard] falha ao carregar sessões próximas', sessionsError);
    }
    const sessionsUpcoming = (sessionsUpcomingRaw ?? []) as unknown as SessionRow[];

    const { trainers: trainerNames, clients: clientNames } = collectDirectory(sessionsUpcoming);

    const { topTrainers, topTrainersSource } = await loadTrainerAggregates(
      sb,
      sessionsUpcoming,
      trainerNames,
    );

    const agenda = sessionsUpcoming.map((session, index) => {
      const trainerId = session.trainer_id ? String(session.trainer_id) : null;
      const clientId = session.client_id ? String(session.client_id) : null;
      return {
        id: session?.id ? String(session.id) : `session-${index}`,
        scheduled_at: session?.scheduled_at ?? null,
        start_time: session?.scheduled_at ?? null,
        trainer_id: trainerId,
        trainer_name: trainerId ? trainerNames.get(trainerId) ?? trainerId : '-',
        client_id: clientId,
        client_name: clientId ? clientNames.get(clientId) ?? clientId : '-',
        location: session.location ?? null,
      };
    });

    const data: AdminDashboardData = {
      totals: {
        users: usersCount,
        clients: clientsCount,
        trainers: trainersCount,
        sessionsToday,
        pendingApprovals: pendingCount,
      },
      recentUsers: (lastUsers ?? []).map((u) => ({
        id: String(u.id),
        name: u.name ?? u.email ?? 'Utilizador',
        email: u.email ?? null,
        createdAt: u.created_at ?? null,
      })),
      topTrainers,
      agenda,
      topTrainersSource,
      agendaSource: 'supabase',
    };

    return { data, supabase: true };
  } catch (error) {
    console.warn('[admin dashboard] fallback sample data', error);
    const sample = getSampleAdminDashboard();
    return { data: sample, supabase: false };
  }
}

function firstName(full?: string | null) {
  if (!full) return 'Admin';
  const parts = full.trim().split(/\s+/);
  return parts[0] ?? full;
}

export default async function AdminDashboardPage() {
  const session = await getSessionUserSafe();
  const name = firstName(session?.user?.name ?? session?.user?.email ?? undefined);
  const { data, supabase } = await loadAdminDashboard();

  return <AdminDashboardClient name={name} data={data} supabase={supabase} />;
}
