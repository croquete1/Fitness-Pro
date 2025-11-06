import { formatDistanceToNowStrict, differenceInCalendarDays, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';

import type {
  ClientDashboardData,
  ClientDashboardSource,
  ClientHeroMetric,
  ClientHighlight,
  ClientMeasurementPoint,
  ClientMeasurementSnapshot,
  ClientMeasurementTrend,
  ClientNotificationItem,
  ClientPlanSummary,
  ClientRecommendation,
  ClientSessionRow,
  ClientTimelinePoint,
  ClientWalletEntry,
  ClientWalletSnapshot,
} from './types';

const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('pt-PT', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const trendFormatter = new Intl.NumberFormat('pt-PT', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const dayFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
});

const weekdayFormatter = new Intl.DateTimeFormat('pt-PT', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('pt-PT', {
  hour: '2-digit',
  minute: '2-digit',
});

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

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatRelative(value: string | null | undefined, now: Date): string {
  const date = parseDate(value);
  if (!date) return '—';
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: pt });
  } catch (error) {
    console.warn('[client-dashboard] relative format failed', error);
    return '—';
  }
}

function planStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Sem estado';
  const normalised = status.toString().toUpperCase();
  switch (normalised) {
    case 'ACTIVE':
      return 'Activo';
    case 'DRAFT':
      return 'Rascunho';
    case 'ARCHIVED':
      return 'Arquivado';
    case 'DELETED':
      return 'Removido';
    default:
      return status;
  }
}

function computePlanSummary(
  source: ClientDashboardSource,
): { plan: ClientPlanSummary | null; highlights: ClientHighlight[] } {
  const { plans, now, sessions, trainerNames } = source;
  if (!plans.length) {
    return { plan: null, highlights: [] };
  }

  const sortedPlans = [...plans].sort((a, b) => {
    const aDate = parseDate(a.updated_at ?? a.start_date ?? a.end_date ?? null);
    const bDate = parseDate(b.updated_at ?? b.start_date ?? b.end_date ?? null);
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return bDate.getTime() - aDate.getTime();
  });

  const activePlan = sortedPlans.find((plan) => {
    const status = (plan.status ?? '').toUpperCase();
    if (status === 'ACTIVE') return true;
    const endDate = parseDate(plan.end_date);
    return endDate ? endDate >= now : false;
  }) ?? sortedPlans[0];

  const startDate = parseDate(activePlan.start_date);
  const endDate = parseDate(activePlan.end_date);

  let progressPct: number | null = null;
  let daysRemaining: number | null = null;

  if (startDate && endDate) {
    const total = Math.max(1, differenceInCalendarDays(endDate, startDate));
    const elapsed = Math.min(total, Math.max(0, differenceInCalendarDays(now, startDate)));
    progressPct = Math.round((elapsed / total) * 100);
    daysRemaining = Math.max(0, differenceInCalendarDays(endDate, now));
  }

  const trainerName = activePlan.trainer_id ? trainerNames[activePlan.trainer_id] ?? null : null;

  const plan: ClientPlanSummary = {
    id: activePlan.id,
    title: activePlan.title ?? 'Plano de treino',
    status: planStatusLabel(activePlan.status ?? null),
    startDate: activePlan.start_date,
    endDate: activePlan.end_date,
    trainerName,
    progressPct,
    daysRemaining,
    sessionsCompleted: null,
    sessionsTotal: null,
    summary: activePlan.notes ?? undefined,
  };

  const planHighlights: ClientHighlight[] = [];

  if (progressPct !== null) {
    planHighlights.push({
      id: 'plan-progress',
      title: 'Progresso do plano',
      description: `Completaste ${progressPct}% do ciclo actual.`,
      tone: progressPct >= 75 ? 'success' : progressPct >= 40 ? 'info' : 'warning',
      icon: '📈',
      meta:
        daysRemaining !== null && endDate
          ? `${daysRemaining} dia(s) até ${dayFormatter.format(endDate)}`
          : undefined,
    });
  }

  const sessionsWithPlan = sessions.filter((session) => {
    const date = parseDate(session.scheduled_at);
    if (!date) return false;
    if (!startDate && !endDate) return false;
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  });

  if (sessionsWithPlan.length) {
    planHighlights.push({
      id: 'plan-sessions',
      title: 'Sessões no plano',
      description: `${sessionsWithPlan.length} sessão(ões) alinhadas com este plano.`,
      tone: 'accent',
      icon: '🗓️',
    });
  }

  if (!trainerName) {
    planHighlights.push({
      id: 'plan-trainer',
      title: 'Associa um treinador',
      description: 'Ainda não há um PT atribuído. Pede à equipa para associar um treinador.',
      tone: 'warning',
      icon: '🧑‍🏫',
    });
  }

  return { plan, highlights: planHighlights };
}

function classifyStatus(status: string | null | undefined): 'completed' | 'cancelled' | 'pending' {
  const normalised = (status ?? '').toString().toUpperCase();
  if (['COMPLETED', 'CONFIRMED'].includes(normalised)) return 'completed';
  if (['CANCELLED', 'NO_SHOW'].includes(normalised)) return 'cancelled';
  return 'pending';
}

function buildTimeline(
  source: ClientDashboardSource,
  rangeStart: Date,
  rangeEnd: Date,
): { timeline: ClientTimelinePoint[]; currentCompleted: number; previousCompleted: number } {
  const map = new Map<string, ClientTimelinePoint>();
  for (
    let cursor = new Date(rangeStart.getTime());
    cursor.getTime() <= rangeEnd.getTime();
    cursor = addDays(cursor, 1)
  ) {
    const iso = isoDay(cursor);
    map.set(iso, {
      day: iso,
      label: dayFormatter.format(cursor),
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    });
  }

  const previousStart = addDays(rangeStart, -source.rangeDays);
  const previousEnd = addDays(rangeStart, -1);

  let currentCompleted = 0;
  let previousCompleted = 0;

  for (const session of source.sessions) {
    const date = parseDate(session.scheduled_at);
    if (!date) continue;
    const iso = isoDay(date);
    const bucket = map.get(iso);
    const classification = classifyStatus(session.client_attendance_status);
    if (bucket) {
      bucket.scheduled += 1;
      if (classification === 'completed') bucket.completed += 1;
      if (classification === 'cancelled') bucket.cancelled += 1;
    }

    if (date >= rangeStart && date <= rangeEnd && classification === 'completed') {
      currentCompleted += 1;
    } else if (date >= previousStart && date <= previousEnd && classification === 'completed') {
      previousCompleted += 1;
    }
  }

  return { timeline: Array.from(map.values()), currentCompleted, previousCompleted };
}

function buildSessions(
  source: ClientDashboardSource,
  now: Date,
  limit = 6,
): { list: ClientSessionRow[]; upcomingCount: number } {
  const futureSessions = source.sessions
    .map((session) => ({ session, date: parseDate(session.scheduled_at) }))
    .filter((entry): entry is { session: typeof source.sessions[number]; date: Date } => Boolean(entry.date))
    .filter((entry) => entry.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const list: ClientSessionRow[] = futureSessions.slice(0, limit).map(({ session, date }) => {
    const trainerName = session.trainer_id ? source.trainerNames[session.trainer_id] ?? null : null;
    return {
      id: session.id,
      scheduledAt: session.scheduled_at,
      dayLabel: weekdayFormatter.format(date),
      timeLabel: timeFormatter.format(date),
      relative: formatRelative(session.scheduled_at, now),
      location: session.location ?? null,
      trainerName,
      status: session.client_attendance_status ?? null,
    } satisfies ClientSessionRow;
  });

  return { list, upcomingCount: futureSessions.length };
}

function buildMeasurements(
  source: ClientDashboardSource,
  now: Date,
): ClientMeasurementSnapshot {
  const points: ClientMeasurementPoint[] = (source.measurements ?? [])
    .map((measurement) => ({
      measuredAt: measurement.measured_at,
      label: measurement.measured_at ? dayFormatter.format(new Date(measurement.measured_at)) : '—',
      weightKg: measurement.weight_kg ?? null,
      bodyFatPct: measurement.body_fat_pct ?? null,
      bmi: measurement.bmi ?? null,
    }))
    .sort((a, b) => {
      const aDate = parseDate(a.measuredAt);
      const bDate = parseDate(b.measuredAt);
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return bDate.getTime() - aDate.getTime();
    });

  const current = points[0] ?? null;
  const previous = points[1] ?? null;

  let trend: ClientMeasurementTrend | null = null;
  if (current && previous) {
    const weightDelta =
      typeof current.weightKg === 'number' && typeof previous.weightKg === 'number'
        ? Number((current.weightKg - previous.weightKg).toFixed(1))
        : null;
    const bodyFatDelta =
      typeof current.bodyFatPct === 'number' && typeof previous.bodyFatPct === 'number'
        ? Number((current.bodyFatPct - previous.bodyFatPct).toFixed(1))
        : null;
    const bmiDelta =
      typeof current.bmi === 'number' && typeof previous.bmi === 'number'
        ? Number((current.bmi - previous.bmi).toFixed(1))
        : null;

    const tone: ClientMeasurementTrend['tone'] = weightDelta && weightDelta < 0 ? 'down' : weightDelta && weightDelta > 0 ? 'up' : 'neutral';

    trend = {
      tone,
      weight:
        typeof weightDelta === 'number' && weightDelta !== 0
          ? `${weightDelta > 0 ? '+' : '−'}${Math.abs(weightDelta).toFixed(1)} kg`
          : null,
      bodyFat:
        typeof bodyFatDelta === 'number' && bodyFatDelta !== 0
          ? `${bodyFatDelta > 0 ? '+' : '−'}${Math.abs(bodyFatDelta).toFixed(1)} pp`
          : null,
      bmi:
        typeof bmiDelta === 'number' && bmiDelta !== 0
          ? `${bmiDelta > 0 ? '+' : '−'}${Math.abs(bmiDelta).toFixed(1)}`
          : null,
    } satisfies ClientMeasurementTrend;
  }

  const stale = current?.measuredAt ? differenceInCalendarDays(now, new Date(current.measuredAt)) : null;
  if (!trend && stale !== null && stale > 30) {
    trend = { tone: 'neutral', weight: null, bodyFat: null, bmi: null };
  }

  return {
    current,
    previous,
    timeline: points.slice(0, 12).reverse(),
    trend,
  } satisfies ClientMeasurementSnapshot;
}

function buildWallet(source: ClientDashboardSource, now: Date): ClientWalletSnapshot | null {
  if (!source.wallet) return null;
  const currency = source.wallet.currency ?? 'EUR';
  const balance = Number(source.wallet.balance ?? 0);
  const entries: ClientWalletEntry[] = (source.walletEntries ?? [])
    .slice()
    .sort((a, b) => {
      const aDate = parseDate(a.created_at);
      const bDate = parseDate(b.created_at);
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 8)
    .map((entry) => ({
      id: entry.id,
      amount: entry.amount,
      description: entry.desc ?? null,
      createdAt: entry.created_at ?? null,
      relative: formatRelative(entry.created_at, now),
    }));

  return {
    balance,
    currency,
    updatedAt: source.wallet.updated_at ?? null,
    entries,
  } satisfies ClientWalletSnapshot;
}

function buildNotifications(
  source: ClientDashboardSource,
  now: Date,
): { unread: number; items: ClientNotificationItem[] } {
  const unread = source.notifications.filter((notification) => notification.read !== true).length;
  const items: ClientNotificationItem[] = source.notifications
    .slice()
    .sort((a, b) => {
      const aDate = parseDate(a.created_at);
      const bDate = parseDate(b.created_at);
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 6)
    .map((notification) => ({
      id: notification.id,
      title: notification.title ?? 'Notificação',
      createdAt: notification.created_at ?? null,
      relative: formatRelative(notification.created_at, now),
      type: notification.type ?? null,
      read: Boolean(notification.read),
    }));

  return { unread, items };
}

function buildHeroMetrics(
  rangeLabel: string,
  upcomingCount: number,
  currentCompleted: number,
  previousCompleted: number,
  plan: ClientPlanSummary | null,
  wallet: ClientWalletSnapshot | null,
  measurements: ClientMeasurementSnapshot,
): ClientHeroMetric[] {
  const metrics: ClientHeroMetric[] = [];

  const delta = currentCompleted - previousCompleted;
  const trendLabel =
    previousCompleted === 0 && currentCompleted === 0
      ? 'Sem comparação'
      : delta === 0
      ? 'Sem variação'
      : `${delta > 0 ? '+' : '−'}${numberFormatter.format(Math.abs(delta))} face ao período anterior`;

  metrics.push({
    key: 'sessions-upcoming',
    label: 'Sessões agendadas',
    value: numberFormatter.format(upcomingCount),
    hint: `Próximas ${rangeLabel}`,
    trend: trendLabel,
    tone: upcomingCount === 0 ? 'warning' : upcomingCount >= 4 ? 'success' : 'info',
  });

  metrics.push({
    key: 'plan-status',
    label: 'Plano activo',
    value: plan ? plan.title : 'Nenhum plano activo',
    hint: plan?.endDate ? `Termina a ${dayFormatter.format(new Date(plan.endDate))}` : undefined,
    trend: plan?.trainerName ? `PT responsável: ${plan.trainerName}` : null,
    tone: plan ? 'accent' : 'warning',
  });

  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency ?? 'EUR';
  const walletTrend = wallet?.entries?.[0]?.amount ?? null;
  metrics.push({
    key: 'wallet-balance',
    label: 'Saldo da carteira',
    value: currencyFormatter.format(balance),
    hint: currency.toUpperCase(),
    trend:
      typeof walletTrend === 'number' && walletTrend !== 0
        ? `${walletTrend > 0 ? '+' : '−'}${currencyFormatter.format(Math.abs(walletTrend))} na última operação`
        : null,
    tone: balance < 0 ? 'danger' : balance === 0 ? 'warning' : 'success',
  });

  const weightValue = measurements.current?.weightKg ?? null;
  metrics.push({
    key: 'weight',
    label: 'Última medição',
    value: weightValue !== null ? `${trendFormatter.format(weightValue)} kg` : 'Sem registos',
    hint: measurements.current?.measuredAt
      ? `Registado a ${dayFormatter.format(new Date(measurements.current.measuredAt))}`
      : 'Adiciona métricas para acompanhar a evolução',
    trend: measurements.trend?.weight ?? measurements.trend?.bodyFat ?? null,
    tone:
      measurements.trend?.tone === 'down'
        ? 'success'
        : measurements.trend?.tone === 'up'
        ? 'warning'
        : 'info',
  });

  return metrics;
}

function buildHighlights(
  planHighlights: ClientHighlight[],
  upcomingCount: number,
  measurements: ClientMeasurementSnapshot,
  now: Date,
): ClientHighlight[] {
  const highlights = [...planHighlights];

  if (upcomingCount === 0) {
    highlights.push({
      id: 'schedule-session',
      title: 'Agenda uma nova sessão',
      description: 'Não existem sessões agendadas — mantém a consistência marcando uma nova sessão.',
      tone: 'info',
      icon: '📅',
    });
  }

  const lastMeasurement = measurements.current?.measuredAt ? new Date(measurements.current.measuredAt) : null;
  if (!lastMeasurement) {
    highlights.push({
      id: 'measurement-missing',
      title: 'Regista as tuas métricas',
      description: 'Ainda não existem medições recentes. Actualiza peso, composição e notas de progresso.',
      tone: 'warning',
      icon: '📝',
    });
  } else {
    const days = differenceInCalendarDays(now, lastMeasurement);
    if (days > 28) {
      highlights.push({
        id: 'measurement-stale',
        title: 'Nova medição recomendada',
        description: `Já passaram ${days} dias desde a última medição.`,
        tone: 'info',
        icon: '📊',
      });
    }
  }

  return highlights.slice(0, 4);
}

function buildRecommendations(
  plan: ClientPlanSummary | null,
  wallet: ClientWalletSnapshot | null,
  sessions: { upcomingCount: number },
  measurements: ClientMeasurementSnapshot,
  now: Date,
): ClientRecommendation[] {
  const recs: ClientRecommendation[] = [];

  if (!plan) {
    recs.push({
      id: 'ask-plan',
      message: 'Fala com o teu PT para receberes um novo plano alinhado com os teus objectivos.',
      tone: 'info',
      icon: '🧠',
    });
  }

  if (sessions.upcomingCount === 0) {
    recs.push({
      id: 'book-session',
      message: 'Agenda uma sessão para manter a consistência dos treinos esta semana.',
      tone: 'accent',
      icon: '🏋️',
    });
  }

  if ((wallet?.balance ?? 0) < 20) {
    recs.push({
      id: 'wallet-topup',
      message: 'O saldo da carteira está baixo — garante saldo suficiente para próximas reservas.',
      tone: 'warning',
      icon: '💳',
    });
  }

  const lastMeasurementDate = measurements.current?.measuredAt ? new Date(measurements.current.measuredAt) : null;
  if (!lastMeasurementDate || differenceInCalendarDays(now, lastMeasurementDate) > 45) {
    recs.push({
      id: 'log-measurement',
      message: 'Regista uma nova medição corporal para acompanhar a evolução com o teu treinador.',
      tone: 'info',
      icon: '📏',
    });
  }

  if (!recs.length) {
    recs.push({
      id: 'keep-going',
      message: 'Excelente ritmo! Mantém o foco e continua a registar sessões e métricas.',
      tone: 'success',
      icon: '✨',
    });
  }

  return recs.slice(0, 4);
}

export function buildClientDashboard(source: ClientDashboardSource): ClientDashboardData {
  const now = source.now;
  const rangeStart = startOfDay(addDays(now, -(source.rangeDays - 1)));
  const rangeEnd = endOfDay(now);

  const { plan, highlights: planHighlights } = computePlanSummary(source);
  const { timeline, currentCompleted, previousCompleted } = buildTimeline(source, rangeStart, rangeEnd);
  const sessions = buildSessions(source, now, 6);
  const measurements = buildMeasurements(source, now);
  const wallet = buildWallet(source, now);
  const notifications = buildNotifications(source, now);

  const hero = buildHeroMetrics(`${source.rangeDays} dias`, sessions.upcomingCount, currentCompleted, previousCompleted, plan, wallet, measurements);
  const highlights = buildHighlights(planHighlights, sessions.upcomingCount, measurements, now);
  const recommendations = buildRecommendations(plan, wallet, sessions, measurements, now);

  return {
    generatedAt: now.toISOString(),
    range: {
      days: source.rangeDays,
      since: rangeStart.toISOString(),
      until: rangeEnd.toISOString(),
      label: `${source.rangeDays} dias`,
    },
    hero,
    timeline,
    highlights,
    plan,
    measurements,
    sessions: sessions.list,
    wallet,
    notifications,
    recommendations,
  } satisfies ClientDashboardData;
}
