import {
  type TrainerWorkoutRecord,
  type TrainerWorkoutsDashboardData,
  type TrainerWorkoutAttendanceKey,
  type TrainerWorkoutDistributionStat,
  type TrainerWorkoutTimelinePoint,
  type TrainerWorkoutHeroMetric,
  type TrainerWorkoutHighlight,
  type TrainerWorkoutClientSnapshot,
  type TrainerWorkoutTableRow,
} from './types';

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const HOUR_MS = 3_600_000;

const dayFormatter = new Intl.DateTimeFormat('pt-PT', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('pt-PT', {
  hour: '2-digit',
  minute: '2-digit',
});

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const hourFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 });

const ATTENDANCE_TOKENS: Record<TrainerWorkoutAttendanceKey, { label: string; tone: 'positive' | 'warning' | 'critical' | 'neutral' }> = {
  upcoming: { label: 'Por realizar', tone: 'warning' },
  completed: { label: 'Concluída', tone: 'positive' },
  confirmed: { label: 'Confirmada', tone: 'positive' },
  pending: { label: 'Por confirmar', tone: 'warning' },
  cancelled: { label: 'Cancelada', tone: 'critical' },
  no_show: { label: 'Falta', tone: 'critical' },
  unknown: { label: 'Indefinida', tone: 'neutral' },
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDayLabel(date: Date) {
  return dayFormatter.format(date);
}

function formatDateTime(value: string | null) {
  const date = parseDate(value);
  if (!date) return '—';
  return dateTimeFormatter.format(date);
}

function formatTimeRange(start: Date | null, end: Date | null) {
  if (!start) return '—';
  const startLabel = dateTimeFormatter.format(start);
  if (!end) return startLabel;
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${startLabel} · ${timeFormatter.format(end)}`;
  }
  return `${startLabel} → ${dateTimeFormatter.format(end)}`;
}

function toHours(record: TrainerWorkoutRecord): number {
  if (record.durationMinutes && Number.isFinite(record.durationMinutes)) {
    return Math.max(0.5, record.durationMinutes / 60);
  }
  const start = parseDate(record.startAt);
  const end = parseDate(record.endAt);
  if (start && end) {
    const diff = (end.getTime() - start.getTime()) / HOUR_MS;
    if (Number.isFinite(diff) && diff > 0) return diff;
  }
  return 1;
}

function formatDuration(record: TrainerWorkoutRecord): string {
  if (record.durationMinutes && record.durationMinutes > 0) {
    return `${record.durationMinutes} min`;
  }
  const start = parseDate(record.startAt);
  const end = parseDate(record.endAt);
  if (start && end) {
    const diff = Math.round((end.getTime() - start.getTime()) / 60_000);
    if (Number.isFinite(diff) && diff > 0) {
      return `${diff} min`;
    }
  }
  return '—';
}

function formatTrend(current: number, previous: number, options: { percentage?: boolean } = {}) {
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return 'Sem variação';
  const sign = diff > 0 ? '+' : '−';
  const abs = Math.abs(diff);
  if (options.percentage) {
    return `${sign}${abs.toFixed(1).replace('.', ',')} pp vs. período anterior`;
  }
  return `${sign}${numberFormatter.format(Math.round(abs))} vs. período anterior`;
}

function normaliseAttendance(
  record: TrainerWorkoutRecord,
  now: Date,
  startTime: Date | null,
): TrainerWorkoutAttendanceKey {
  const raw = (record.attendanceStatus ?? record.status ?? '').toString().trim().toUpperCase();
  if (!raw && startTime) {
    return startTime.getTime() >= now.getTime() ? 'upcoming' : 'unknown';
  }

  switch (raw) {
    case 'DONE':
    case 'COMPLETED':
    case 'FINISHED':
    case 'REALIZED':
      return 'completed';
    case 'CONFIRMED':
    case 'APPROVED':
    case 'SCHEDULED':
      return startTime && startTime.getTime() >= now.getTime() ? 'confirmed' : 'completed';
    case 'PENDING':
    case 'AWAITING':
    case 'WAITING':
      return startTime && startTime.getTime() >= now.getTime() ? 'pending' : 'unknown';
    case 'CANCELLED':
    case 'CANCELED':
    case 'CANCELLED_BY_CLIENT':
    case 'CANCELLED_BY_TRAINER':
      return 'cancelled';
    case 'NO_SHOW':
    case 'MISSED':
    case 'ABSENT':
      return 'no_show';
    case 'UPCOMING':
      return 'upcoming';
    default:
      return startTime && startTime.getTime() >= now.getTime() ? 'upcoming' : 'unknown';
  }
}

function addDistribution(
  distribution: Map<TrainerWorkoutAttendanceKey, TrainerWorkoutDistributionStat>,
  key: TrainerWorkoutAttendanceKey,
) {
  const token = ATTENDANCE_TOKENS[key];
  if (!distribution.has(key)) {
    distribution.set(key, {
      id: key,
      label: token.label,
      tone: token.tone,
      count: 0,
      percentage: 0,
    });
  }
  const stat = distribution.get(key);
  if (stat) stat.count += 1;
}

function describeAttendance(key: TrainerWorkoutAttendanceKey) {
  return ATTENDANCE_TOKENS[key];
}

function toTableRow(
  record: TrainerWorkoutRecord,
  attendance: TrainerWorkoutAttendanceKey,
  start: Date | null,
): TrainerWorkoutTableRow {
  const descriptor = describeAttendance(attendance);
  return {
    id: record.id,
    title: record.title?.trim() || 'Sessão sem título',
    startAt: record.startAt,
    startLabel: start ? formatTimeRange(start, parseDate(record.endAt)) : '—',
    durationLabel: formatDuration(record),
    clientName: record.clientName?.trim() || 'Cliente sem nome',
    clientEmail: record.clientEmail ?? null,
    attendance,
    attendanceLabel: descriptor.label,
    attendanceTone: descriptor.tone,
    location: record.location ?? null,
    planTitle: record.planTitle ?? null,
    notes: record.notes ?? null,
  } satisfies TrainerWorkoutTableRow;
}

type ClientAccumulator = {
  id: string;
  name: string;
  email: string | null;
  upcoming: number;
  completed: number;
  total: number;
  nextSessionAt: Date | null;
};

function ensureClient(
  map: Map<string, ClientAccumulator>,
  record: TrainerWorkoutRecord,
  start: Date | null,
): ClientAccumulator {
  const key = record.clientId ?? record.clientEmail ?? record.clientName ?? record.id;
  const existing = map.get(key);
  if (existing) return existing;
  const acc: ClientAccumulator = {
    id: record.clientId ?? key,
    name: record.clientName?.trim() || 'Cliente sem nome',
    email: record.clientEmail ?? null,
    upcoming: 0,
    completed: 0,
    total: 0,
    nextSessionAt: start,
  };
  map.set(key, acc);
  return acc;
}

function computeClientTone(rate: number, upcoming: number): 'positive' | 'warning' | 'critical' | 'neutral' {
  if (rate >= 0.8) return 'positive';
  if (rate >= 0.6) return upcoming > 0 ? 'neutral' : 'positive';
  if (rate >= 0.4) return 'warning';
  return 'critical';
}

export function buildTrainerWorkoutsDashboard(
  rows: TrainerWorkoutRecord[],
  opts: { now?: Date | string | number; supabase?: boolean } = {},
): TrainerWorkoutsDashboardData {
  const nowDate = opts.now ? new Date(opts.now) : new Date();
  const now = Number.isNaN(nowDate.getTime()) ? new Date() : nowDate;
  const today = startOfDay(now);

  const timelineDays = 14;
  const timelineStart = new Date(today.getTime() - 6 * DAY_MS);
  const timeline: TrainerWorkoutTimelinePoint[] = [];
  const timelineMap = new Map<string, TrainerWorkoutTimelinePoint>();
  for (let i = 0; i < timelineDays; i += 1) {
    const day = new Date(timelineStart.getTime() + i * DAY_MS);
    const key = day.toISOString().slice(0, 10);
    const point: TrainerWorkoutTimelinePoint = {
      date: key,
      label: formatDayLabel(day),
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    };
    timeline.push(point);
    timelineMap.set(key, point);
  }

  const distribution = new Map<TrainerWorkoutAttendanceKey, TrainerWorkoutDistributionStat>();
  const clients = new Map<string, ClientAccumulator>();

  let nextSession: TrainerWorkoutTableRow | null = null;
  let nextSessionTime = Number.POSITIVE_INFINITY;

  let upcomingCount = 0;
  let prevUpcomingCount = 0;
  let completed7d = 0;
  let completedPrev7d = 0;
  let hours7d = 0;
  let hoursPrev7d = 0;
  let activeClientsUpcoming = new Set<string>();
  let activeClientsPrev = new Set<string>();
  let positiveAttendance = 0;
  let consideredAttendance = 0;
  let cancelledLast30 = 0;
  let totalLast30 = 0;

  const upcomingRows: TrainerWorkoutTableRow[] = [];

  const nowMs = now.getTime();
  const upcomingWindowEnd = nowMs + WEEK_MS;
  const prevWindowStart = nowMs - WEEK_MS;
  const last7dStart = nowMs - WEEK_MS;
  const prev7dStart = nowMs - 2 * WEEK_MS;
  const futureClientsWindow = nowMs + 14 * DAY_MS;
  const pastClientsWindow = nowMs - 14 * DAY_MS;
  const last30dStart = nowMs - 30 * DAY_MS;

  rows.forEach((record) => {
    const start = parseDate(record.startAt);
    const attendance = normaliseAttendance(record, now, start);
    addDistribution(distribution, attendance);

    const hours = toHours(record);
    const startTime = start?.getTime() ?? null;

    if (startTime !== null) {
      const key = start.toISOString().slice(0, 10);
      const point = timelineMap.get(key);
      if (point) {
        point.scheduled += 1;
        if (attendance === 'completed' || attendance === 'confirmed') {
          point.completed += 1;
        }
        if (attendance === 'cancelled' || attendance === 'no_show') {
          point.cancelled += 1;
        }
      }

      if (startTime >= nowMs && startTime <= upcomingWindowEnd) {
        upcomingCount += 1;
      } else if (startTime >= prevWindowStart && startTime < nowMs) {
        prevUpcomingCount += 1;
      }

      if (startTime >= last7dStart && startTime <= nowMs) {
        hours7d += hours;
        if (attendance === 'completed' || attendance === 'confirmed') {
          completed7d += 1;
        }
      } else if (startTime >= prev7dStart && startTime < last7dStart) {
        hoursPrev7d += hours;
        if (attendance === 'completed' || attendance === 'confirmed') {
          completedPrev7d += 1;
        }
      }

      if (attendance === 'completed' || attendance === 'confirmed') {
        positiveAttendance += 1;
      }
      consideredAttendance += 1;

      if (attendance === 'cancelled' || attendance === 'no_show') {
        if (startTime >= last30dStart && startTime <= nowMs) {
          cancelledLast30 += 1;
        }
      }
      if (startTime >= last30dStart && startTime <= nowMs) {
        totalLast30 += 1;
      }

      if (startTime >= nowMs - 45 * 60_000) {
        const row = toTableRow(record, attendance, start);
        upcomingRows.push(row);
        if (startTime >= nowMs && startTime < nextSessionTime) {
          nextSession = row;
          nextSessionTime = startTime;
        }
      }

      if (startTime >= nowMs && startTime <= futureClientsWindow) {
        const clientKey = record.clientId ?? record.clientEmail ?? record.clientName ?? record.id;
        activeClientsUpcoming.add(clientKey);
      }
      if (startTime >= pastClientsWindow && startTime < nowMs) {
        const clientKey = record.clientId ?? record.clientEmail ?? record.clientName ?? record.id;
        activeClientsPrev.add(clientKey);
      }
    }

    const client = ensureClient(clients, record, start);
    client.total += 1;
    if (attendance === 'completed' || attendance === 'confirmed') {
      client.completed += 1;
    }
    if (attendance === 'upcoming' || attendance === 'pending' || attendance === 'confirmed') {
      client.upcoming += startTime !== null && startTime >= nowMs ? 1 : 0;
      if (!client.nextSessionAt || (start && start < client.nextSessionAt && startTime && startTime >= nowMs)) {
        client.nextSessionAt = start ?? client.nextSessionAt;
      }
    }
    if (!client.nextSessionAt && start && startTime && startTime >= nowMs) {
      client.nextSessionAt = start;
    }
  });

  const distributionArray = Array.from(distribution.values());
  const totalDistribution = distributionArray.reduce((sum, stat) => sum + stat.count, 0) || 1;
  distributionArray.forEach((stat) => {
    stat.percentage = Number(((stat.count / totalDistribution) * 100).toFixed(1));
  });

  upcomingRows.sort((a, b) => {
    const timeA = parseDate(a.startAt)?.getTime() ?? Number.POSITIVE_INFINITY;
    const timeB = parseDate(b.startAt)?.getTime() ?? Number.POSITIVE_INFINITY;
    return timeA - timeB;
  });

  const clientSnapshots: TrainerWorkoutClientSnapshot[] = Array.from(clients.values())
    .map((client) => {
      const rate = client.total ? client.completed / client.total : 0;
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        upcoming: client.upcoming,
        completed: client.completed,
        completionRate: Number(rate.toFixed(2)),
        nextSessionAt: client.nextSessionAt ? client.nextSessionAt.toISOString() : null,
        nextSessionLabel: client.nextSessionAt ? formatDateTime(client.nextSessionAt.toISOString()) : '—',
        tone: computeClientTone(rate, client.upcoming),
      } satisfies TrainerWorkoutClientSnapshot;
    })
    .sort((a, b) => {
      if (b.upcoming !== a.upcoming) return b.upcoming - a.upcoming;
      if (b.completed !== a.completed) return b.completed - a.completed;
      return (a.name ?? '').localeCompare(b.name ?? '');
    })
    .slice(0, 8);

  const completionRate = consideredAttendance ? (positiveAttendance / consideredAttendance) * 100 : 0;
  const cancellationRate = totalLast30 ? (cancelledLast30 / totalLast30) * 100 : 0;

  const hero: TrainerWorkoutHeroMetric[] = [
    {
      id: 'upcoming-week',
      label: 'Treinos nos próximos 7 dias',
      value: numberFormatter.format(upcomingCount),
      trend: formatTrend(upcomingCount, prevUpcomingCount),
      tone: upcomingCount >= prevUpcomingCount ? 'positive' : 'warning',
    },
    {
      id: 'completed-week',
      label: 'Treinos concluídos (7d)',
      value: numberFormatter.format(completed7d),
      trend: formatTrend(completed7d, completedPrev7d),
      tone: completed7d >= completedPrev7d ? 'positive' : 'warning',
    },
    {
      id: 'hours-week',
      label: 'Horas planeadas (7d)',
      value: `${hourFormatter.format(hours7d)} h`,
      trend: formatTrend(hours7d, hoursPrev7d),
      tone: hours7d >= hoursPrev7d ? 'positive' : 'warning',
    },
    {
      id: 'active-clients',
      label: 'Clientes ativos (14d)',
      value: numberFormatter.format(activeClientsUpcoming.size),
      trend: formatTrend(activeClientsUpcoming.size, activeClientsPrev.size),
      tone: activeClientsUpcoming.size >= activeClientsPrev.size ? 'positive' : 'warning',
    },
  ];

  const highlights: TrainerWorkoutHighlight[] = [];
  if (nextSession) {
    highlights.push({
      id: 'next-session',
      title: 'Próximo treino agendado',
      description: `${nextSession.title} com ${nextSession.clientName}`,
      tone: 'positive',
      meta: nextSession.startLabel,
    });
  }

  const topClient = clientSnapshots[0];
  if (topClient) {
    highlights.push({
      id: 'top-client',
      title: 'Cliente mais envolvido',
      description: `${topClient.name} participou em ${numberFormatter.format(topClient.completed)} treinos recentes`,
      tone: topClient.tone,
      meta: `${Math.round(topClient.completionRate * 100) / 100 >= 1 ? '100' : (topClient.completionRate * 100).toFixed(0)}% taxa de conclusão`,
    });
  }

  const futureBusyDay = timeline
    .filter((point) => parseDate(point.date)?.getTime() ?? 0 >= nowMs)
    .sort((a, b) => b.scheduled - a.scheduled)[0];
  if (futureBusyDay && futureBusyDay.scheduled > 0) {
    highlights.push({
      id: 'busiest-day',
      title: 'Dia com mais treinos agendados',
      description: `${futureBusyDay.scheduled} sessões`,
      tone: 'neutral',
      meta: futureBusyDay.label,
    });
  }

  highlights.push({
    id: 'attendance-rate',
    title: 'Taxa de assiduidade (30d)',
    description: `${completionRate.toFixed(1).replace('.', ',')}% de treinos confirmados/concluídos`,
    tone: completionRate >= 80 ? 'positive' : completionRate >= 60 ? 'neutral' : 'warning',
    meta: `${cancellationRate.toFixed(1).replace('.', ',')}% cancelados/faltas`,
  });

  const rowsTable = upcomingRows.slice(0, 30);

  return {
    updatedAt: new Date().toISOString(),
    supabase: opts.supabase ?? true,
    hero,
    distribution: distributionArray,
    timeline,
    highlights,
    clients: clientSnapshots,
    rows: rowsTable,
  } satisfies TrainerWorkoutsDashboardData;
}
