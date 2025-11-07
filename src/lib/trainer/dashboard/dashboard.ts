import { addDays, format, formatDistanceToNowStrict, isSameDay, parseISO, startOfDay, startOfWeek, subDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  type TrainerDashboardData,
  type TrainerDashboardSource,
  type TrainerHeroMetric,
  type TrainerTimelinePoint,
  type TrainerHighlight,
  type TrainerAgendaDay,
  type TrainerAgendaSession,
  type TrainerUpcomingSession,
  type TrainerClientSnapshot,
  type TrainerApprovalSummary,
  type TrainerApprovalItem,
} from './types';

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });

const ACTIVE_PLAN_STATUSES = new Set(['ACTIVE', 'APPROVED', 'LIVE', 'IN_PROGRESS']);
const SESSION_COMPLETED = new Set(['completed', 'done', 'finished', 'attended', 'present']);
const SESSION_CANCELLED = new Set(['cancelled', 'canceled', 'no_show', 'missed', 'refused', 'declined']);
const SESSION_PENDING = new Set(['pending', 'awaiting', 'waiting', 'requested']);
const SESSION_CONFIRMED = new Set(['confirmed', 'scheduled', 'active', 'booked']);

const STATUS_LABEL: Record<string, string> = {
  completed: 'Concluída',
  cancelled: 'Cancelada',
  pending: 'Pendente',
  scheduled: 'Confirmada',
  unknown: 'Por definir',
};

const STATUS_TONE: Record<string, 'positive' | 'warning' | 'critical'> = {
  completed: 'positive',
  cancelled: 'critical',
  pending: 'warning',
  scheduled: 'positive',
  unknown: 'warning',
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  try {
    const parsed = typeof value === 'string' ? parseISO(value) : new Date(value);
    if (!parsed || Number.isNaN(parsed.getTime())) return null;
    return parsed;
  } catch (error) {
    console.warn('[trainer-dashboard] failed to parse date', value, error);
    return null;
  }
}

function formatDayLabel(date: Date): string {
  return format(date, 'dd MMM', { locale: pt });
}

function formatTimeLabel(value: Date | null): string {
  if (!value) return '—';
  return format(value, 'HH:mm');
}

function relativeLabel(date: Date | null, fallback: string): string {
  if (!date) return fallback;
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: pt });
  } catch (error) {
    console.warn('[trainer-dashboard] relative label failed', error);
    return fallback;
  }
}

function normaliseSessionStatus(status: string | null | undefined, attendance: string | null | undefined):
  | 'completed'
  | 'cancelled'
  | 'pending'
  | 'scheduled'
  | 'unknown' {
  const candidates = [status, attendance]
    .map((value) => (typeof value === 'string' ? value.toLowerCase() : null))
    .filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (SESSION_COMPLETED.has(candidate)) return 'completed';
    if (SESSION_CANCELLED.has(candidate)) return 'cancelled';
    if (SESSION_CONFIRMED.has(candidate)) return 'scheduled';
    if (SESSION_PENDING.has(candidate)) return 'pending';
    if (candidate === 'rescheduled') return 'pending';
  }

  if (status) {
    const upper = status.toUpperCase();
    if (ACTIVE_PLAN_STATUSES.has(upper)) return 'scheduled';
  }

  return 'unknown';
}

function buildHeroMetrics(source: TrainerDashboardSource, sessions: { date: Date | null }[]): TrainerHeroMetric[] {
  const totalClients = source.clients.length;
  const activePlans = source.plans.filter((plan) => ACTIVE_PLAN_STATUSES.has(String(plan.status ?? '').toUpperCase())).length;
  const now = source.now;
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 7);
  const lastWeekStart = subDays(weekStart, 7);
  const lastWeekEnd = weekStart;

  const sessionsThisWeek = sessions.filter((session) => {
    if (!session.date) return false;
    return session.date >= weekStart && session.date < weekEnd;
  }).length;

  const sessionsLastWeek = sessions.filter((session) => {
    if (!session.date) return false;
    return session.date >= lastWeekStart && session.date < lastWeekEnd;
  }).length;

  const diff = sessionsThisWeek - sessionsLastWeek;
  const diffLabel = diff === 0 ? 'Sem variação' : `${diff > 0 ? '+' : ''}${diff}`;

  const pendingApprovals = source.approvals.filter(
    (approval) => String(approval.status ?? '').toLowerCase() === 'pending',
  ).length;

  return [
    {
      id: 'clients',
      label: 'Clientes activos',
      value: numberFormatter.format(totalClients),
      hint: activePlans
        ? `${numberFormatter.format(activePlans)} plano(s) acompanhados`
        : 'Sem planos activos',
      tone: totalClients > 0 ? 'positive' : 'warning',
      href: '/dashboard/pt/clients',
    },
    {
      id: 'sessions-week',
      label: 'Sessões (7 dias)',
      value: numberFormatter.format(sessionsThisWeek),
      hint: 'Inclui confirmadas e concluídas',
      trend: diffLabel,
      tone: sessionsThisWeek >= 6 ? 'positive' : sessionsThisWeek >= 3 ? 'neutral' : 'warning',
      href: '/dashboard/pt/sessions',
    },
    {
      id: 'active-plans',
      label: 'Planos activos',
      value: numberFormatter.format(activePlans),
      hint: activePlans ? 'Clientes com plano em vigor' : 'Acompanhar planos dos clientes',
      tone: activePlans > 0 ? 'positive' : 'warning',
      href: '/dashboard/pt/plans',
    },
    {
      id: 'approvals',
      label: 'Pedidos pendentes',
      value: numberFormatter.format(pendingApprovals),
      hint: pendingApprovals ? 'Precisa de revisão' : 'Tudo tratado',
      tone: pendingApprovals > 0 ? 'warning' : 'positive',
      href: '/dashboard/pt/reschedules',
    },
  ];
}

function buildTimelinePoints(
  sessions: Array<{ date: Date | null; status: string }>,
  now: Date,
): TrainerTimelinePoint[] {
  const startRange = subDays(startOfDay(now), 13);
  return Array.from({ length: 14 }, (_, index) => {
    const day = addDays(startRange, index);
    const scheduled = sessions.filter((session) => session.date && isSameDay(session.date, day)).reduce((acc, session) => {
      if (session.status === 'cancelled') return acc;
      if (session.status === 'completed') return acc + 1;
      return acc + 1;
    }, 0);
    const completed = sessions.filter(
      (session) => session.date && isSameDay(session.date, day) && session.status === 'completed',
    ).length;
    const cancelled = sessions.filter(
      (session) => session.date && isSameDay(session.date, day) && session.status === 'cancelled',
    ).length;
    return {
      date: day.toISOString(),
      label: formatDayLabel(day),
      scheduled,
      completed,
      cancelled,
    } satisfies TrainerTimelinePoint;
  });
}

function buildAgenda(
  sessions: Array<{ id: string; date: Date | null; status: string; clientName: string; location: string | null }>,
  now: Date,
): TrainerAgendaDay[] {
  const start = startOfDay(now);
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(start, index);
    const items = sessions
      .filter((session) => session.date && isSameDay(session.date, day))
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return a.date.getTime() - b.date.getTime();
      })
      .slice(0, 6)
      .map((session) => ({
        id: session.id,
        startAt: session.date ? session.date.toISOString() : null,
        timeLabel: formatTimeLabel(session.date),
        clientName: session.clientName,
        location: session.location,
        status: STATUS_LABEL[session.status] ?? STATUS_LABEL.unknown,
        tone: STATUS_TONE[session.status] ?? STATUS_TONE.unknown,
      })) satisfies TrainerAgendaSession[];

    return {
      date: day.toISOString(),
      label: formatDayLabel(day),
      total: items.length,
      sessions: items,
    } satisfies TrainerAgendaDay;
  });
}

function buildUpcomingSessions(
  sessions: Array<{
    id: string;
    date: Date | null;
    status: string;
    clientName: string;
    location: string | null;
  }>,
): TrainerUpcomingSession[] {
  return sessions
    .filter((session) => session.date)
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return a.date.getTime() - b.date.getTime();
    })
    .slice(0, 12)
    .map((session) => ({
      id: session.id,
      startAt: session.date ? session.date.toISOString() : null,
      dateLabel: session.date ? format(session.date, "EEEE, dd 'de' MMMM", { locale: pt }) : '—',
      timeLabel: formatTimeLabel(session.date ?? null),
      clientName: session.clientName,
      location: session.location,
      status: STATUS_LABEL[session.status] ?? STATUS_LABEL.unknown,
      tone: STATUS_TONE[session.status] ?? STATUS_TONE.unknown,
    }));
}

function buildClientSnapshots(
  source: TrainerDashboardSource,
  sessions: Array<{ id: string; date: Date | null; status: string; clientId: string | null }>,
  now: Date,
): TrainerClientSnapshot[] {
  const grouped = new Map<string, { upcoming: Date[]; completed: Date[]; last?: Date; next?: Date }>();

  for (const session of sessions) {
    if (!session.clientId) continue;
    if (!grouped.has(session.clientId)) {
      grouped.set(session.clientId, { upcoming: [], completed: [] });
    }
    const entry = grouped.get(session.clientId)!;
    if (!session.date) continue;
    if (session.date >= now) {
      entry.upcoming.push(session.date);
      if (!entry.next || session.date < entry.next) {
        entry.next = session.date;
      }
    } else {
      entry.last = !entry.last || session.date > entry.last ? session.date : entry.last;
      if (session.status === 'completed') {
        entry.completed.push(session.date);
      }
    }
  }

  const snapshots: TrainerClientSnapshot[] = [];
  for (const client of source.clients) {
    const stats = grouped.get(client.id) ?? { upcoming: [], completed: [], last: null, next: null };
    const fallbackLast = parseDate(client.lastSessionAt);
    const fallbackNext = parseDate(client.nextSessionAt);
    const lastDate = stats.last ?? fallbackLast ?? null;
    const nextDate = stats.next ?? fallbackNext ?? null;
    const nextLabel = nextDate ? relativeLabel(nextDate, 'Sem agendamento') : 'Sem agendamento';
    const lastLabel = lastDate ? relativeLabel(lastDate, 'Sem histórico') : 'Sem histórico';
    const tone: TrainerClientSnapshot['tone'] = stats.upcoming.length
      ? 'positive'
      : stats.completed.length
      ? 'neutral'
      : 'warning';

    snapshots.push({
      id: client.id,
      name: client.name ?? 'Cliente',
      email: client.email ?? null,
      upcoming: stats.upcoming.length,
      completed: stats.completed.length,
      lastSessionLabel: lastLabel,
      nextSessionLabel: nextLabel,
      lastSessionAt: lastDate ? lastDate.toISOString() : null,
      nextSessionAt: nextDate ? nextDate.toISOString() : null,
      tone,
    });
  }

  return snapshots.sort((a, b) => b.upcoming - a.upcoming || b.completed - a.completed);
}

function buildApprovalSummary(source: TrainerDashboardSource): TrainerApprovalSummary {
  const pending = source.approvals.filter(
    (approval) => String(approval.status ?? '').toLowerCase() === 'pending',
  ).length;

  const recent = [...source.approvals]
    .sort((a, b) => {
      const aDate = parseDate(a.requestedAt);
      const bDate = parseDate(b.requestedAt);
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 6)
    .map<TrainerApprovalItem>((approval) => {
      const statusRaw = String(approval.status ?? '').toLowerCase();
      const tone: TrainerApprovalItem['tone'] = statusRaw === 'approved'
        ? 'positive'
        : statusRaw === 'rejected' || statusRaw === 'declined'
        ? 'critical'
        : statusRaw === 'pending'
        ? 'warning'
        : 'neutral';

      const statusLabel =
        statusRaw === 'approved'
          ? 'Aprovado'
          : statusRaw === 'rejected' || statusRaw === 'declined'
          ? 'Rejeitado'
          : statusRaw === 'pending'
          ? 'Pendente'
          : 'Indefinido';

      const requested = parseDate(approval.requestedAt);

      return {
        id: approval.id,
        clientName: approval.clientName ?? 'Cliente',
        type: approval.type ?? null,
        requestedAt: approval.requestedAt ?? null,
        requestedLabel: requested ? relativeLabel(requested, '—') : '—',
        status: statusLabel,
        tone,
      } satisfies TrainerApprovalItem;
    });

  return { pending, recent } satisfies TrainerApprovalSummary;
}

function buildHighlights(
  source: TrainerDashboardSource,
  hero: TrainerHeroMetric[],
  clientSnapshots: TrainerClientSnapshot[],
): TrainerHighlight[] {
  const highlights: TrainerHighlight[] = [];
  const pendingMetric = hero.find((metric) => metric.id === 'approvals');
  if (pendingMetric && Number(pendingMetric.value.replace(/\D/g, '')) > 0) {
    highlights.push({
      id: 'pending-approvals',
      title: 'Pedidos a rever',
      description: 'Existem solicitações de clientes a aguardar a tua decisão.',
      tone: 'warning',
    });
  }

  const clientsWithoutUpcoming = clientSnapshots.filter((client) => client.upcoming === 0).length;
  if (clientsWithoutUpcoming > 0) {
    highlights.push({
      id: 'no-upcoming',
      title: 'Agenda por preencher',
      description: `${clientsWithoutUpcoming} cliente(s) sem próxima sessão agendada.`,
      tone: 'info',
    });
  }

  const topClient = clientSnapshots[0];
  if (topClient) {
    highlights.push({
      id: 'top-client',
      title: `${topClient.name} é o cliente mais activo`,
      description: `${topClient.completed} sessão(ões) concluídas e ${topClient.upcoming} agendada(s).`,
      tone: 'positive',
    });
  }

  if (!highlights.length) {
    highlights.push({
      id: 'all-good',
      title: 'Tudo controlado',
      description: 'Planos, sessões e pedidos estão sob controlo. Mantém o ritmo!',
      tone: 'positive',
    });
  }

  return highlights;
}

export function buildTrainerDashboard(
  source: TrainerDashboardSource,
  options: { supabase: boolean },
): TrainerDashboardData {
  const clientLookup = new Map(source.clients.map((client) => [client.id, client.name ?? client.email ?? 'Cliente'] as const));

  const sessionDataset = source.sessions.map((session) => {
    const date = parseDate(session.startAt);
    const status = normaliseSessionStatus(session.status, session.attendanceStatus);
    const clientName = session.clientName ?? (session.clientId ? clientLookup.get(session.clientId) ?? 'Cliente' : 'Cliente');
    return {
      id: session.id,
      clientId: session.clientId,
      date,
      status,
      clientName,
      location: session.location ?? null,
    };
  });

  const hero = buildHeroMetrics(source, sessionDataset);
  const timeline = buildTimelinePoints(sessionDataset, source.now);

  const agendaSessions = sessionDataset.filter((session) => session.date && session.date >= startOfDay(source.now));
  const agenda = buildAgenda(agendaSessions, source.now);
  const upcoming = buildUpcomingSessions(agendaSessions);
  const clients = buildClientSnapshots(source, sessionDataset, source.now);
  const approvals = buildApprovalSummary(source);
  const highlights = buildHighlights(source, hero, clients);

  return {
    trainerId: source.trainerId,
    trainerName: source.trainerName ?? null,
    updatedAt: source.now.toISOString(),
    supabase: options.supabase,
    hero,
    timeline,
    highlights,
    agenda,
    upcoming,
    clients,
    approvals,
  } satisfies TrainerDashboardData;
}
