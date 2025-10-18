import {
  type SystemActivityRow,
  type SystemDashboardData,
  type SystemDashboardInput,
  type SystemDistributionSegment,
  type SystemHighlight,
  type SystemHeroMetric,
  type SystemInvoiceRecord,
  type SystemNotificationRecord,
  type SystemSessionRecord,
  type SystemTimelinePoint,
  type SystemUserRecord,
} from './types';

const DAY_MS = 86_400_000;

const numberFormatter = new Intl.NumberFormat('pt-PT');
const percentFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });
const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

const COMPLETED_SESSION_STATES = new Set(['completed', 'done', 'finished', 'concluded']);
const CANCELLED_SESSION_STATES = new Set(['cancelled', 'canceled']);
const UPCOMING_SESSION_STATES = new Set(['scheduled', 'confirmed', 'pending', 'upcoming', 'booked', 'rescheduled']);
const DELIVERED_NOTIFICATION_STATES = new Set(['delivered', 'sent']);
const FAILED_NOTIFICATION_STATES = new Set(['failed', 'error', 'bounced']);

function formatNumber(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0';
  return numberFormatter.format(Math.round(value));
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0%';
  return `${percentFormatter.format(value)}%`;
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '—';
  return currencyFormatter.format(value);
}

function toStartOfDay(date: Date): Date {
  const copy = new Date(date.getTime());
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toIsoDay(date: Date): string {
  return toStartOfDay(date).toISOString().slice(0, 10);
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function isWithinRange(date: Date | null, start: Date, end: Date): boolean {
  if (!date) return false;
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

function formatRelative(value: string | null, now: Date): string | null {
  const date = parseDate(value);
  if (!date) return null;
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const thresholds: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit; size: number }> = [
    { limit: 60_000, unit: 'second', size: 1_000 },
    { limit: 3_600_000, unit: 'minute', size: 60_000 },
    { limit: 86_400_000, unit: 'hour', size: 3_600_000 },
    { limit: 604_800_000, unit: 'day', size: 86_400_000 },
    { limit: 2_629_746_000, unit: 'week', size: 604_800_000 },
    { limit: 31_556_952_000, unit: 'month', size: 2_629_746_000 },
    { limit: Infinity, unit: 'year', size: 31_556_952_000 },
  ];
  const bucket = thresholds.find((item) => absMs < item.limit) ?? thresholds[thresholds.length - 1];
  const valueRounded = Math.round(diffMs / bucket.size);
  return relativeFormatter.format(valueRounded, bucket.unit);
}

function computeTimeline(
  start: Date,
  days: number,
  users: SystemUserRecord[],
  sessions: SystemSessionRecord[],
  notifications: SystemNotificationRecord[],
  invoices: SystemInvoiceRecord[],
): SystemTimelinePoint[] {
  const buckets = new Map<string, SystemTimelinePoint>();
  for (let index = 0; index < days; index += 1) {
    const date = new Date(start.getTime() + index * DAY_MS);
    const iso = toIsoDay(date);
    buckets.set(iso, {
      iso,
      label: dateFormatter.format(date),
      signups: 0,
      sessions: 0,
      completedSessions: 0,
      notifications: 0,
      revenue: 0,
    });
  }

  const end = new Date(start.getTime() + (days - 1) * DAY_MS);
  end.setHours(23, 59, 59, 999);

  for (const user of users) {
    const createdAt = parseDate(user.createdAt);
    if (!isWithinRange(createdAt, start, end)) continue;
    const bucket = buckets.get(toIsoDay(createdAt!));
    if (bucket) bucket.signups += 1;
  }

  for (const session of sessions) {
    const scheduled = parseDate(session.scheduledAt);
    if (!isWithinRange(scheduled, start, end)) continue;
    const bucket = buckets.get(toIsoDay(scheduled!));
    if (!bucket) continue;
    bucket.sessions += 1;
    if (COMPLETED_SESSION_STATES.has(session.status)) {
      bucket.completedSessions += 1;
    }
  }

  for (const notification of notifications) {
    const created = parseDate(notification.createdAt) ?? parseDate(notification.deliveredAt);
    if (!isWithinRange(created, start, end)) continue;
    const bucket = buckets.get(toIsoDay(created!));
    if (bucket) bucket.notifications += 1;
  }

  for (const invoice of invoices) {
    const issued = parseDate(invoice.issuedAt) ?? parseDate(invoice.paidAt);
    if (!isWithinRange(issued, start, end)) continue;
    const bucket = buckets.get(toIsoDay(issued!));
    if (bucket) bucket.revenue += invoice.amount;
  }

  return Array.from(buckets.values());
}

function computeDistribution(users: SystemUserRecord[]): SystemDistributionSegment[] {
  if (!users.length) {
    return [
      { key: 'empty', label: 'Sem dados', value: 0, percentage: 0, tone: 'neutral' },
    ];
  }

  const counts = new Map<string, number>();
  for (const user of users) {
    const key = user.role ?? 'unknown';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const total = users.length;
  const labelMap: Record<string, string> = {
    admin: 'Admins',
    trainer: 'Treinadores',
    client: 'Clientes',
    staff: 'Equipa interna',
    guest: 'Convidados',
    unknown: 'Outros',
  };
  const toneMap: Record<string, SystemDistributionSegment['tone']> = {
    admin: 'info',
    trainer: 'positive',
    client: 'neutral',
    staff: 'info',
    guest: 'neutral',
    unknown: 'neutral',
  };

  return Array.from(counts.entries())
    .map(([key, value]) => ({
      key,
      label: labelMap[key] ?? key,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      tone: toneMap[key] ?? 'neutral',
    }))
    .sort((a, b) => b.value - a.value);
}

function computeHighlights(options: {
  sessions: SystemSessionRecord[];
  notifications: SystemNotificationRecord[];
  invoices: SystemInvoiceRecord[];
  now: Date;
}): SystemHighlight[] {
  const { sessions, notifications, invoices, now } = options;

  const recentSessions = sessions.filter((session) =>
    isWithinRange(parseDate(session.scheduledAt), new Date(now.getTime() - 7 * DAY_MS), now),
  );
  const completedSessions = recentSessions.filter((session) => COMPLETED_SESSION_STATES.has(session.status)).length;
  const cancelledSessions = recentSessions.filter((session) => CANCELLED_SESSION_STATES.has(session.status)).length;
  const completionRate = recentSessions.length > 0 ? (completedSessions / recentSessions.length) * 100 : 0;

  const delivered = notifications.filter((notification) =>
    isWithinRange(parseDate(notification.deliveredAt) ?? parseDate(notification.createdAt), new Date(now.getTime() - 7 * DAY_MS), now),
  );
  const deliveredCount = delivered.filter((notification) => DELIVERED_NOTIFICATION_STATES.has(notification.status)).length;
  const failedCount = delivered.filter((notification) => FAILED_NOTIFICATION_STATES.has(notification.status)).length;
  const deliveryRate = delivered.length > 0 ? (deliveredCount / delivered.length) * 100 : 0;

  const outstanding = invoices
    .filter((invoice) => invoice.status === 'pending' || invoice.status === 'unknown')
    .reduce((sum, invoice) => sum + (Number.isFinite(invoice.amount) ? invoice.amount : 0), 0);
  const refunded = invoices
    .filter((invoice) => invoice.status === 'refunded')
    .reduce((sum, invoice) => sum + (Number.isFinite(invoice.amount) ? invoice.amount : 0), 0);

  const highlights: SystemHighlight[] = [
    {
      id: 'sessions-completion',
      title: 'Taxa de conclusão de sessões',
      description:
        recentSessions.length > 0
          ? `${completedSessions} concluídas e ${cancelledSessions} canceladas nos últimos 7 dias.`
          : 'Ainda sem sessões recentes para calcular a taxa.',
      tone: completionRate >= 75 ? 'positive' : completionRate >= 50 ? 'warning' : 'critical',
      value: formatPercent(completionRate),
      meta: recentSessions.length > 0 ? `${recentSessions.length} sessões analisadas` : undefined,
    },
    {
      id: 'notifications-delivery',
      title: 'Entregabilidade de notificações',
      description:
        delivered.length > 0
          ? `${deliveredCount} entregues com ${failedCount} falhas nos últimos 7 dias.`
          : 'Sem envios recentes no período analisado.',
      tone: deliveryRate >= 92 ? 'positive' : deliveryRate >= 75 ? 'warning' : 'critical',
      value: formatPercent(deliveryRate),
      meta: delivered.length > 0 ? `${delivered.length} envios avaliados` : undefined,
    },
    {
      id: 'billing-outstanding',
      title: 'Valor por receber',
      description:
        outstanding > 0
          ? 'Soma de faturas pendentes e em validação. Considera priorizar follow-ups.'
          : 'Todas as faturas estão regularizadas.',
      tone: outstanding > 0 ? 'warning' : 'positive',
      value: formatCurrency(outstanding),
      meta: refunded > 0 ? `${formatCurrency(refunded)} devolvido no período` : undefined,
    },
  ];

  return highlights;
}

function buildActivity(
  users: SystemUserRecord[],
  sessions: SystemSessionRecord[],
  notifications: SystemNotificationRecord[],
  invoices: SystemInvoiceRecord[],
  now: Date,
): SystemActivityRow[] {
  const events: Array<{
    id: string;
    type: SystemActivityRow['type'];
    when: string | null;
    title: string;
    detail: string | null;
    tone: SystemActivityRow['tone'];
  }> = [];

  for (const user of users) {
    if (!user.createdAt) continue;
    events.push({
      id: `signup-${user.id}`,
      type: 'signup',
      when: user.createdAt,
      title: user.role === 'trainer' ? 'Novo treinador' : user.role === 'admin' ? 'Novo admin' : 'Novo utilizador',
      detail: `${user.id.slice(0, 8)} · ${user.role}`,
      tone: 'info',
    });
  }

  for (const session of sessions) {
    const when = session.scheduledAt ?? null;
    events.push({
      id: `session-${session.id}`,
      type: 'session',
      when,
      title: session.status === 'completed' ? 'Sessão concluída' : CANCELLED_SESSION_STATES.has(session.status)
        ? 'Sessão cancelada'
        : UPCOMING_SESSION_STATES.has(session.status)
        ? 'Sessão agendada'
        : 'Sessão actualizada',
      detail: [session.clientName, session.trainerName, session.location].filter(Boolean).join(' • ') || null,
      tone: CANCELLED_SESSION_STATES.has(session.status)
        ? 'warning'
        : session.status === 'completed'
        ? 'positive'
        : 'neutral',
    });
  }

  for (const notification of notifications) {
    const when = notification.deliveredAt ?? notification.createdAt ?? null;
    events.push({
      id: `notification-${notification.id}`,
      type: 'notification',
      when,
      title: notification.title ?? 'Notificação enviada',
      detail: [notification.channel, notification.targetName].filter(Boolean).join(' • ') || null,
      tone: FAILED_NOTIFICATION_STATES.has(notification.status)
        ? 'critical'
        : DELIVERED_NOTIFICATION_STATES.has(notification.status)
        ? 'positive'
        : 'info',
    });
  }

  for (const invoice of invoices) {
    const when = invoice.paidAt ?? invoice.issuedAt ?? null;
    events.push({
      id: `invoice-${invoice.id}`,
      type: 'billing',
      when,
      title: invoice.status === 'paid' ? 'Pagamento confirmado' : invoice.status === 'refunded' ? 'Reembolso efectuado' : 'Faturação actualizada',
      detail: invoice.clientName ? `${invoice.clientName} • ${formatCurrency(invoice.amount)}` : formatCurrency(invoice.amount),
      tone:
        invoice.status === 'paid'
          ? 'positive'
          : invoice.status === 'refunded'
          ? 'info'
          : invoice.status === 'pending'
          ? 'warning'
          : 'neutral',
    });
  }

  return events
    .filter((event) => event.when)
    .sort((a, b) => {
      const aDate = parseDate(a.when);
      const bDate = parseDate(b.when);
      const aMs = aDate ? aDate.getTime() : 0;
      const bMs = bDate ? bDate.getTime() : 0;
      return bMs - aMs;
    })
    .slice(0, 24)
    .map((event) => ({
      id: event.id,
      type: event.type,
      title: event.title,
      detail: event.detail,
      when: event.when,
      relative: formatRelative(event.when, now),
      tone: event.tone,
    }));
}

export function buildSystemDashboard(input: SystemDashboardInput): SystemDashboardData {
  const now = new Date(input.now.getTime());
  const rangeDays = Number.isFinite(input.rangeDays) ? Math.min(Math.max(Math.round(input.rangeDays), 7), 90) : 14;
  const since = toStartOfDay(new Date(now.getTime() - (rangeDays - 1) * DAY_MS));
  const until = new Date(since.getTime() + (rangeDays - 1) * DAY_MS);
  until.setHours(23, 59, 59, 999);

  const timeline = computeTimeline(since, rangeDays, input.users, input.sessions, input.notifications, input.invoices);
  const distribution = computeDistribution(input.users);
  const highlights = computeHighlights({
    sessions: input.sessions,
    notifications: input.notifications,
    invoices: input.invoices,
    now,
  });
  const activity = buildActivity(input.users, input.sessions, input.notifications, input.invoices, now);

  const totalUsers = input.users.length;
  const activeUsers = input.users.filter((user) => user.status === 'active' || user.status === 'invited').length;
  const newUsers7d = input.users.filter((user) =>
    isWithinRange(parseDate(user.createdAt), new Date(now.getTime() - 7 * DAY_MS), now),
  ).length;

  const sessionsToday = input.sessions.filter((session) => {
    const scheduled = parseDate(session.scheduledAt);
    return scheduled ? toIsoDay(scheduled) === toIsoDay(now) : false;
  }).length;
  const sessionsNext7d = input.sessions.filter((session) =>
    isWithinRange(parseDate(session.scheduledAt), now, new Date(now.getTime() + 7 * DAY_MS)),
  ).length;

  const notifications24h = input.notifications.filter((notification) =>
    isWithinRange(
      parseDate(notification.createdAt) ?? parseDate(notification.deliveredAt),
      new Date(now.getTime() - 24 * 60 * 60 * 1000),
      now,
    ),
  ).length;
  const failed24h = input.notifications.filter((notification) =>
    FAILED_NOTIFICATION_STATES.has(notification.status) &&
    isWithinRange(parseDate(notification.createdAt) ?? parseDate(notification.deliveredAt), new Date(now.getTime() - 24 * 60 * 60 * 1000), now),
  ).length;

  const revenue30d = input.invoices
    .filter((invoice) => invoice.status === 'paid')
    .filter((invoice) => isWithinRange(parseDate(invoice.paidAt) ?? parseDate(invoice.issuedAt), new Date(now.getTime() - 30 * DAY_MS), now))
    .reduce((sum, invoice) => sum + (Number.isFinite(invoice.amount) ? invoice.amount : 0), 0);
  const outstanding = input.invoices
    .filter((invoice) => invoice.status === 'pending' || invoice.status === 'unknown')
    .reduce((sum, invoice) => sum + (Number.isFinite(invoice.amount) ? invoice.amount : 0), 0);

  const hero: SystemHeroMetric[] = [
    {
      key: 'total-users',
      label: 'Utilizadores totais',
      value: formatNumber(totalUsers),
      hint: newUsers7d > 0 ? `${formatNumber(newUsers7d)} novos/7 dias` : 'Sem novos registos esta semana',
      tone: 'positive',
    },
    {
      key: 'active-users',
      label: 'Clientes activos',
      value: formatNumber(activeUsers),
      hint: totalUsers > 0 ? `${formatPercent((activeUsers / totalUsers) * 100)} da base` : 'Sem utilizadores activos',
      tone: activeUsers > 0 ? 'positive' : 'neutral',
    },
    {
      key: 'sessions-today',
      label: 'Sessões hoje',
      value: formatNumber(sessionsToday),
      hint: sessionsNext7d > 0 ? `${formatNumber(sessionsNext7d)} agendadas/7 dias` : 'Sem sessões nos próximos dias',
      trend: sessionsToday > 0 ? 'Agenda com actividade' : 'Sugere incentivar reservas',
      tone: sessionsToday > 0 ? 'positive' : 'warning',
    },
    {
      key: 'notifications-24h',
      label: 'Notificações (24h)',
      value: formatNumber(notifications24h),
      hint: failed24h > 0 ? `${failed24h} falhas a investigar` : 'Sem falhas reportadas',
      tone: failed24h > 0 ? 'warning' : notifications24h > 0 ? 'info' : 'neutral',
    },
    {
      key: 'revenue-30d',
      label: 'Receita confirmada (30 dias)',
      value: formatCurrency(revenue30d),
      hint: outstanding > 0 ? `${formatCurrency(outstanding)} por receber` : 'Sem montantes pendentes',
      tone: revenue30d > 0 ? 'positive' : 'neutral',
    },
  ];

  return {
    generatedAt: now.toISOString(),
    range: {
      label: `${dateFormatter.format(since)} – ${dateFormatter.format(until)}`,
      days: rangeDays,
      since: since.toISOString(),
      until: until.toISOString(),
    },
    totals: {
      users: totalUsers,
      activeUsers,
      sessions: input.sessions.length,
      notifications: input.notifications.length,
      revenue: revenue30d,
    },
    hero,
    timeline,
    distribution,
    highlights,
    activity,
  } satisfies SystemDashboardData;
}
