import { formatRelativeTime } from '@/lib/datetime/relative';
import type {
  TrainerAgendaSessionRecord,
  TrainerRescheduleAgendaDay,
  TrainerRescheduleAgendaSessionView,
  TrainerRescheduleHeroMetric,
  TrainerRescheduleInsight,
  TrainerRescheduleRequestRecord,
  TrainerRescheduleRequestView,
  TrainerReschedulesDashboardData,
} from './types';

const DATE_TIME = new Intl.DateTimeFormat('pt-PT', {
  weekday: 'short',
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

const TIME_LABEL = new Intl.DateTimeFormat('pt-PT', {
  hour: '2-digit',
  minute: '2-digit',
});

const NUMBER = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const PERCENT = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1, minimumFractionDigits: 0 });

const PENDING_STATUSES = new Set(['pending', 'reschedule_pending']);
const CLIENT_AWAITING_STATUSES = new Set(['reschedule_pending']);
const RESPONDED_STATUSES = new Set(['accepted', 'declined', 'cancelled', 'reschedule_declined', 'reschedule_accepted']);
const ACCEPTED_STATUSES = new Set(['accepted', 'reschedule_accepted']);

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatRange(start: string | null, end: string | null): string {
  const startDate = parseDate(start);
  if (!startDate) return 'Data por definir';
  const startLabel = DATE_TIME.format(startDate);
  const endDate = parseDate(end);
  if (!endDate) return startLabel;
  return `${startLabel} — ${TIME_LABEL.format(endDate)}`;
}

function formatRequestedLabel(start: string | null, end: string | null): string {
  const startDate = parseDate(start);
  if (!startDate) return 'Data por definir';
  const endDate = parseDate(end);
  if (!endDate) {
    return DATE_TIME.format(startDate);
  }
  return `${DATE_TIME.format(startDate)} (${Math.max(30, Math.round((endDate.getTime() - startDate.getTime()) / 60000))} minutos)`;
}

function clientLabel(name: string | null, email: string | null, id: string | null): string {
  if (name && email) return `${name} (${email})`;
  if (name) return name;
  if (email) return email;
  return id ?? 'Cliente desconhecido';
}

function statusMeta(status: string): { label: string; tone: 'positive' | 'warning' | 'critical' | 'neutral' } {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'pending':
      return { label: 'Aguardando decisão', tone: 'warning' };
    case 'accepted':
    case 'reschedule_accepted':
      return { label: 'Aceite', tone: 'positive' };
    case 'declined':
      return { label: 'Recusado', tone: 'critical' };
    case 'cancelled':
      return { label: 'Cancelado', tone: 'neutral' };
    case 'reschedule_pending':
      return { label: 'Aguardando cliente', tone: 'warning' };
    case 'reschedule_declined':
      return { label: 'Remarcação recusada', tone: 'critical' };
    default:
      return { label: status, tone: 'neutral' };
  }
}

function sessionStatusMeta(status: string | null | undefined): { label: string; tone: 'ok' | 'warn' | 'down' | 'neutral' } {
  if (!status) return { label: 'Sem estado', tone: 'neutral' };
  const normalized = status.toLowerCase();
  if (normalized === 'scheduled') return { label: 'Agendado', tone: 'warn' };
  if (normalized === 'completed' || normalized === 'done') return { label: 'Concluído', tone: 'ok' };
  if (normalized === 'cancelled') return { label: 'Cancelado', tone: 'down' };
  if (normalized === 'confirmed') return { label: 'Confirmado', tone: 'ok' };
  return { label: status, tone: 'neutral' };
}

function formatAgendaSessions(sessions: TrainerAgendaSessionRecord[]): TrainerRescheduleAgendaSessionView[] {
  return sessions
    .map((session) => {
      const start = parseDate(session.start);
      const end = parseDate(session.end);
      const label = start ? `${TIME_LABEL.format(start)}${end ? ` — ${TIME_LABEL.format(end)}` : ''}` : 'Data por definir';
      const status = sessionStatusMeta(session.status);
      return {
        id: session.id,
        clientName: session.clientName ?? 'Cliente',
        rangeLabel: label,
        location: session.location ?? null,
        statusLabel: status.label,
        statusTone: status.tone,
      } satisfies TrainerRescheduleAgendaSessionView;
    })
    .sort((a, b) => a.rangeLabel.localeCompare(b.rangeLabel, 'pt-PT'));
}

function groupAgenda(sessions: TrainerAgendaSessionRecord[]): TrainerRescheduleAgendaDay[] {
  const map = new Map<string, { date: string; label: string; sessions: TrainerAgendaSessionRecord[] }>();
  sessions.forEach((session) => {
    const start = parseDate(session.start);
    const key = start ? start.toISOString().slice(0, 10) : 'sem-data';
    const entry = map.get(key) ?? {
      date: start ? start.toISOString() : new Date().toISOString(),
      label: start ? DAY_LABEL.format(start) : 'Data a definir',
      sessions: [],
    };
    entry.sessions.push(session);
    map.set(key, entry);
  });

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, value]) => ({
      id: value.date,
      date: value.date,
      label: value.label,
      sessions: formatAgendaSessions(value.sessions),
    } satisfies TrainerRescheduleAgendaDay));
}

function formatHeroMetrics(
  requests: TrainerRescheduleRequestRecord[],
  now: Date,
): TrainerRescheduleHeroMetric[] {
  const pending = requests.filter((request) => PENDING_STATUSES.has(request.status.toLowerCase()));
  const awaitingClient = requests.filter((request) => CLIENT_AWAITING_STATUSES.has(request.status.toLowerCase()));
  const responded = requests.filter((request) => RESPONDED_STATUSES.has(request.status.toLowerCase()) && request.respondedAt);
  const accepted = responded.filter((request) => ACCEPTED_STATUSES.has(request.status.toLowerCase()));

  const responseTimes = responded
    .map((request) => {
      const created = parseDate(request.createdAt);
      const respondedAt = parseDate(request.respondedAt);
      if (!created || !respondedAt) return null;
      return Math.max(1, Math.round((respondedAt.getTime() - created.getTime()) / 60000));
    })
    .filter((value): value is number => Number.isFinite(value ?? NaN));

  const averageResponse = responseTimes.length
    ? Math.round(responseTimes.reduce((total, value) => total + value, 0) / responseTimes.length)
    : null;

  const acceptanceRate = responded.length ? accepted.length / responded.length : null;

  const hero: TrainerRescheduleHeroMetric[] = [
    {
      id: 'pending-total',
      label: 'Pedidos por resolver',
      value: NUMBER.format(pending.length),
      hint: pending.length ? `${pending.length === 1 ? '1 pedido' : `${pending.length} pedidos`} aguardam decisão.` : 'Tudo em dia.',
      tone: pending.length ? 'warning' : 'positive',
    },
    {
      id: 'awaiting-client',
      label: 'Aguardando cliente',
      value: NUMBER.format(awaitingClient.length),
      hint: awaitingClient.length
        ? awaitingClient
            .slice(0, 2)
            .map((request) => clientLabel(request.clientName, request.clientEmail, request.clientId))
            .join(', ')
        : 'Sem follow-ups pendentes.',
      tone: awaitingClient.length > 2 ? 'warning' : 'neutral',
    },
    {
      id: 'response-time',
      label: 'Tempo médio de resposta',
      value: averageResponse ? formatDuration(averageResponse) : '—',
      hint: responseTimes.length ? `Baseado em ${responseTimes.length} pedidos resolvidos.` : 'Ainda sem histórico recente.',
      tone: averageResponse ? responseTone(averageResponse) : 'neutral',
    },
    {
      id: 'acceptance-rate',
      label: 'Taxa de aprovação',
      value: acceptanceRate === null ? '—' : `${PERCENT.format(acceptanceRate * 100)}%`,
      hint: acceptanceRate === null ? 'Sem decisões recentes.' : `${accepted.length}/${responded.length} aprovados.`,
      tone: acceptanceRate === null ? 'neutral' : acceptanceRate >= 0.7 ? 'positive' : acceptanceRate >= 0.5 ? 'warning' : 'critical',
    },
  ];

  return hero;
}

function formatDuration(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return '—';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

function responseTone(minutes: number): 'positive' | 'warning' | 'critical' {
  if (minutes <= 180) return 'positive';
  if (minutes <= 720) return 'warning';
  return 'critical';
}

function buildRequestView(
  request: TrainerRescheduleRequestRecord,
  now: Date,
): TrainerRescheduleRequestView {
  const status = statusMeta(request.status ?? '');
  const requestedRange = formatRange(request.requestedStart, request.requestedEnd);
  const requestedLabel = formatRequestedLabel(request.requestedStart, request.requestedEnd);
  const proposedLabel = request.proposedStart ? formatRange(request.proposedStart, request.proposedEnd) : null;
  const respondedLabel = formatRelativeTime(request.respondedAt, now);
  const awaitingClient = CLIENT_AWAITING_STATUSES.has((request.status ?? '').toLowerCase());
  const normalized = (request.status ?? '').toLowerCase();
  const canAccept = normalized === 'pending';
  const canDecline = normalized === 'pending';
  const canPropose = normalized === 'accepted' || normalized === 'reschedule_declined';

  return {
    id: request.id,
    status: request.status,
    statusLabel: status.label,
    statusTone: status.tone,
    requestedStart: request.requestedStart,
    requestedEnd: request.requestedEnd,
    requestedLabel,
    requestedRange,
    proposedStart: request.proposedStart,
    proposedEnd: request.proposedEnd,
    proposedLabel,
    message: request.message,
    trainerNote: request.trainerNote,
    rescheduleNote: request.rescheduleNote,
    respondedAt: request.respondedAt,
    respondedLabel,
    createdAt: request.createdAt,
    clientId: request.clientId,
    clientLabel: clientLabel(request.clientName, request.clientEmail, request.clientId),
    awaitingClient,
    canAccept,
    canDecline,
    canPropose,
  } satisfies TrainerRescheduleRequestView;
}

function formatInsights(
  requests: TrainerRescheduleRequestRecord[],
  agenda: TrainerRescheduleAgendaDay[],
  now: Date,
): TrainerRescheduleInsight[] {
  const pending = requests.filter((request) => PENDING_STATUSES.has(request.status.toLowerCase()));
  const pendingClients = Array.from(
    new Set(
      pending.map((request) => clientLabel(request.clientName, request.clientEmail, request.clientId)),
    ),
  );

  const insightPending: TrainerRescheduleInsight = pending.length
    ? {
        id: 'pending-focus',
        title: 'Clientes à espera',
        description:
          pendingClients.length > 3
            ? `${pendingClients.slice(0, 3).join(', ')} e mais ${pendingClients.length - 3}.`
            : pendingClients.join(', '),
        tone: pending.length > 2 ? 'warning' : 'neutral',
        value: `${pending.length === 1 ? '1 pedido' : `${pending.length} pedidos`} pendentes`,
      }
    : {
        id: 'pending-focus',
        title: 'Fila vazia',
        description: 'Todos os pedidos foram tratados. Mantém o ritmo!',
        tone: 'positive',
        value: '0 pendentes',
      };

  const busyDay = agenda
    .slice()
    .sort((a, b) => b.sessions.length - a.sessions.length)
    .find((day) => day.sessions.length > 0);
  const insightAgenda: TrainerRescheduleInsight = busyDay
    ? {
        id: 'agenda-busy',
        title: 'Dia mais preenchido',
        description: `${busyDay.label} com ${busyDay.sessions.length} sessões programadas.`,
        tone: busyDay.sessions.length >= 4 ? 'warning' : 'neutral',
        value: busyDay.sessions[0]?.rangeLabel ?? null,
      }
    : {
        id: 'agenda-busy',
        title: 'Agenda tranquila',
        description: 'Ainda não existem sessões agendadas para esta semana.',
        tone: 'neutral',
        value: null,
      };

  const resolved = requests
    .filter((request) => request.respondedAt)
    .sort((a, b) => {
      const aTime = parseDate(a.respondedAt)?.getTime() ?? 0;
      const bTime = parseDate(b.respondedAt)?.getTime() ?? 0;
      return bTime - aTime;
    });

  const latest = resolved[0];
  const insightLatest: TrainerRescheduleInsight = latest
    ? {
        id: 'latest-decision',
        title: 'Última decisão',
        description: `${statusMeta(latest.status).label} para ${clientLabel(latest.clientName, latest.clientEmail, latest.clientId)} ${formatRelativeTime(latest.respondedAt, now) ?? ''}`.trim(),
        tone: ACCEPTED_STATUSES.has(latest.status.toLowerCase()) ? 'positive' : 'neutral',
        value: formatRange(latest.requestedStart, latest.requestedEnd),
      }
    : {
        id: 'latest-decision',
        title: 'Sem decisões recentes',
        description: 'Ainda não existem pedidos respondidos nesta semana.',
        tone: 'neutral',
        value: null,
      };

  return [insightPending, insightAgenda, insightLatest];
}

export function buildTrainerReschedulesDashboard(
  requests: TrainerRescheduleRequestRecord[],
  sessions: TrainerAgendaSessionRecord[],
  options: { supabase: boolean; now?: Date } = { supabase: false },
): TrainerReschedulesDashboardData {
  const now = options.now ?? new Date();
  const pendingViews: TrainerRescheduleRequestView[] = [];
  const historyViews: TrainerRescheduleRequestView[] = [];

  requests
    .slice()
    .sort((a, b) => {
      const aTime = parseDate(a.createdAt)?.getTime() ?? parseDate(a.requestedStart)?.getTime() ?? 0;
      const bTime = parseDate(b.createdAt)?.getTime() ?? parseDate(b.requestedStart)?.getTime() ?? 0;
      return bTime - aTime;
    })
    .forEach((request) => {
      const view = buildRequestView(request, now);
      if (PENDING_STATUSES.has((request.status ?? '').toLowerCase())) {
        pendingViews.push(view);
      } else {
        historyViews.push(view);
      }
    });

  const agenda = groupAgenda(sessions);
  const hero = formatHeroMetrics(requests, now);
  const insights = formatInsights(requests, agenda, now);

  const updatedAtCandidates = requests
    .map((request) => parseDate(request.updatedAt) ?? parseDate(request.createdAt))
    .concat(sessions.map((session) => parseDate(session.start)))
    .filter((date): date is Date => Boolean(date));

  const updatedAt = updatedAtCandidates.length
    ? new Date(Math.max(...updatedAtCandidates.map((date) => date.getTime()))).toISOString()
    : now.toISOString();

  return {
    updatedAt,
    supabase: options.supabase,
    hero,
    insights,
    pending: pendingViews,
    history: historyViews,
    agenda,
  } satisfies TrainerReschedulesDashboardData;
}
