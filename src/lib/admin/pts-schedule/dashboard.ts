import type { SupabaseClient } from '@supabase/supabase-js';

import {
  type AdminPtsScheduleRecord,
  type AdminPtsScheduleDashboardData,
  type AdminPtsScheduleSessionView,
  type AdminPtsScheduleStatusSummary,
  type AdminPtsScheduleTrainerSummary,
  type AdminPtsScheduleHeroMetric,
} from './types';

const DATE_TIME = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const DAY_LABEL = new Intl.DateTimeFormat('pt-PT', {
  weekday: 'long',
  day: '2-digit',
  month: 'short',
});

const RANGE_LABEL = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
});

const NUMBER = new Intl.NumberFormat('pt-PT', {
  maximumFractionDigits: 0,
});

const DURATION = new Intl.NumberFormat('pt-PT', {
  maximumFractionDigits: 1,
});

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function personLabel(person: AdminPtsScheduleRecord['trainer']): string {
  if (!person) return '—';
  if (person.name && person.email) return `${person.name} (${person.email})`;
  if (person.name) return person.name;
  if (person.email) return person.email;
  if (person.id) return `ID ${person.id}`;
  return '—';
}

function statusMeta(status: string | null | undefined): {
  id: string;
  label: string;
  tone: 'ok' | 'warn' | 'down' | 'neutral';
} {
  const normalized = (status ?? 'sem-estado').toLowerCase();
  switch (normalized) {
    case 'scheduled':
    case 'agendado':
      return { id: 'scheduled', label: 'Agendado', tone: 'warn' };
    case 'confirmed':
      return { id: 'confirmed', label: 'Confirmado', tone: 'ok' };
    case 'done':
    case 'completed':
      return { id: 'done', label: 'Concluído', tone: 'ok' };
    case 'cancelled':
    case 'canceled':
      return { id: 'cancelled', label: 'Cancelado', tone: 'down' };
    case 'missed':
      return { id: 'missed', label: 'Faltou', tone: 'down' };
    default:
      return { id: normalized, label: status ?? 'Sem estado', tone: 'neutral' };
  }
}

function durationBetween(start: Date | null, end: Date | null, fallbackMinutes: number | null): number | null {
  if (fallbackMinutes && Number.isFinite(fallbackMinutes)) return fallbackMinutes;
  if (!start || !end) return null;
  const diff = (end.getTime() - start.getTime()) / 60000;
  if (!Number.isFinite(diff) || diff <= 0) return null;
  return diff;
}

function formatDurationLabel(minutes: number | null): string | null {
  if (!minutes || !Number.isFinite(minutes)) return null;
  if (minutes >= 60) {
    const hours = minutes / 60;
    return `${DURATION.format(hours)} h`;
  }
  return `${NUMBER.format(minutes)} min`;
}

function buildSessions(records: AdminPtsScheduleRecord[]): AdminPtsScheduleSessionView[] {
  return records
    .map((record) => {
      const startDate = parseDate(record.start);
      const endDate = parseDate(record.end);
      const status = statusMeta(record.status);
      const range = startDate
        ? `${DATE_TIME.format(startDate)}${endDate ? ` — ${DATE_TIME.format(endDate)}` : ''}`
        : 'Sem data definida';
      const durationMinutes = durationBetween(startDate, endDate, record.durationMinutes);

      return {
        id: record.id,
        start: record.start,
        end: record.end,
        startLabel: startDate ? DATE_TIME.format(startDate) : 'Sem data',
        rangeLabel: range,
        trainerId: record.trainer?.id ?? null,
        trainerName: personLabel(record.trainer),
        clientId: record.client?.id ?? null,
        clientName: personLabel(record.client),
        status: status.id,
        statusLabel: status.label,
        statusTone: status.tone,
        location: record.location ?? null,
        notes: record.notes ?? null,
        durationLabel: formatDurationLabel(durationMinutes),
      } satisfies AdminPtsScheduleSessionView;
    })
    .sort((a, b) => {
      if (!a.start && !b.start) return a.id.localeCompare(b.id);
      if (!a.start) return 1;
      if (!b.start) return -1;
      return a.start.localeCompare(b.start);
    });
}

function buildStatusSummary(records: AdminPtsScheduleRecord[]): AdminPtsScheduleStatusSummary[] {
  const map = new Map<string, { label: string; tone: 'ok' | 'warn' | 'down' | 'neutral'; count: number }>();
  let total = 0;

  records.forEach((record) => {
    const status = statusMeta(record.status);
    const current = map.get(status.id) ?? { label: status.label, tone: status.tone, count: 0 };
    current.count += 1;
    map.set(status.id, current);
    total += 1;
  });

  const summary: AdminPtsScheduleStatusSummary[] = [
    { id: 'all', label: 'Todas', count: total, tone: 'neutral' },
  ];

  for (const [id, value] of map.entries()) {
    summary.push({ id, label: value.label, count: value.count, tone: value.tone });
  }

  return summary.sort((a, b) => (a.id === 'all' ? -1 : b.id === 'all' ? 1 : b.count - a.count));
}

function buildTrainerSummary(records: AdminPtsScheduleRecord[], now: Date): AdminPtsScheduleTrainerSummary[] {
  const map = new Map<string, {
    name: string;
    sessions: number;
    clients: Set<string>;
    nextSession: string | null;
  }>();

  records.forEach((record) => {
    const trainerId = record.trainer?.id ?? 'sem-trainer';
    const entry = map.get(trainerId) ?? {
      name: record.trainer?.name ?? record.trainer?.email ?? (trainerId === 'sem-trainer' ? 'Sem PT atribuído' : trainerId),
      sessions: 0,
      clients: new Set<string>(),
      nextSession: null,
    };
    entry.sessions += 1;
    if (record.client?.id) entry.clients.add(record.client.id);

    const startDate = parseDate(record.start);
    if (startDate && startDate >= now) {
      const iso = startDate.toISOString();
      if (!entry.nextSession || iso < entry.nextSession) {
        entry.nextSession = iso;
      }
    }

    map.set(trainerId, entry);
  });

  const summaries: AdminPtsScheduleTrainerSummary[] = Array.from(map.entries())
    .map(([id, value]) => ({
      id,
      name: value.name,
      sessions: value.sessions,
      uniqueClients: value.clients.size,
      nextSessionLabel: value.nextSession ? DATE_TIME.format(new Date(value.nextSession)) : null,
    }))
    .sort((a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name, 'pt-PT'));

  return summaries;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function buildHeroMetrics(records: AdminPtsScheduleRecord[], now: Date): AdminPtsScheduleHeroMetric[] {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const nextSevenEnd = endOfDay(new Date(now.getTime() + 6 * 86_400_000));
  const lastSevenStart = startOfDay(new Date(now.getTime() - 6 * 86_400_000));

  let todayCount = 0;
  let nextSeven = 0;
  let concluded = 0;
  let cancelled = 0;
  let plannedMinutes = 0;

  records.forEach((record) => {
    const startDate = parseDate(record.start);
    if (!startDate) return;

    const duration = durationBetween(startDate, parseDate(record.end), record.durationMinutes);
    if (duration) {
      const rangeEnd = new Date(now.getTime() + 7 * 86_400_000);
      if (startDate >= now && startDate <= rangeEnd) {
        plannedMinutes += duration;
      }
    }

    if (startDate >= todayStart && startDate <= todayEnd) {
      todayCount += 1;
    }
    if (startDate >= now && startDate <= nextSevenEnd) {
      if (statusMeta(record.status).id !== 'cancelled') {
        nextSeven += 1;
      }
    }
    if (startDate >= lastSevenStart && startDate < now) {
      const status = statusMeta(record.status).id;
      if (status === 'done') concluded += 1;
      if (status === 'cancelled') cancelled += 1;
    }
  });

  const plannedHours = plannedMinutes ? plannedMinutes / 60 : 0;

  const hero: AdminPtsScheduleHeroMetric[] = [
    {
      id: 'today',
      label: 'Sessões hoje',
      value: NUMBER.format(todayCount),
      hint: todayCount ? 'Confirma presenças e notas antes do fecho.' : 'Agenda livre hoje.',
      tone: todayCount ? 'primary' : 'neutral',
    },
    {
      id: 'upcoming',
      label: 'Próximos 7 dias',
      value: NUMBER.format(nextSeven),
      hint: nextSeven ? 'Inclui sessões confirmadas e por confirmar.' : 'Agenda vazia — planeia novos treinos.',
      tone: nextSeven ? 'warning' : 'neutral',
    },
    {
      id: 'concluded',
      label: 'Concluídas (7d)',
      value: NUMBER.format(concluded),
      hint: concluded ? 'Mantém o registo actualizado para relatórios.' : 'Sem sessões concluídas nos últimos dias.',
      tone: concluded ? 'success' : 'neutral',
    },
    {
      id: 'planned-hours',
      label: 'Horas planeadas (7d)',
      value: plannedHours ? DURATION.format(plannedHours) : '0',
      hint: plannedHours ? 'Soma estimada das próximas sessões.' : 'Sem carga horária agendada.',
      tone: plannedHours ? 'primary' : 'neutral',
    },
    {
      id: 'cancelled',
      label: 'Canceladas (7d)',
      value: NUMBER.format(cancelled),
      hint: cancelled ? 'Revê pedidos de reagendamento e comunica com os clientes.' : 'Sem cancelamentos recentes.',
      tone: cancelled ? 'danger' : 'neutral',
    },
  ];

  return hero;
}

type BuildOptions = {
  now?: Date;
  supabaseConfigured: boolean;
  rangeStart: Date;
  rangeEnd: Date;
  generatedAt?: Date;
};

export function buildAdminPtsScheduleDashboard(
  records: AdminPtsScheduleRecord[],
  opts: BuildOptions,
): AdminPtsScheduleDashboardData {
  const now = opts.now ?? new Date();
  const filtered = records.filter((record) => {
    const startDate = parseDate(record.start);
    if (!startDate) return false;
    return startDate >= opts.rangeStart && startDate <= opts.rangeEnd;
  });

  const sessions = buildSessions(filtered);
  const statuses = buildStatusSummary(filtered);
  const trainers = buildTrainerSummary(filtered, now);
  const hero = buildHeroMetrics(records, now);

  const updatedAt = records.reduce<string | null>((acc, record) => {
    const dates = [record.updatedAt, record.createdAt].filter(Boolean) as string[];
    for (const candidate of dates) {
      if (!acc || candidate > acc) acc = candidate;
    }
    return acc;
  }, null);

  const generatedAt = opts.generatedAt?.toISOString() ?? new Date().toISOString();

  return {
    generatedAt,
    updatedAt,
    supabaseConfigured: opts.supabaseConfigured,
    rangeStart: opts.rangeStart.toISOString(),
    rangeEnd: opts.rangeEnd.toISOString(),
    rangeLabel: `${RANGE_LABEL.format(opts.rangeStart)} — ${RANGE_LABEL.format(opts.rangeEnd)}`,
    hero,
    statuses,
    trainers,
    sessions,
  } satisfies AdminPtsScheduleDashboardData;
}

type LoaderOptions = {
  now?: Date;
  rangeDays?: number;
  lookbackDays?: number;
  limit?: number;
};

export async function loadAdminPtsScheduleDashboard(
  sb: SupabaseClient,
  opts: LoaderOptions = {},
): Promise<AdminPtsScheduleDashboardData> {
  const now = opts.now ?? new Date();
  const lookback = Math.max(0, opts.lookbackDays ?? 3);
  const rangeDays = Math.max(1, opts.rangeDays ?? 14);
  const rangeStart = startOfDay(new Date(now.getTime() - lookback * 86_400_000));
  const rangeEnd = endOfDay(new Date(now.getTime() + rangeDays * 86_400_000));

  const { data, error } = await sb
    .from('sessions')
    .select(
      `id,start_time,end_time,status,location,notes,duration_min,created_at,updated_at,
        trainer:trainer_id(id,full_name,email,name),
        client:client_id(id,full_name,email,name)`
    )
    .gte('start_time', rangeStart.toISOString())
    .lt('start_time', rangeEnd.toISOString())
    .order('start_time', { ascending: true })
    .limit(opts.limit ?? 400);

  if (error) throw error;

  const records: AdminPtsScheduleRecord[] = (data ?? []).map((row: any) => {
    const trainer = row.trainer ?? row.trainer_id ?? null;
    const client = row.client ?? row.client_id ?? null;
    return {
      id: String(row.id ?? crypto.randomUUID()),
      start: row.start_time ?? row.start ?? row.scheduled_at ?? null,
      end: row.end_time ?? row.end ?? row.ends_at ?? null,
      status: row.status ?? row.state ?? null,
      location: row.location ?? row.place ?? null,
      notes: row.notes ?? row.note ?? null,
      durationMinutes: Number.isFinite(row.duration_min) ? Number(row.duration_min) : null,
      createdAt: row.created_at ?? null,
      updatedAt: row.updated_at ?? null,
      trainer: trainer
        ? {
            id: String(trainer.id ?? trainer.trainer_id ?? ''),
            name: trainer.full_name ?? trainer.name ?? null,
            email: trainer.email ?? null,
          }
        : null,
      client: client
        ? {
            id: String(client.id ?? client.client_id ?? ''),
            name: client.full_name ?? client.name ?? null,
            email: client.email ?? null,
          }
        : null,
    } satisfies AdminPtsScheduleRecord;
  });

  return buildAdminPtsScheduleDashboard(records, {
    now,
    supabaseConfigured: true,
    rangeStart,
    rangeEnd,
    generatedAt: now,
  });
}
