// src/lib/server/sessionRequests.ts
import { type SupabaseClient } from '@supabase/supabase-js';

export type SessionRequestStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'reschedule_pending'
  | 'reschedule_declined';

export type ConflictSource = 'session' | 'request';
export type ConflictOwner = 'trainer' | 'client' | 'both';

export type ConflictInfo = {
  id: string;
  source: ConflictSource;
  owner: ConflictOwner;
  status?: string | null;
  start: string;
  end: string;
};

export type ConflictCheckInput = {
  supabase: SupabaseClient;
  trainerId: string;
  clientId: string;
  start: Date;
  end: Date;
  excludeSessionId?: string | null;
  excludeRequestId?: string | null;
};

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function toIsoSafe(value: Date) {
  return new Date(value.getTime()).toISOString();
}

function clampRange(start: Date, end: Date) {
  const rangeStart = new Date(start.getTime());
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(end.getTime());
  rangeEnd.setHours(23, 59, 59, 999);
  return { rangeStart, rangeEnd };
}

function computeEnd(start: Date, durationMin?: number | null, fallbackEnd?: string | null) {
  if (fallbackEnd) {
    const end = new Date(fallbackEnd);
    if (!Number.isNaN(end.getTime())) return end;
  }
  const minutes = typeof durationMin === 'number' && durationMin > 0 ? durationMin : 60;
  return addMinutes(start, minutes);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

function normalizeDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function detectScheduleConflicts({
  supabase,
  trainerId,
  clientId,
  start,
  end,
  excludeSessionId,
  excludeRequestId,
}: ConflictCheckInput): Promise<{ hasConflict: boolean; conflicts: ConflictInfo[] }> {
  const { rangeStart, rangeEnd } = clampRange(start, end);
  const conflicts = new Map<string, ConflictInfo>();

  const trainerSessionsPromise = supabase
    .from('sessions' as any)
    .select('id, trainer_id, client_id, scheduled_at, start_at, end_at, end_time, duration_min')
    .eq('trainer_id', trainerId)
    .gte('scheduled_at', rangeStart.toISOString())
    .lte('scheduled_at', rangeEnd.toISOString());

  const clientSessionsPromise = supabase
    .from('sessions' as any)
    .select('id, trainer_id, client_id, scheduled_at, start_at, end_at, end_time, duration_min')
    .eq('client_id', clientId)
    .gte('scheduled_at', rangeStart.toISOString())
    .lte('scheduled_at', rangeEnd.toISOString());

  const requestStatuses = ['pending', 'reschedule_pending'];
  const trainerRequestsPromise = supabase
    .from('session_requests' as any)
    .select('id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, session_id')
    .eq('trainer_id', trainerId)
    .in('status', requestStatuses);

  const clientRequestsPromise = supabase
    .from('session_requests' as any)
    .select('id, trainer_id, client_id, requested_start, requested_end, proposed_start, proposed_end, status, session_id')
    .eq('client_id', clientId)
    .in('status', requestStatuses);

  const [trainerSessionsRes, clientSessionsRes, trainerReqRes, clientReqRes] = await Promise.all([
    trainerSessionsPromise,
    clientSessionsPromise,
    trainerRequestsPromise,
    clientRequestsPromise,
  ]);

  const trainerSessions = Array.isArray(trainerSessionsRes.data) ? trainerSessionsRes.data : [];
  const clientSessions = Array.isArray(clientSessionsRes.data) ? clientSessionsRes.data : [];

  const targetStart = new Date(start);
  const targetEnd = new Date(end);

  const pushConflict = (key: string, info: ConflictInfo) => {
    if (!conflicts.has(key)) {
      conflicts.set(key, info);
    }
  };

  for (const row of trainerSessions) {
    if (excludeSessionId && row.id === excludeSessionId) continue;
    const sStart = normalizeDate(row.scheduled_at ?? row.start_at);
    if (!sStart) continue;
    const sEnd = computeEnd(sStart, row.duration_min, row.end_at ?? row.end_time ?? null);
    if (overlaps(targetStart, targetEnd, sStart, sEnd)) {
      const key = `session-trainer-${row.id}`;
      pushConflict(key, {
        id: String(row.id),
        source: 'session',
        owner: 'trainer',
        status: row.client_id === clientId ? 'compartilhado' : null,
        start: toIsoSafe(sStart),
        end: toIsoSafe(sEnd),
      });
    }
  }

  for (const row of clientSessions) {
    if (excludeSessionId && row.id === excludeSessionId) continue;
    const sStart = normalizeDate(row.scheduled_at ?? row.start_at);
    if (!sStart) continue;
    const sEnd = computeEnd(sStart, row.duration_min, row.end_at ?? row.end_time ?? null);
    if (overlaps(targetStart, targetEnd, sStart, sEnd)) {
      const key = `session-client-${row.id}`;
      const owner: ConflictOwner = row.trainer_id === trainerId ? 'both' : 'client';
      pushConflict(key, {
        id: String(row.id),
        source: 'session',
        owner,
        status: row.trainer_id === trainerId ? 'sessao_existente' : null,
        start: toIsoSafe(sStart),
        end: toIsoSafe(sEnd),
      });
    }
  }

  const requestRows: any[] = [];
  if (Array.isArray(trainerReqRes.data)) requestRows.push(...trainerReqRes.data);
  if (Array.isArray(clientReqRes.data)) requestRows.push(...clientReqRes.data);

  for (const row of requestRows) {
    if (excludeRequestId && row.id === excludeRequestId) continue;
    const intervalStart = normalizeDate(row.status === 'reschedule_pending' ? row.proposed_start : row.requested_start);
    const intervalEnd = normalizeDate(row.status === 'reschedule_pending' ? row.proposed_end : row.requested_end);
    if (!intervalStart || !intervalEnd) continue;
    if (overlaps(targetStart, targetEnd, intervalStart, intervalEnd)) {
      const owner: ConflictOwner = row.trainer_id === trainerId && row.client_id === clientId
        ? 'both'
        : row.trainer_id === trainerId
        ? 'trainer'
        : 'client';
      const key = `request-${owner}-${row.id}`;
      pushConflict(key, {
        id: String(row.id),
        source: 'request',
        owner,
        status: row.status ?? null,
        start: toIsoSafe(intervalStart),
        end: toIsoSafe(intervalEnd),
      });
    }
  }

  return { hasConflict: conflicts.size > 0, conflicts: Array.from(conflicts.values()) };
}

export function computeDurationMinutes(start: Date, end: Date) {
  const diff = Math.round((end.getTime() - start.getTime()) / 60000);
  return diff > 0 ? diff : 0;
}

export function ensureFuture(start: Date) {
  const now = Date.now();
  return start.getTime() >= now - 5 * 60 * 1000;
}

export type SessionRequestRecord = {
  id: string;
  session_id: string | null;
  trainer_id: string;
  client_id: string;
  requested_start: string;
  requested_end: string;
  proposed_start: string | null;
  proposed_end: string | null;
  status: SessionRequestStatus;
  message: string | null;
  trainer_note: string | null;
  reschedule_note: string | null;
  created_at: string | null;
  updated_at: string | null;
  responded_at: string | null;
  proposed_at: string | null;
  proposed_by: string | null;
  responded_by: string | null;
  trainer?: { id?: string | null; name?: string | null; email?: string | null } | null;
  client?: { id?: string | null; name?: string | null; email?: string | null } | null;
};

export function mapRequestRow(row: any): SessionRequestRecord {
  return {
    id: String(row?.id ?? ''),
    session_id: row?.session_id ?? null,
    trainer_id: row?.trainer_id ?? row?.trainer?.id ?? '',
    client_id: row?.client_id ?? row?.client?.id ?? '',
    requested_start: row?.requested_start ?? null,
    requested_end: row?.requested_end ?? null,
    proposed_start: row?.proposed_start ?? null,
    proposed_end: row?.proposed_end ?? null,
    status: (row?.status ?? 'pending') as SessionRequestStatus,
    message: row?.message ?? null,
    trainer_note: row?.trainer_note ?? null,
    reschedule_note: row?.reschedule_note ?? null,
    created_at: row?.created_at ?? null,
    updated_at: row?.updated_at ?? null,
    responded_at: row?.responded_at ?? null,
    proposed_at: row?.proposed_at ?? null,
    proposed_by: row?.proposed_by ?? null,
    responded_by: row?.responded_by ?? null,
    trainer: row?.trainer
      ? {
          id: row.trainer?.id ?? null,
          name: row.trainer?.name ?? null,
          email: row.trainer?.email ?? null,
        }
      : null,
    client: row?.client
      ? {
          id: row.client?.id ?? null,
          name: row.client?.name ?? null,
          email: row.client?.email ?? null,
        }
      : null,
  };
}

export function proposedInterval(row: SessionRequestRecord) {
  const start = normalizeDate(row.proposed_start ?? undefined);
  const end = normalizeDate(row.proposed_end ?? undefined);
  return start && end ? { start, end } : null;
}

export function requestedInterval(row: SessionRequestRecord) {
  const start = normalizeDate(row.requested_start ?? undefined);
  const end = normalizeDate(row.requested_end ?? undefined);
  return start && end ? { start, end } : null;
}
