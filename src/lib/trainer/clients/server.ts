import { addDays, subDays } from 'date-fns';

import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getTrainerDashboardFallback } from '@/lib/fallback/trainer-dashboard';

export type TrainerClientOverviewRow = {
  id: string;
  name: string;
  email: string | null;
  clientStatus: string | null;
  linkedAt: string | null;
  planStatus: string | null;
  planUpdatedAt: string | null;
  upcomingCount: number;
  nextSessionAt: string | null;
  lastSessionAt: string | null;
};

export type TrainerClientOverview = {
  ok: true;
  source: 'supabase' | 'fallback';
  supabase: boolean;
  updatedAt: string;
  rows: TrainerClientOverviewRow[];
  metrics: {
    total: number;
    activePlans: number;
    onboarding: number;
    withoutUpcoming: number;
  };
};

type TrainerClientLink = { client_id: string | null; created_at: string | null };
type TrainerPlanRow = {
  client_id: string | null;
  status: string | null;
  updated_at: string | null;
  start_date: string | null;
  end_date: string | null;
};

type TrainerSessionRow = {
  client_id: string | null;
  status: string | null;
  start_time?: string | null;
  start_at?: string | null;
  scheduled_at?: string | null;
  starts_at?: string | null;
};

type ProfileRow = { id: string; full_name?: string | null; name?: string | null };
type UserRow = { id: string; name?: string | null; email?: string | null; status?: string | null };

type SessionStats = {
  upcoming: number;
  nextAt: string | null;
  lastAt: string | null;
};

function firstString(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function mergePlanRows(rows: TrainerPlanRow[]): Map<string, { status: string | null; updatedAt: string | null }> {
  const map = new Map<string, { status: string | null; updatedAt: string | null }>();
  for (const row of rows) {
    const clientId = row.client_id ? String(row.client_id) : null;
    if (!clientId) continue;
    if (map.has(clientId)) continue;
    const updatedAt = firstString(row.updated_at, row.end_date, row.start_date);
    map.set(clientId, { status: row.status ?? null, updatedAt });
  }
  return map;
}

function computeSessionStats(rows: TrainerSessionRow[], now: Date): Map<string, SessionStats> {
  const map = new Map<string, SessionStats>();
  const nowTs = now.getTime();

  for (const row of rows) {
    const clientId = row.client_id ? String(row.client_id) : null;
    if (!clientId) continue;

    const startIso = firstString(row.start_time, row.start_at, row.scheduled_at, row.starts_at);
    const start = parseDate(startIso);
    if (!start) continue;

    const entry = map.get(clientId) ?? { upcoming: 0, nextAt: null, lastAt: null };

    if (start.getTime() >= nowTs) {
      entry.upcoming += 1;
      const nextDate = entry.nextAt ? parseDate(entry.nextAt) : null;
      if (!nextDate || nextDate.getTime() > start.getTime()) {
        entry.nextAt = start.toISOString();
      }
    } else {
      const lastDate = entry.lastAt ? parseDate(entry.lastAt) : null;
      if (!lastDate || lastDate.getTime() < start.getTime()) {
        entry.lastAt = start.toISOString();
      }
    }

    map.set(clientId, entry);
  }

  return map;
}

function buildMetrics(rows: TrainerClientOverviewRow[]): TrainerClientOverview['metrics'] {
  const total = rows.length;
  let activePlans = 0;
  let onboarding = 0;
  let withoutUpcoming = 0;

  for (const row of rows) {
    const planStatus = row.planStatus ? row.planStatus.toString().toUpperCase() : '';
    if (planStatus === 'ACTIVE') {
      activePlans += 1;
    } else if (!planStatus || planStatus === 'DRAFT') {
      onboarding += 1;
    }

    if (!row.upcomingCount) {
      withoutUpcoming += 1;
    }
  }

  return { total, activePlans, onboarding, withoutUpcoming };
}

function mapFallbackRows(trainerId: string) {
  const fallback = getTrainerDashboardFallback(trainerId);
  const nowIso = new Date().toISOString();
  const rows: TrainerClientOverviewRow[] = fallback.clients.map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    clientStatus: null,
    linkedAt: null,
    planStatus: null,
    planUpdatedAt: null,
    upcomingCount: client.upcoming,
    nextSessionAt: client.nextSessionAt,
    lastSessionAt: client.lastSessionAt,
  }));

  return {
    ok: true as const,
    source: fallback.source,
    supabase: false,
    updatedAt: fallback.updatedAt ?? nowIso,
    rows,
    metrics: buildMetrics(rows),
  } satisfies TrainerClientOverview;
}

export async function loadTrainerClientOverview(trainerId: string): Promise<TrainerClientOverview> {
  const sb = tryCreateServerClient();
  if (!sb) {
    return mapFallbackRows(trainerId);
  }

  try {
    const { data: links, error: linksError } = await sb
      .from('trainer_clients')
      .select('client_id,created_at')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: true })
      .limit(480);

    if (linksError) throw linksError;

    const linkRows: TrainerClientLink[] = Array.isArray(links) ? links : [];
    const clientIds = Array.from(
      new Set(
        linkRows
          .map((row) => (row.client_id ? String(row.client_id) : null))
          .filter((id): id is string => Boolean(id)),
      ),
    );

    if (clientIds.length === 0) {
      return {
        ok: true,
        source: 'supabase',
        supabase: true,
        updatedAt: new Date().toISOString(),
        rows: [],
        metrics: { total: 0, activePlans: 0, onboarding: 0, withoutUpcoming: 0 },
      } satisfies TrainerClientOverview;
    }

    const now = new Date();
    const rangeStart = subDays(now, 120).toISOString();
    const rangeEnd = addDays(now, 120).toISOString();

    const [profilesRes, usersRes, plansRes, sessionsRes] = await Promise.all([
      sb
        .from('profiles')
        .select('id,full_name,name')
        .in('id', clientIds)
        .limit(480),
      sb
        .from('users')
        .select('id,name,email,status')
        .in('id', clientIds)
        .limit(480),
      sb
        .from('training_plans')
        .select('client_id,status,updated_at,start_date,end_date')
        .eq('trainer_id', trainerId)
        .in('client_id', clientIds)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(720),
      sb
        .from('sessions')
        .select('client_id,status,start_time,start_at,scheduled_at,starts_at')
        .eq('trainer_id', trainerId)
        .gte('start_time', rangeStart)
        .lte('start_time', rangeEnd)
        .order('start_time', { ascending: true })
        .limit(720),
    ]);

    const profileMap = new Map(
      (profilesRes.data ?? []).map((profile) => [String(profile.id), profile as ProfileRow]),
    );

    const userMap = new Map((usersRes.data ?? []).map((user) => [String(user.id), user as UserRow]));

    const planMap = mergePlanRows((plansRes.data ?? []) as TrainerPlanRow[]);
    const sessionMap = computeSessionStats((sessionsRes.data ?? []) as TrainerSessionRow[], now);

    const rows: TrainerClientOverviewRow[] = linkRows.map((link) => {
      const id = link.client_id ? String(link.client_id) : crypto.randomUUID();
      const profile = profileMap.get(id);
      const user = userMap.get(id);
      const plan = planMap.get(id);
      const stats = sessionMap.get(id) ?? { upcoming: 0, nextAt: null, lastAt: null };

      return {
        id,
        name:
          firstString(profile?.full_name, profile?.name, user?.name, user?.email, id) ??
          `Cliente ${id.slice(0, 6)}`,
        email: user?.email ?? null,
        clientStatus: user?.status ?? null,
        linkedAt: link.created_at ?? null,
        planStatus: plan?.status ?? null,
        planUpdatedAt: plan?.updatedAt ?? null,
        upcomingCount: stats.upcoming,
        nextSessionAt: stats.nextAt,
        lastSessionAt: stats.lastAt,
      } satisfies TrainerClientOverviewRow;
    });

    return {
      ok: true,
      source: 'supabase',
      supabase: true,
      updatedAt: new Date().toISOString(),
      rows,
      metrics: buildMetrics(rows),
    } satisfies TrainerClientOverview;
  } catch (error) {
    console.error('[trainer-clients] fallback devido a erro Supabase', error);
    return mapFallbackRows(trainerId);
  }
}
