import { addDays, subDays } from 'date-fns';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildTrainerDashboard } from './dashboard';
import {
  type TrainerApprovalRecord,
  type TrainerClientRecord,
  type TrainerDashboardResponse,
  type TrainerDashboardSource,
  type TrainerPlanRecord,
  type TrainerSessionRecord,
} from './types';
import { getTrainerDashboardFallback } from '@/lib/fallback/trainer-dashboard';

function normaliseDuration(value: any): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function firstString(...values: any[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return null;
}

function normaliseDateValue(value: any): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  return null;
}

function pickDate(row: any, ...keys: string[]): string | null {
  for (const key of keys) {
    if (!key) continue;
    const candidate = normaliseDateValue(row?.[key]);
    if (candidate) {
      return candidate;
    }
  }
  return null;
}

export async function loadTrainerDashboard(
  trainerId: string | null,
  trainerName: string | null = null,
): Promise<TrainerDashboardResponse> {
  const fallbackId = trainerId ?? 'trainer-fallback';
  const fallback = getTrainerDashboardFallback(fallbackId, trainerName);

  if (!trainerId) {
    return fallback;
  }

  const sb = tryCreateServerClient();
  if (!sb) {
    return fallback;
  }

  try {
    const now = new Date();
    const rangeStart = subDays(now, 21);
    const rangeEnd = addDays(now, 21);

    const { data: trainerProfile } = await sb
      .from('profiles')
      .select('id, full_name, name')
      .eq('id', trainerId)
      .maybeSingle();

    const resolvedTrainerName =
      trainerName ?? trainerProfile?.full_name ?? trainerProfile?.name ?? fallback.trainerName ?? null;

    const { data: linkRows, error: linkError } = await sb
      .from('trainer_clients')
      .select('client_id, created_at')
      .eq('trainer_id', trainerId)
      .limit(400);

    if (linkError) throw linkError;

    const clientIds = (linkRows ?? [])
      .map((row) => row?.client_id)
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    const { data: profileRows, error: profilesError } = clientIds.length
      ? await sb
          .from('profiles')
          .select('id, full_name, name, email, status')
          .in('id', clientIds)
          .limit(400)
      : { data: [], error: null };

    if (profilesError) throw profilesError;

    const profileMap = new Map(
      (profileRows ?? []).map((profile) => [String(profile.id), profile] as const),
    );
    const linkMap = new Map(
      (linkRows ?? []).map((link) => [String(link.client_id), link] as const),
    );

    const clients: TrainerClientRecord[] = clientIds.map((id) => {
      const profile = profileMap.get(id);
      const link = linkMap.get(id);
      return {
        id,
        name: firstString(profile?.full_name, profile?.name, profile?.email, id),
        email: profile?.email ?? null,
        status: profile?.status ?? null,
        linkedAt: link?.created_at ?? null,
        activePlanStatus: null,
        lastSessionAt: null,
        nextSessionAt: null,
      } satisfies TrainerClientRecord;
    });

    const { data: sessionRows, error: sessionsError } = await sb
      .from('sessions')
      .select(
        'id, client_id, start_time, start_at, scheduled_at, end_time, end_at, duration_minutes, duration_min, status, client_attendance_status, location',
      )
      .eq('trainer_id', trainerId)
      .gte('start_time', rangeStart.toISOString())
      .lte('start_time', rangeEnd.toISOString())
      .order('start_time', { ascending: true })
      .limit(600);

    if (sessionsError) throw sessionsError;

    const sessionClientIds = Array.from(
      new Set(
        (sessionRows ?? [])
          .map((row: any) => row?.client_id)
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0),
      ),
    );

    const missingSessionProfiles = sessionClientIds.filter((id) => !profileMap.has(String(id)));
    if (missingSessionProfiles.length) {
      const { data: extraProfiles, error: extraProfilesError } = await sb
        .from('profiles')
        .select('id, full_name, name, email, status')
        .in('id', missingSessionProfiles)
        .limit(400);

      if (extraProfilesError) throw extraProfilesError;

      for (const profile of extraProfiles ?? []) {
        profileMap.set(String(profile.id), profile);
      }
    }

    const clientNameById = new Map(
      clients.map((client) => [client.id, client.name ?? client.email ?? client.id] as const),
    );

    const sessions: TrainerSessionRecord[] = (sessionRows ?? []).map((row: any) => {
      const startAt =
        row.start_time ?? row.start_at ?? row.scheduled_at ?? row.starts_at ?? row.startISO ?? row.start_iso ?? null;
      const endAt = row.end_time ?? row.end_at ?? row.finish_at ?? row.endISO ?? row.end_iso ?? null;
      const duration = normaliseDuration(row.duration_minutes ?? row.duration_min ?? row.duration);
      const clientId = row.client_id ? String(row.client_id) : null;
      const profile = clientId ? profileMap.get(clientId) : null;
      const linkedName = clientId ? clientNameById.get(clientId) : undefined;
      return {
        id: String(row.id ?? crypto.randomUUID()),
        clientId,
        clientName:
          firstString(profile?.full_name, profile?.name, profile?.email, linkedName, clientId) ??
          null,
        startAt: typeof startAt === 'string' ? startAt : null,
        endAt: typeof endAt === 'string' ? endAt : null,
        durationMinutes: duration,
        status: row.status ?? null,
        attendanceStatus: row.client_attendance_status ?? row.attendance_status ?? null,
        location: row.location ?? null,
      } satisfies TrainerSessionRecord;
    });

    const planQuery = sb
      .from('training_plans')
      .select('id, client_id, status, start_date, end_date, updated_at, title', { head: false })
      .eq('trainer_id', trainerId)
      .limit(400);

    let planRows: any[] | null = null;
    let plansError = null;

    const { data: planData, error: planError } = await planQuery;

    if (planError && planError.code === '42703') {
      const { data: fallbackData, error: fallbackError } = await sb
        .from('training_plans')
        .select('*')
        .eq('trainer_id', trainerId)
        .limit(400);

      planRows = fallbackData ?? [];
      plansError = fallbackError;
    } else {
      planRows = planData ?? [];
      plansError = planError;
    }

    if (plansError) throw plansError;

    const plans: TrainerPlanRecord[] = (planRows ?? []).map((row: any) => ({
      id: String(row?.id ?? crypto.randomUUID()),
      clientId: row?.client_id ? String(row.client_id) : row?.clientId ? String(row.clientId) : null,
      status: row?.status ?? null,
      startDate: pickDate(
        row,
        'start_date',
        'startDate',
        'start_at',
        'startAt',
        'starts_at',
        'startsAt',
        'start_on',
        'startOn',
        'starts_on',
        'startsOn',
      ),
      endDate: pickDate(
        row,
        'end_date',
        'endDate',
        'end_at',
        'endAt',
        'ends_at',
        'endsAt',
        'end_on',
        'endOn',
        'ends_on',
        'endsOn',
      ),
      updatedAt: normaliseDateValue(row?.updated_at ?? row?.updatedAt),
      title: firstString(row?.title, row?.name),
    }));

    const { data: approvalRows, error: approvalsError } = await sb
      .from('approvals')
      .select('id, client_id, client_name, status, type, requested_at, notes')
      .eq('trainer_id', trainerId)
      .order('requested_at', { ascending: false })
      .limit(60);

    if (approvalsError) throw approvalsError;

    const approvals: TrainerApprovalRecord[] = (approvalRows ?? []).map((row: any) => ({
      id: String(row.id ?? crypto.randomUUID()),
      clientId: row.client_id ? String(row.client_id) : null,
      clientName: row.client_name ?? null,
      requestedAt: row.requested_at ?? null,
      status: row.status ?? null,
      type: row.type ?? null,
      notes: row.notes ?? null,
    }));

    const source: TrainerDashboardSource = {
      trainerId,
      trainerName: resolvedTrainerName,
      now,
      clients,
      sessions,
      plans,
      approvals,
    };

    const data = buildTrainerDashboard(source, { supabase: true });
    return { ...data, source: 'supabase' } satisfies TrainerDashboardResponse;
  } catch (error) {
    console.error('[trainer-dashboard] failed to load supabase data', error);
    return fallback;
  }
}
