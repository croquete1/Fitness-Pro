import { startOfWeek, addDays } from 'date-fns';

import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildTrainerReschedulesDashboard } from './dashboard';
import type {
  TrainerAgendaSessionRecord,
  TrainerRescheduleRequestRecord,
  TrainerReschedulesDashboardData,
} from './types';
import { getTrainerReschedulesFallback } from '@/lib/fallback/trainer-reschedules';

export type TrainerReschedulesResponse = TrainerReschedulesDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
  generatedAt: string;
};

function mapRequest(row: any): TrainerRescheduleRequestRecord {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    sessionId: row.session_id ?? null,
    status: row.status ?? 'pending',
    requestedStart: row.requested_start ?? null,
    requestedEnd: row.requested_end ?? null,
    proposedStart: row.proposed_start ?? null,
    proposedEnd: row.proposed_end ?? null,
    message: row.message ?? null,
    trainerNote: row.trainer_note ?? null,
    rescheduleNote: row.reschedule_note ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    respondedAt: row.responded_at ?? null,
    proposedAt: row.proposed_at ?? null,
    clientId: row.client?.id ?? row.client_id ?? null,
    clientName: row.client?.name ?? row.client?.full_name ?? null,
    clientEmail: row.client?.email ?? null,
  } satisfies TrainerRescheduleRequestRecord;
}

function mapSession(row: any): TrainerAgendaSessionRecord {
  const start = row.scheduled_at ?? row.start_at ?? null;
  const duration = Number.isFinite(row.duration_min) ? Number(row.duration_min) : null;
  let end: string | null = row.end_at ?? null;
  if (!end && start && duration) {
    const startDate = new Date(start);
    if (!Number.isNaN(startDate.getTime())) {
      end = new Date(startDate.getTime() + duration * 60000).toISOString();
    }
  }
  return {
    id: String(row.id ?? crypto.randomUUID()),
    start,
    end,
    durationMin: duration,
    location: row.location ?? null,
    status: row.status ?? null,
    clientId: row.client?.id ?? row.client_id ?? null,
    clientName: row.client?.name ?? row.client?.full_name ?? null,
  } satisfies TrainerAgendaSessionRecord;
}

export async function loadTrainerReschedulesDashboard(
  trainerId: string,
  opts: { now?: Date } = {},
): Promise<TrainerReschedulesResponse> {
  const fallback = getTrainerReschedulesFallback(trainerId);
  const sb = tryCreateServerClient();
  if (!sb) {
    return { ...fallback, ok: true, source: 'fallback', generatedAt: new Date().toISOString() } satisfies TrainerReschedulesResponse;
  }

  const now = opts.now ?? new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 7);

  try {
    const { data: requestRows, error: requestError } = await sb
      .from('session_requests')
      .select(
        'id, status, session_id, requested_start, requested_end, proposed_start, proposed_end, message, trainer_note, reschedule_note, created_at, updated_at, responded_at, proposed_at, client:users!session_requests_client_id_fkey(id,name,email,full_name)'
      )
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false })
      .limit(240);

    if (requestError) throw requestError;

    const { data: sessionRows, error: sessionError } = await sb
      .from('sessions')
      .select('id, scheduled_at, end_at, duration_min, location, status, client:users!sessions_client_id_fkey(id,name,full_name)')
      .eq('trainer_id', trainerId)
      .gte('scheduled_at', weekStart.toISOString())
      .lt('scheduled_at', weekEnd.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(140);

    if (sessionError) throw sessionError;

    const requests = Array.isArray(requestRows) ? requestRows.map(mapRequest) : [];
    const sessions = Array.isArray(sessionRows) ? sessionRows.map(mapSession) : [];

    const dataset: TrainerReschedulesDashboardData = buildTrainerReschedulesDashboard(requests, sessions, {
      supabase: true,
      now,
    });

    return {
      ...dataset,
      ok: true,
      source: 'supabase',
      generatedAt: new Date().toISOString(),
    } satisfies TrainerReschedulesResponse;
  } catch (error) {
    console.error('[trainer-reschedules] falha ao sincronizar dados', error);
    return { ...fallback, ok: true, source: 'fallback', generatedAt: new Date().toISOString() } satisfies TrainerReschedulesResponse;
  }
}
