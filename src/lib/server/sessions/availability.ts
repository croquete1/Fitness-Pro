// src/lib/server/sessions/availability.ts
import { addMinutes, isBefore } from 'date-fns';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type SessionsTable = Database['public']['Tables']['sessions']['Row'];
type DayOffTable = Database['public']['Tables']['pt_days_off']['Row'];

type CheckOptions = {
  excludeSessionId?: string | null;
};

export type AvailabilityConflict =
  | { type: 'session'; id: string; start: string; end: string; title?: string | null }
  | { type: 'day_off'; id: string; start: string; end: string; title?: string | null };

export type AvailabilityResult = {
  ok: boolean;
  conflicts: AvailabilityConflict[];
};

function parseSession(row: SessionsTable) {
  const startIso = (row as any).start_at ?? (row as any).scheduled_at ?? null;
  if (!startIso) return null;
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return null;

  let end: Date | null = null;
  const endIso = (row as any).end_at ?? null;
  if (endIso) {
    const parsed = new Date(endIso);
    if (!Number.isNaN(parsed.getTime())) end = parsed;
  }

  if (!end) {
    const duration = Number((row as any).duration_min ?? 0);
    if (duration > 0) end = addMinutes(start, duration);
  }

  if (!end) {
    end = addMinutes(start, 60);
  }

  return { start, end, title: (row as any).title ?? null, id: String(row.id) };
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

function dayStringsBetween(start: Date, end: Date) {
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const limit = new Date(end);
  limit.setHours(0, 0, 0, 0);

  const days = new Set<string>();
  while (cursor <= limit) {
    const iso = cursor.toISOString().slice(0, 10);
    days.add(iso);
    cursor.setDate(cursor.getDate() + 1);
  }
  return Array.from(days);
}

function resolveDayOffWindow(day: DayOffTable) {
  const base = new Date(`${day.date}T00:00:00`);
  const [sh, sm] = String(day.start_time ?? '00:00').split(':').map(Number);
  const [eh, em] = String(day.end_time ?? '23:59').split(':').map(Number);

  const start = new Date(base);
  start.setHours(sh || 0, sm || 0, 0, 0);

  const end = new Date(base);
  end.setHours(eh || 23, em || 59, 59, 999);

  return { start, end };
}

export async function checkTrainerAvailability(
  sb: SupabaseClient<Database>,
  trainerId: string,
  start: Date,
  end: Date,
  opts: CheckOptions = {},
): Promise<AvailabilityResult> {
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
    throw new Error('Invalid start date');
  }
  if (!(end instanceof Date) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid end date');
  }
  if (!isBefore(start, end)) {
    throw new Error('Start must be before end');
  }

  const windowStart = new Date(start);
  windowStart.setHours(windowStart.getHours() - 4);
  const windowEnd = new Date(end);
  windowEnd.setHours(windowEnd.getHours() + 4);

  const sessionRes = await sb
    .from('sessions' as any)
    .select('*')
    .eq('trainer_id', trainerId)
    .gte('start_at', windowStart.toISOString())
    .lte('start_at', windowEnd.toISOString());

  if (sessionRes.error) {
    throw sessionRes.error;
  }

  const sessionRows = ((sessionRes.data ?? []) as unknown) as SessionsTable[];

  const conflicts: AvailabilityConflict[] = [];

  for (const raw of sessionRows) {
    if (opts.excludeSessionId && raw.id === opts.excludeSessionId) continue;
    const parsed = parseSession(raw);
    if (!parsed) continue;
    if (overlaps(start, end, parsed.start, parsed.end)) {
      conflicts.push({
        type: 'session',
        id: parsed.id,
        start: parsed.start.toISOString(),
        end: parsed.end.toISOString(),
        title: parsed.title,
      });
    }
  }

  const dates = dayStringsBetween(start, end);
  if (dates.length) {
    const dayOffRes = await sb
      .from('pt_days_off' as any)
      .select('*')
      .eq('trainer_id', trainerId)
      .in('date', dates);

    if (dayOffRes.error) {
      throw dayOffRes.error;
    }

    const dayOffRows = ((dayOffRes.data ?? []) as unknown) as DayOffTable[];

    for (const day of dayOffRows) {
      const { start: offStart, end: offEnd } = resolveDayOffWindow(day);
      if (overlaps(start, end, offStart, offEnd)) {
        conflicts.push({
          type: 'day_off',
          id: String(day.id),
          start: offStart.toISOString(),
          end: offEnd.toISOString(),
          title: (day as any).reason ?? null,
        });
      }
    }
  }

  return { ok: conflicts.length === 0, conflicts };
}

export async function assertTrainerAvailability(
  sb: SupabaseClient<Database>,
  trainerId: string,
  start: Date,
  end: Date,
  opts: CheckOptions = {},
) {
  const result = await checkTrainerAvailability(sb, trainerId, start, end, opts);
  if (!result.ok) {
    const conflictMsg = result.conflicts
      .map((c) =>
        c.type === 'session'
          ? `Outra sessão (${c.title ?? 'Sessão'}) entre ${new Date(c.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : `Folga ou bloqueio (${c.title ?? 'Folga'})`)
      .join('; ');
    throw new Error(conflictMsg || 'Conflito na agenda do treinador');
  }
  return result;
}
