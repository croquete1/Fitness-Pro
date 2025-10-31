import { getFallbackLandingSummary } from '@/lib/fallback/auth-landing';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { countUsersByRole } from '@/lib/userRepo';
import type {
  LandingActivity,
  LandingHighlight,
  LandingMetric,
  LandingSummary,
  LandingTimelinePoint,
} from '@/lib/public/landing/types';

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

const numberFormatter = new Intl.NumberFormat('pt-PT');
const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
});

const timestampFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

type SessionRow = {
  id: string;
  scheduled_at: string | null;
  client_attendance_status: string | null;
  trainer_id: string | null;
  client_id: string | null;
  location?: string | null;
};

type InvoiceRow = {
  id: string;
  status: string | null;
  amount: number | string | null;
  issued_at: string | null;
  client_name?: string | null;
  service_name?: string | null;
};

type SignupRow = {
  id: string;
  created_at: string | null;
  name?: string | null;
  email?: string | null;
};

type RequestRow = {
  id: string;
  status: string | null;
  created_at: string | null;
  requested_start?: string | null;
};

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function clampNumber(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return clampNumber(value);
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function safeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function relativeToNow(date: Date, now: Date): string {
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = diffMs / 60_000;
  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(Math.round(diffMinutes), 'minute');
  }
  const diffHours = diffMinutes / 60;
  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(Math.round(diffHours), 'hour');
  }
  const diffDays = diffHours / 24;
  return relativeFormatter.format(Math.round(diffDays), 'day');
}

function buildTimeline(now: Date, clients: SignupRow[], sessions: SessionRow[], invoices: InvoiceRow[]): LandingTimelinePoint[] {
  const start = startOfDay(new Date(now.getTime() - 7 * WEEK_MS + DAY_MS));
  const buckets: Array<{ start: Date; end: Date; label: string; key: string }> = [];
  for (let index = 0; index < 8; index += 1) {
    const bucketStart = new Date(start.getTime() + index * WEEK_MS);
    const bucketEnd = new Date(bucketStart.getTime() + WEEK_MS - DAY_MS);
    const label = `${shortDateFormatter.format(bucketStart)} – ${shortDateFormatter.format(bucketEnd)}`;
    const key = bucketStart.toISOString().slice(0, 10);
    buckets.push({ start: bucketStart, end: bucketEnd, label, key });
  }

  return buckets.map((bucket) => {
    const clientsCount = clients.filter((row) => {
      const createdAt = safeDate(row.created_at);
      if (!createdAt) return false;
      return createdAt >= bucket.start && createdAt <= new Date(bucket.end.getTime() + DAY_MS - 1);
    }).length;

    const sessionsCount = sessions.filter((row) => {
      const scheduled = safeDate(row.scheduled_at);
      if (!scheduled) return false;
      if (scheduled < bucket.start || scheduled > new Date(bucket.end.getTime() + DAY_MS - 1)) {
        return false;
      }
      const status = (row.client_attendance_status ?? '').toString().toLowerCase();
      return status === 'completed' || status === 'confirmed';
    }).length;

    const revenueTotal = invoices.reduce((acc, row) => {
      const issuedAt = safeDate(row.issued_at);
      if (!issuedAt) return acc;
      if (issuedAt < bucket.start || issuedAt > new Date(bucket.end.getTime() + DAY_MS - 1)) {
        return acc;
      }
      const status = (row.status ?? '').toString().toLowerCase();
      if (status !== 'paid') return acc;
      return acc + toNumber(row.amount);
    }, 0);

    return {
      bucket: bucket.key,
      label: bucket.label,
      clients: clientsCount,
      sessions: sessionsCount,
      revenue: Number(revenueTotal.toFixed(2)),
    } satisfies LandingTimelinePoint;
  });
}

function buildMetrics(
  totalClients: number,
  newClients30: number,
  newClientsPrev30: number,
  activeTrainers: number,
  trainersPrev: number,
  sessionsCompleted30: number,
  sessionsCompletedPrev30: number,
  sessionsScheduled30: number,
  revenue30: number,
  revenuePrev30: number,
  invoicesPaid30: number,
): LandingMetric[] {
  const attendanceRate = sessionsScheduled30 > 0 ? Math.round((sessionsCompleted30 / sessionsScheduled30) * 100) : 0;

  const clientsDelta = newClientsPrev30 > 0
    ? ((newClients30 - newClientsPrev30) / newClientsPrev30) * 100
    : newClients30 > 0
      ? 100
      : 0;
  const clientsTone = clientsDelta > 2 ? 'up' : clientsDelta < -2 ? 'down' : 'neutral';
  const clientsTrend = newClientsPrev30 === 0 && newClients30 === 0
    ? 'Estável'
    : `${clientsDelta > 0 ? '+' : ''}${Math.round(clientsDelta)}% face a 30d`;

  const trainerDelta = trainersPrev > 0
    ? ((activeTrainers - trainersPrev) / trainersPrev) * 100
    : activeTrainers > 0
      ? 100
      : 0;
  const trainerTone = trainerDelta > 2 ? 'up' : trainerDelta < -2 ? 'down' : 'neutral';
  const trainerTrend = trainersPrev === 0 && activeTrainers === 0
    ? 'Sem carga registada'
    : `${trainerDelta > 0 ? '+' : ''}${Math.round(trainerDelta)}% face a 30d`;

  const sessionDelta = sessionsCompletedPrev30 > 0
    ? ((sessionsCompleted30 - sessionsCompletedPrev30) / sessionsCompletedPrev30) * 100
    : sessionsCompleted30 > 0
      ? 100
      : 0;
  const sessionTone = sessionDelta > 2 ? 'up' : sessionDelta < -2 ? 'down' : 'neutral';
  const sessionTrend = sessionsCompletedPrev30 === 0 && sessionsCompleted30 === 0
    ? 'Sem histórico anterior'
    : `${sessionDelta > 0 ? '+' : ''}${Math.round(sessionDelta)}% face a 30d`;

  const revenueDelta = revenuePrev30 > 0
    ? ((revenue30 - revenuePrev30) / revenuePrev30) * 100
    : revenue30 > 0
      ? 100
      : 0;
  const revenueTone = revenueDelta > 2 ? 'up' : revenueDelta < -2 ? 'down' : 'neutral';
  const revenueTrend = revenuePrev30 === 0 && revenue30 === 0
    ? 'Sem histórico anterior'
    : `${revenueDelta > 0 ? '+' : ''}${Math.round(revenueDelta)}% face a 30d`;

  return [
    {
      id: 'active-clients',
      label: 'Clientes ativos',
      value: numberFormatter.format(totalClients),
      hint: `${numberFormatter.format(newClients30)} novos nos últimos 30 dias`,
      trend: clientsTrend,
      tone: clientsTone,
    },
    {
      id: 'active-trainers',
      label: 'PTs com sessões (30d)',
      value: numberFormatter.format(activeTrainers),
      hint: `Equipa total ${numberFormatter.format(Math.max(activeTrainers, trainersPrev, totalClients ? Math.ceil(totalClients / 8) : activeTrainers))}`,
      trend: trainerTrend,
      tone: trainerTone,
    },
    {
      id: 'sessions',
      label: 'Sessões concluídas (30d)',
      value: numberFormatter.format(sessionsCompleted30),
      hint: `Presença ${attendanceRate}% · ${numberFormatter.format(sessionsScheduled30)} agendadas`,
      trend: sessionTrend,
      tone: sessionTone,
    },
    {
      id: 'revenue',
      label: 'Faturação paga (30d)',
      value: currencyFormatter.format(revenue30),
      hint: `${numberFormatter.format(invoicesPaid30)} faturas liquidadas`,
      trend: revenueTrend,
      tone: revenueTone,
    },
  ];
}

function buildHighlights(
  attendanceRate: number,
  sessionsCompleted30: number,
  sessionsScheduled30: number,
  pendingRequests: number,
  invoicesPending: number,
  pendingAmount: number,
  refundedInvoices: number,
): LandingHighlight[] {
  const attendanceTone = attendanceRate >= 80 ? 'positive' : attendanceRate >= 60 ? 'informative' : 'warning';
  const requestsTone = pendingRequests > 6 ? 'warning' : pendingRequests > 0 ? 'informative' : 'positive';
  const invoicesTone = invoicesPending > 4 ? 'warning' : invoicesPending > 0 ? 'informative' : 'positive';

  return [
    {
      id: 'attendance',
      title: 'Assiduidade (30d)',
      description: `${attendanceRate}% das sessões agendadas foram concluídas.`,
      meta: `${numberFormatter.format(sessionsCompleted30)} concluídas de ${numberFormatter.format(sessionsScheduled30)}`,
      tone: attendanceTone,
    },
    {
      id: 'requests',
      title: 'Pedidos pendentes',
      description: `${numberFormatter.format(pendingRequests)} pedidos de sessão aguardam resposta.`,
      meta: 'Objetivo < 6 pendentes',
      tone: requestsTone,
    },
    {
      id: 'billing',
      title: 'Faturação por cobrar',
      description: `${numberFormatter.format(invoicesPending)} faturas em aberto (${currencyFormatter.format(pendingAmount)}).`,
      meta: `${numberFormatter.format(refundedInvoices)} reembolsos emitidos (30d)`,
      tone: invoicesTone,
    },
  ];
}

function buildActivities(
  now: Date,
  sessions: SessionRow[],
  invoices: InvoiceRow[],
  signups: SignupRow[],
  requests: RequestRow[],
): LandingActivity[] {
  const activities: LandingActivity[] = [];

  const sortedSessions = [...sessions]
    .filter((row) => {
      const status = (row.client_attendance_status ?? '').toString().toLowerCase();
      return status === 'completed' || status === 'confirmed';
    })
    .sort((a, b) => {
      const aDate = safeDate(a.scheduled_at)?.getTime() ?? -Infinity;
      const bDate = safeDate(b.scheduled_at)?.getTime() ?? -Infinity;
      return bDate - aDate;
    });

  sortedSessions.slice(0, 3).forEach((row) => {
    const date = safeDate(row.scheduled_at) ?? now;
    activities.push({
      id: `session-${row.id}`,
      title: 'Sessão concluída',
      description: `Treino finalizado ${timestampFormatter.format(date)}${row.location ? ` · ${row.location}` : ''}`,
      occurredAt: date.toISOString(),
      relativeTime: relativeToNow(date, now),
      tone: 'success',
    });
  });

  const sortedInvoices = [...invoices]
    .filter((row) => (row.status ?? '').toString().toLowerCase() === 'paid')
    .sort((a, b) => {
      const aDate = safeDate(a.issued_at)?.getTime() ?? -Infinity;
      const bDate = safeDate(b.issued_at)?.getTime() ?? -Infinity;
      return bDate - aDate;
    });

  sortedInvoices.slice(0, 3).forEach((row) => {
    const date = safeDate(row.issued_at) ?? now;
    const amount = currencyFormatter.format(toNumber(row.amount));
    activities.push({
      id: `invoice-${row.id}`,
      title: 'Fatura liquidada',
      description: `${row.service_name ?? 'Serviço'} pago por ${row.client_name ?? 'cliente'} (${amount}).`,
      occurredAt: date.toISOString(),
      relativeTime: relativeToNow(date, now),
      tone: 'success',
    });
  });

  const sortedSignups = [...signups]
    .sort((a, b) => {
      const aDate = safeDate(a.created_at)?.getTime() ?? -Infinity;
      const bDate = safeDate(b.created_at)?.getTime() ?? -Infinity;
      return bDate - aDate;
    });

  sortedSignups.slice(0, 2).forEach((row) => {
    const date = safeDate(row.created_at) ?? now;
    activities.push({
      id: `signup-${row.id}`,
      title: 'Novo cliente registado',
      description: row.name ? `${row.name}` : `Conta criada (${row.email ?? row.id})`,
      occurredAt: date.toISOString(),
      relativeTime: relativeToNow(date, now),
      tone: 'neutral',
    });
  });

  const sortedRequests = [...requests]
    .sort((a, b) => {
      const aDate = safeDate(a.created_at)?.getTime() ?? -Infinity;
      const bDate = safeDate(b.created_at)?.getTime() ?? -Infinity;
      return bDate - aDate;
    });

  sortedRequests.slice(0, 2).forEach((row) => {
    const date = safeDate(row.created_at) ?? now;
    const status = (row.status ?? 'pending').toString().toLowerCase();
    const tone: LandingActivity['tone'] = status === 'accepted'
      ? 'success'
      : status === 'declined' || status === 'cancelled'
        ? 'danger'
        : 'neutral';
    const descriptor =
      status === 'accepted'
        ? 'Pedido aceite'
        : status === 'declined'
          ? 'Pedido recusado'
          : status === 'cancelled'
            ? 'Pedido cancelado'
            : status === 'reschedule_pending'
              ? 'Remarcação em curso'
              : 'Pedido pendente';
    activities.push({
      id: `request-${row.id}`,
      title: descriptor,
      description: row.requested_start
        ? `Agendamento alvo ${timestampFormatter.format(safeDate(row.requested_start) ?? date)}`
        : 'Pedido de sessão atualizado.',
      occurredAt: date.toISOString(),
      relativeTime: relativeToNow(date, now),
      tone,
    });
  });

  return activities.slice(0, 8);
}

export async function getLandingSummary(now: Date = new Date()): Promise<LandingSummary> {
  const supabase = tryCreateServerClient();

  if (!supabase) {
    return getFallbackLandingSummary(now);
  }

  const timelineStart = startOfDay(new Date(now.getTime() - 7 * WEEK_MS + DAY_MS));
  const rangeStart = startOfDay(new Date(now.getTime() - 60 * DAY_MS));
  const range30Start = startOfDay(new Date(now.getTime() - 30 * DAY_MS));

  const [
    totalClientsResult,
    totalTrainerResult,
    signupResult,
    sessionsResult,
    invoicesResult,
    pendingRequestsResult,
    requestsResult,
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'CLIENT'),
    countUsersByRole('TRAINER', { client: supabase as any }).then(async (trainerCount) => {
      if (trainerCount > 0) return { count: trainerCount };
      const ptCount = await countUsersByRole('PT', { client: supabase as any });
      return { count: ptCount };
    }),
    supabase
      .from('users')
      .select('id,name,email,created_at')
      .eq('role', 'CLIENT')
      .gte('created_at', rangeStart.toISOString()),
    supabase
      .from('sessions')
      .select('id,scheduled_at,client_attendance_status,trainer_id,client_id,location')
      .gte('scheduled_at', timelineStart.toISOString()),
    supabase
      .from('billing_invoices')
      .select('id,status,amount,issued_at,client_name,service_name')
      .gte('issued_at', timelineStart.toISOString()),
    supabase
      .from('session_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('session_requests')
      .select('id,status,created_at,requested_start')
      .gte('created_at', range30Start.toISOString())
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  if (signupResult.error) throw signupResult.error;
  if (sessionsResult.error) throw sessionsResult.error;
  if (invoicesResult.error) throw invoicesResult.error;
  if (requestsResult.error) throw requestsResult.error;

  const clientsCount = totalClientsResult.count ?? 0;
  const trainerCount = (totalTrainerResult as { count?: number }).count ?? 0;

  const signups: SignupRow[] = (signupResult.data ?? []).map((row: any) => ({
    id: String(row.id),
    created_at: row.created_at ?? null,
    name: row.name ?? null,
    email: row.email ?? null,
  }));

  const sessions: SessionRow[] = (sessionsResult.data ?? []).map((row: any) => ({
    id: String(row.id),
    scheduled_at: row.scheduled_at ?? row.start_at ?? null,
    client_attendance_status: row.client_attendance_status ?? row.attendance_status ?? null,
    trainer_id: row.trainer_id ?? null,
    client_id: row.client_id ?? null,
    location: row.location ?? null,
  }));

  const invoices: InvoiceRow[] = (invoicesResult.data ?? []).map((row: any) => ({
    id: String(row.id),
    status: row.status ?? null,
    amount: row.amount ?? row.total ?? null,
    issued_at: row.issued_at ?? row.created_at ?? null,
    client_name: row.client_name ?? null,
    service_name: row.service_name ?? null,
  }));

  const requests: RequestRow[] = (requestsResult.data ?? []).map((row: any) => ({
    id: String(row.id),
    status: row.status ?? null,
    created_at: row.created_at ?? null,
    requested_start: row.requested_start ?? null,
  }));

  const signups30 = signups.filter((row) => {
    const createdAt = safeDate(row.created_at);
    return !!createdAt && createdAt >= range30Start;
  }).length;

  const signupsPrev30 = signups.filter((row) => {
    const createdAt = safeDate(row.created_at);
    return !!createdAt && createdAt >= rangeStart && createdAt < range30Start;
  }).length;

  const sessions30 = sessions.filter((row) => {
    const scheduled = safeDate(row.scheduled_at);
    return !!scheduled && scheduled >= range30Start;
  });

  const sessionsPrev30 = sessions.filter((row) => {
    const scheduled = safeDate(row.scheduled_at);
    return !!scheduled && scheduled >= rangeStart && scheduled < range30Start;
  });

  const completed30 = sessions30.filter((row) => {
    const status = (row.client_attendance_status ?? '').toString().toLowerCase();
    return status === 'completed' || status === 'confirmed';
  });

  const completedPrev30 = sessionsPrev30.filter((row) => {
    const status = (row.client_attendance_status ?? '').toString().toLowerCase();
    return status === 'completed' || status === 'confirmed';
  });

  const attendanceRate = sessions30.length > 0
    ? Math.round((completed30.length / sessions30.length) * 100)
    : 0;

  const trainerIdsCurrent = new Set(
    sessions30
      .map((row) => row.trainer_id)
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  );
  const trainerIdsPrev = new Set(
    sessionsPrev30
      .map((row) => row.trainer_id)
      .filter((value): value is string => typeof value === 'string' && value.length > 0),
  );

  const revenuePaid30 = invoices
    .filter((row) => {
      const issuedAt = safeDate(row.issued_at);
      if (!issuedAt) return false;
      const status = (row.status ?? '').toString().toLowerCase();
      return status === 'paid' && issuedAt >= range30Start;
    })
    .reduce((acc, row) => acc + toNumber(row.amount), 0);

  const revenuePaidPrev30 = invoices
    .filter((row) => {
      const issuedAt = safeDate(row.issued_at);
      if (!issuedAt) return false;
      const status = (row.status ?? '').toString().toLowerCase();
      return status === 'paid' && issuedAt >= rangeStart && issuedAt < range30Start;
    })
    .reduce((acc, row) => acc + toNumber(row.amount), 0);

  const invoicesPaidCount30 = invoices.filter((row) => {
    const issuedAt = safeDate(row.issued_at);
    if (!issuedAt) return false;
    const status = (row.status ?? '').toString().toLowerCase();
    return status === 'paid' && issuedAt >= range30Start;
  }).length;

  const invoicesPending = invoices.filter((row) => (row.status ?? '').toString().toLowerCase() === 'pending');
  const pendingAmount = invoicesPending.reduce((acc, row) => acc + toNumber(row.amount), 0);

  const invoicesRefunded30 = invoices.filter((row) => {
    const issuedAt = safeDate(row.issued_at);
    if (!issuedAt) return false;
    const status = (row.status ?? '').toString().toLowerCase();
    return status === 'refunded' && issuedAt >= range30Start;
  }).length;

  const pendingRequests = pendingRequestsResult.count ?? 0;

  const metrics = buildMetrics(
    clientsCount,
    signups30,
    signupsPrev30,
    trainerIdsCurrent.size,
    trainerIdsPrev.size,
    completed30.length,
    completedPrev30.length,
    sessions30.length,
    revenuePaid30,
    revenuePaidPrev30,
    invoicesPaidCount30,
  );

  const highlights = buildHighlights(
    attendanceRate,
    completed30.length,
    sessions30.length,
    pendingRequests,
    invoicesPending.length,
    pendingAmount,
    invoicesRefunded30,
  );

  const timeline = buildTimeline(now, signups, sessions, invoices);

  const activities = buildActivities(now, sessions, invoices, signups, requests);

  return {
    ok: true,
    source: 'live',
    generatedAt: now.toISOString(),
    metrics,
    timeline,
    highlights,
    activities,
  } satisfies LandingSummary;
}
