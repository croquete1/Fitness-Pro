import type {
  ClientSession,
  SessionActivity,
  SessionAttendanceStat,
  SessionDashboardData,
  SessionRequest,
  SessionRequestStat,
  SessionTimelinePoint,
  SessionTrainerStat,
} from './types';

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const HALF_HOUR_MS = 1_800_000;
const WEEK_MS = 7 * DAY_MS;

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isoDay(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

function toHours(session: ClientSession): number {
  if (session.durationMin && session.durationMin > 0) {
    return session.durationMin / 60;
  }
  const start = parseDate(session.startISO);
  const end = parseDate(session.endISO);
  if (start && end) {
    const diff = (end.getTime() - start.getTime()) / HOUR_MS;
    if (Number.isFinite(diff) && diff > 0) {
      return diff;
    }
  }
  return 1;
}

function attendanceDescriptor(session: ClientSession) {
  const status = (session.attendanceStatus ?? 'pending').toString().toLowerCase();
  switch (status) {
    case 'confirmed':
      return { key: 'confirmed', label: 'Confirmadas', tone: 'primary' as const };
    case 'completed':
      return { key: 'completed', label: 'Concluídas', tone: 'success' as const };
    case 'cancelled':
      return { key: 'cancelled', label: 'Canceladas', tone: 'danger' as const };
    case 'no_show':
      return { key: 'no_show', label: 'Faltas', tone: 'danger' as const };
    default:
      return { key: 'pending', label: 'Por confirmar', tone: 'warning' as const };
  }
}

function normaliseRequestStatus(status: SessionRequest['status']) {
  switch (status) {
    case 'accepted':
      return { key: 'accepted', label: 'Aceites', tone: 'success' as const };
    case 'declined':
    case 'cancelled':
    case 'reschedule_declined':
      return { key: 'declined', label: 'Recusados', tone: 'danger' as const };
    case 'reschedule_pending':
      return { key: 'reschedule_pending', label: 'Remarcações pendentes', tone: 'primary' as const };
    case 'pending':
    default:
      return { key: 'pending', label: 'Pendentes', tone: 'warning' as const };
  }
}

function formatDayLabel(value: string) {
  const date = parseDate(value);
  if (!date) return value;
  return date.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' });
}

function compareDescByDate(a: SessionActivity, b: SessionActivity) {
  const aDate = a.at ? parseDate(a.at)?.getTime() ?? -Infinity : -Infinity;
  const bDate = b.at ? parseDate(b.at)?.getTime() ?? -Infinity : -Infinity;
  return bDate - aDate;
}

function trainerKey(session: ClientSession): string {
  return (
    session.trainerId ??
    session.trainerEmail ??
    session.trainerName ??
    `unknown-${session.id}`
  );
}

export function buildClientSessionDashboard(
  sessions: ClientSession[],
  requests: SessionRequest[],
  opts: { supabase: boolean; now?: Date | string | number } = { supabase: true },
): SessionDashboardData {
  const now = opts.now ? new Date(opts.now) : new Date();
  const today = startOfDay(now);
  const timelineStart = new Date(today.getTime() - 13 * DAY_MS);

  const timelinePoints: SessionTimelinePoint[] = [];
  const timelineMap = new Map<string, SessionTimelinePoint>();
  for (let i = 0; i < 14; i += 1) {
    const day = new Date(timelineStart.getTime() + i * DAY_MS);
    const key = isoDay(day);
    const point: SessionTimelinePoint = { date: key, scheduled: 0, confirmed: 0, cancelled: 0 };
    timelinePoints.push(point);
    timelineMap.set(key, point);
  }

  let upcomingCount = 0;
  let nextSessionAt: string | null = null;
  let nextSessionTime = Number.POSITIVE_INFINITY;
  let attendancePositive = 0;
  let attendanceCancelled = 0;
  let hours7d = 0;
  let hoursPrev7d = 0;
  let lastCompletedAt: string | null = null;

  const attendanceMap = new Map<string, SessionAttendanceStat>();
  const trainerMap = new Map<string, SessionTrainerStat>();
  const activities: SessionActivity[] = [];

  const sevenDaysAgo = today.getTime() - WEEK_MS;
  const fourteenDaysAgo = today.getTime() - 2 * WEEK_MS;

  sessions.forEach((session) => {
    const descriptor = attendanceDescriptor(session);
    const existing = attendanceMap.get(descriptor.key) ?? {
      ...descriptor,
      count: 0,
      percentage: 0,
    };
    existing.count += 1;
    attendanceMap.set(descriptor.key, existing);

    const start = parseDate(session.startISO);
    const end = parseDate(session.endISO);
    const startTime = start?.getTime() ?? null;

    const trainerId = trainerKey(session);
    const trainer = trainerMap.get(trainerId) ?? {
      trainerId,
      trainerName: session.trainerName ?? null,
      trainerEmail: session.trainerEmail ?? null,
      total: 0,
      upcoming: 0,
      completed: 0,
    };
    trainer.total += 1;
    if (descriptor.key === 'completed') {
      trainer.completed += 1;
    }
    trainerMap.set(trainerId, trainer);

    if (startTime !== null) {
      const hours = toHours(session);
      if (startTime >= sevenDaysAgo && startTime <= today.getTime() + DAY_MS) {
        hours7d += hours;
      } else if (startTime >= fourteenDaysAgo && startTime < sevenDaysAgo) {
        hoursPrev7d += hours;
      }

      if (startTime >= today.getTime() - HALF_HOUR_MS) {
        upcomingCount += 1;
        trainer.upcoming += 1;
        if (startTime < nextSessionTime) {
          nextSessionTime = startTime;
          nextSessionAt = start?.toISOString() ?? null;
        }
      }

      if (timelineMap.has(isoDay(start))) {
        const point = timelineMap.get(isoDay(start));
        if (point) {
          point.scheduled += 1;
          if (descriptor.key === 'completed' || descriptor.key === 'confirmed') {
            point.confirmed += 1;
          }
          if (descriptor.key === 'cancelled' || descriptor.key === 'no_show') {
            point.cancelled += 1;
          }
        }
      }
    }

    if (descriptor.key === 'completed' || descriptor.key === 'confirmed') {
      attendancePositive += 1;
    }
    if (descriptor.key === 'cancelled' || descriptor.key === 'no_show') {
      attendanceCancelled += 1;
    }

    if (descriptor.key === 'completed' && (session.attendanceAt || end || start)) {
      const completedAt = session.attendanceAt ?? end?.toISOString() ?? start?.toISOString() ?? null;
      if (!lastCompletedAt) {
        lastCompletedAt = completedAt;
      } else if (completedAt) {
        const completedTime = parseDate(completedAt)?.getTime() ?? 0;
        const lastTime = parseDate(lastCompletedAt)?.getTime() ?? 0;
        if (completedTime > lastTime) {
          lastCompletedAt = completedAt;
        }
      }
    }

    if (startTime && startTime >= fourteenDaysAgo) {
      const future = startTime >= today.getTime() - HALF_HOUR_MS;
      const tone = descriptor.key === 'cancelled' || descriptor.key === 'no_show' ? 'danger' : descriptor.tone;
      activities.push({
        id: `session-${session.id}`,
        category: 'session',
        title: future ? 'Sessão agendada' : descriptor.label,
        description: [
          session.trainerName ?? session.trainerEmail ?? 'Personal trainer',
          session.location ?? 'Local a definir',
        ]
          .filter(Boolean)
          .join(' • '),
        at: start?.toISOString() ?? session.attendanceAt ?? session.endISO ?? session.startISO,
        tone,
      });
    }
  });

  const attendanceStats: SessionAttendanceStat[] = Array.from(attendanceMap.values()).map((item) => ({
    ...item,
    percentage: sessions.length > 0 ? Math.round((item.count / sessions.length) * 100) : 0,
  }));
  attendanceStats.sort((a, b) => b.count - a.count);

  const trainerStats: SessionTrainerStat[] = Array.from(trainerMap.values()).sort((a, b) => {
    if (b.upcoming !== a.upcoming) return b.upcoming - a.upcoming;
    if (b.total !== a.total) return b.total - a.total;
    return (b.completed ?? 0) - (a.completed ?? 0);
  });

  const requestMap = new Map<string, SessionRequestStat>();
  let openRequests = 0;

  requests.forEach((request) => {
    const descriptor = normaliseRequestStatus(request.status);
    const existing = requestMap.get(descriptor.key) ?? { ...descriptor, count: 0 };
    existing.count += 1;
    requestMap.set(descriptor.key, existing);

    const createdAt = request.createdAt ?? request.requestedStart ?? request.proposedAt;
    const createdDate = parseDate(createdAt);
    const includeActivity = createdDate ? createdDate.getTime() >= fourteenDaysAgo : false;
    if (includeActivity) {
      activities.push({
        id: `request-${request.id}`,
        category: 'request',
        title:
          descriptor.key === 'pending'
            ? 'Pedido enviado'
            : descriptor.key === 'reschedule_pending'
            ? 'Remarcação em análise'
            : descriptor.key === 'accepted'
            ? 'Pedido aprovado'
            : 'Pedido fechado',
        description: request.trainer?.name ?? request.trainer?.email ?? 'Personal trainer',
        at: createdDate?.toISOString() ?? null,
        tone: descriptor.tone,
      });
    }

    if (descriptor.key === 'pending' || descriptor.key === 'reschedule_pending') {
      openRequests += 1;
    }
  });

  const requestStats: SessionRequestStat[] = Array.from(requestMap.values()).sort((a, b) => b.count - a.count);

  const busiestPoint = timelinePoints.reduce<SessionTimelinePoint | null>((acc, point) => {
    if (!acc) return point;
    if (point.scheduled > acc.scheduled) return point;
    return acc;
  }, null);

  const metrics = {
    supabase: opts.supabase,
    totalSessions: sessions.length,
    upcomingCount,
    nextSessionAt,
    attendanceRate: sessions.length > 0 ? Math.round((attendancePositive / sessions.length) * 100) : 0,
    cancellationRate: sessions.length > 0 ? Math.round((attendanceCancelled / sessions.length) * 100) : 0,
    hoursBooked7d: Math.round(hours7d * 10) / 10,
    hoursBookedDelta:
      hoursPrev7d === 0 ? (hours7d === 0 ? 0 : Math.round(hours7d * 10) / 10) : Math.round((hours7d - hoursPrev7d) * 10) / 10,
    lastCompletedAt,
    busiestDayLabel: busiestPoint && busiestPoint.scheduled > 0 ? formatDayLabel(busiestPoint.date) : null,
    openRequests,
  } as SessionDashboardData['metrics'];

  activities.sort(compareDescByDate);

  return {
    metrics,
    timeline: timelinePoints,
    attendance: attendanceStats,
    trainers: trainerStats.slice(0, 6),
    requestStats,
    activities: activities.slice(0, 14),
  };
}
