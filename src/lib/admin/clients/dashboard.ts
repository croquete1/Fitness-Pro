import {
  type AdminClientDistributionSegment,
  type AdminClientHeroMetric,
  type AdminClientHighlight,
  type AdminClientRecord,
  type AdminClientRiskLevel,
  type AdminClientRow,
  type AdminClientStatusKey,
  type AdminClientTimelinePoint,
  type AdminClientsDashboardData,
} from './types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const statusLabel: Record<AdminClientStatusKey, string> = {
  active: 'Ativo',
  pending: 'Pendente',
  suspended: 'Suspenso',
  inactive: 'Inativo',
  unknown: 'Indefinido',
};

const statusTone: Record<AdminClientStatusKey, 'primary' | 'positive' | 'warning' | 'danger' | 'neutral'> = {
  active: 'positive',
  pending: 'warning',
  suspended: 'danger',
  inactive: 'neutral',
  unknown: 'neutral',
};

function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatCurrency(value: number, currency = 'EUR') {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function parseDate(value: string | number | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toIso(date: Date | null): string | null {
  return date ? new Date(date.getTime()).toISOString() : null;
}

function startOfWeek(date: Date) {
  const copy = new Date(date.getTime());
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function formatWeekLabel(date: Date) {
  const end = new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000);
  const startLabel = date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  const endLabel = end.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  return `${startLabel} – ${endLabel}`;
}

function normaliseStatus(status: string | null | undefined, active: boolean | null | undefined): AdminClientStatusKey {
  if (!status && active == null) return 'unknown';
  const value = status?.toString().trim().toUpperCase();
  if (value === 'ACTIVE') return 'active';
  if (value === 'PENDING' || value === 'WAITING') return 'pending';
  if (value === 'SUSPENDED' || value === 'BLOCKED') return 'suspended';
  if (value === 'CANCELLED' || value === 'ARCHIVED' || active === false) return 'inactive';
  if (active === true) return 'active';
  return 'unknown';
}

function toRiskLevel(score: number | null | undefined): AdminClientRiskLevel {
  if (!Number.isFinite(score as number)) return 'healthy';
  const value = Number(score);
  if (value >= 0.7) return 'critical';
  if (value >= 0.4) return 'watch';
  return 'healthy';
}

function riskLabel(level: AdminClientRiskLevel): string {
  switch (level) {
    case 'critical':
      return 'Risco elevado';
    case 'watch':
      return 'Monitorização';
    default:
      return 'Saudável';
  }
}

function riskTone(level: AdminClientRiskLevel): 'positive' | 'warning' | 'danger' {
  switch (level) {
    case 'critical':
      return 'danger';
    case 'watch':
      return 'warning';
    default:
      return 'positive';
  }
}

function walletTone(balance: number | null | undefined): 'positive' | 'warning' | 'danger' | 'neutral' {
  if (!Number.isFinite(balance as number)) return 'neutral';
  const value = Number(balance);
  if (value > 50) return 'positive';
  if (value >= 0) return 'neutral';
  if (value >= -25) return 'warning';
  return 'danger';
}

function spendTone(amount: number): 'positive' | 'warning' | 'neutral' {
  if (amount >= 500) return 'positive';
  if (amount <= 50) return 'warning';
  return 'neutral';
}

function computeHeroMetrics(
  rows: AdminClientRow[],
  records: AdminClientRecord[],
  opts: { now: Date; weeks: number },
): AdminClientHeroMetric[] {
  const total = rows.length;
  const active = rows.filter((row) => row.statusKey === 'active').length;
  const risk = rows.filter((row) => row.riskLevel !== 'healthy').length;
  const upcoming = rows.filter((row) => row.nextSessionAt).length;

  const totalSessions = records.reduce((acc, record) => acc + (record.sessionsCompleted30d ?? 0), 0);
  const totalRevenue = records.reduce((acc, record) => acc + (record.invoicesPaidTotal30d ?? 0), 0);

  const weeks = Math.max(opts.weeks, 1);
  const sessionsPerClient = total > 0 ? totalSessions / total : 0;
  const revenuePerClient = total > 0 ? totalRevenue / total : 0;

  return [
    {
      id: 'clients-total',
      label: 'Clientes activos',
      value: formatNumber(active),
      helper: total > 0 ? `${formatNumber((active / total) * 100, 0)}% do total (${formatNumber(total)})` : 'Sem clientes',
      tone: 'primary',
    },
    {
      id: 'clients-sessions',
      label: 'Sessões / 30 dias',
      value: formatNumber(totalSessions, 0),
      helper: total > 0 ? `${sessionsPerClient.toFixed(1)} por cliente` : 'Sem sessões registadas',
      tone: totalSessions > 0 ? 'positive' : 'warning',
    },
    {
      id: 'clients-revenue',
      label: 'Receita 30 dias',
      value: formatCurrency(totalRevenue),
      helper: totalRevenue > 0 ? `${formatCurrency(revenuePerClient)} por cliente` : 'Sem faturação associada',
      tone: totalRevenue > 0 ? 'positive' : 'warning',
    },
    {
      id: 'clients-upcoming',
      label: 'Com sessões agendadas',
      value: formatNumber(upcoming),
      helper:
        upcoming > 0
          ? `${formatNumber((upcoming / (total || 1)) * 100, 0)}% com próxima sessão`
          : 'Sem sessões futuras registadas',
      tone: upcoming > 0 ? 'primary' : 'warning',
    },
    {
      id: 'clients-risk',
      label: 'Em risco',
      value: formatNumber(risk),
      helper:
        risk > 0
          ? `${formatNumber((risk / (total || 1)) * 100, 0)}% precisam de acompanhamento`
          : 'Nenhum cliente sinalizado',
      tone: risk > 0 ? 'warning' : 'positive',
    },
  ];
}

function computeTimeline(records: AdminClientRecord[], opts: { now: Date; weeks: number }): AdminClientTimelinePoint[] {
  const { now } = opts;
  const weeks = Math.max(opts.weeks, 1);
  const start = startOfWeek(new Date(now.getTime() - (weeks - 1) * WEEK_MS));

  const timeline = new Map<string, AdminClientTimelinePoint>();
  for (let index = 0; index < weeks; index += 1) {
    const point = new Date(start.getTime() + index * WEEK_MS);
    const weekKey = point.toISOString().slice(0, 10);
    timeline.set(weekKey, {
      week: weekKey,
      label: formatWeekLabel(point),
      newClients: 0,
      activeClients: 0,
      sessionsCompleted: 0,
    });
  }

  for (const record of records) {
    const created = parseDate(record.createdAt);
    if (created && created >= start && created <= now) {
      const createdWeek = startOfWeek(created).toISOString().slice(0, 10);
      const bucket = timeline.get(createdWeek);
      if (bucket) bucket.newClients += 1;
    }

    const lastActive = parseDate(record.lastActiveAt ?? record.lastSignInAt);
    if (lastActive && lastActive >= start && lastActive <= now) {
      const activeWeek = startOfWeek(lastActive).toISOString().slice(0, 10);
      const bucket = timeline.get(activeWeek);
      if (bucket) bucket.activeClients += 1;
    }

    const sessions = record.sessionsCompletedRange ?? record.sessionsCompleted30d ?? 0;
    if (sessions > 0) {
      const perWeek = sessions / weeks;
      for (const bucket of timeline.values()) {
        bucket.sessionsCompleted += perWeek;
      }
    }
  }

  return Array.from(timeline.values());
}

function computeDistribution(
  records: AdminClientRecord[],
  selector: (record: AdminClientRecord) => string,
  labelResolver: (key: string) => { label: string; tone: 'primary' | 'positive' | 'warning' | 'danger' | 'neutral' },
): AdminClientDistributionSegment[] {
  if (!records.length) {
    return [
      { id: 'empty', label: 'Sem dados', total: 0, share: 0, tone: 'neutral' },
    ];
  }

  const counts = new Map<string, number>();
  for (const record of records) {
    const key = selector(record);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const total = Array.from(counts.values()).reduce((acc, value) => acc + value, 0) || 1;

  return Array.from(counts.entries())
    .map(([key, value]) => {
      const { label, tone } = labelResolver(key);
      return {
        id: key,
        label,
        total: value,
        share: value / total,
        tone,
      } satisfies AdminClientDistributionSegment;
    })
    .sort((a, b) => b.total - a.total);
}

function statusSelector(record: AdminClientRecord): string {
  return normaliseStatus(record.status, record.active);
}

function statusLabelResolver(key: string) {
  const typed = key as AdminClientStatusKey;
  return {
    label: statusLabel[typed] ?? 'Indefinido',
    tone: statusTone[typed] ?? 'neutral',
  } as const;
}

function engagementSelector(record: AdminClientRecord): string {
  const score = Number(record.engagementScore ?? 0);
  if (Number.isNaN(score)) return 'desconhecido';
  if (score >= 0.7) return 'elevada';
  if (score >= 0.4) return 'moderada';
  return 'baixa';
}

function engagementLabelResolver(key: string) {
  switch (key) {
    case 'elevada':
      return { label: 'Elevada', tone: 'positive' } as const;
    case 'moderada':
      return { label: 'Moderada', tone: 'primary' } as const;
    case 'baixa':
      return { label: 'Baixa', tone: 'warning' } as const;
    default:
      return { label: 'Desconhecida', tone: 'neutral' } as const;
  }
}

function trainerSelector(record: AdminClientRecord): string {
  return record.trainerName?.trim() || 'Sem treinador atribuído';
}

function trainerLabelResolver(label: string) {
  if (!label || label === 'Sem treinador atribuído') {
    return { label: 'Sem treinador atribuído', tone: 'warning' } as const;
  }
  return { label, tone: 'primary' } as const;
}

function walletSelector(record: AdminClientRecord): string {
  const balance = Number(record.walletBalance ?? 0);
  if (Number.isNaN(balance)) return 'desconhecido';
  if (balance >= 100) return '100+ €';
  if (balance >= 25) return '25 – 99 €';
  if (balance >= 0) return '0 – 24 €';
  if (balance >= -25) return '-1 – -25 €';
  return '< -25 €';
}

function walletLabelResolver(key: string) {
  switch (key) {
    case '100+ €':
      return { label: 'Saldo superior a 100 €', tone: 'positive' } as const;
    case '25 – 99 €':
      return { label: 'Saldo entre 25 e 99 €', tone: 'primary' } as const;
    case '0 – 24 €':
      return { label: 'Saldo residual', tone: 'neutral' } as const;
    case '-1 – -25 €':
      return { label: 'Saldo negativo ligeiro', tone: 'warning' } as const;
    case '< -25 €':
      return { label: 'Saldo negativo crítico', tone: 'danger' } as const;
    default:
      return { label: 'Sem saldo', tone: 'neutral' } as const;
  }
}

function buildHighlights(rows: AdminClientRow[], records: AdminClientRecord[]) {
  const formatHelper = (record: AdminClientRecord) => {
    const sessions = record.sessionsCompleted30d ?? 0;
    const pending = record.sessionsScheduled7d ?? 0;
    const spend = record.invoicesPaidTotal30d ?? 0;
    return `${formatNumber(sessions)} sessões / ${formatNumber(pending)} agendadas • ${formatCurrency(spend)}`;
  };

  const revenue = [...records]
    .sort((a, b) => (b.invoicesPaidTotal30d ?? 0) - (a.invoicesPaidTotal30d ?? 0))
    .slice(0, 5)
    .map((record) => {
      const row = rows.find((item) => item.id === record.id);
      return {
        id: record.id,
        name: row?.displayName ?? record.name ?? record.email ?? record.id,
        email: record.email ?? null,
        statusLabel: row?.statusLabel ?? 'Cliente',
        statusTone: row?.statusTone ?? 'primary',
        trainerName: record.trainerName ?? null,
        helper: formatHelper(record),
        amount: formatCurrency(record.invoicesPaidTotal30d ?? 0),
      } satisfies AdminClientHighlight;
    });

  const risk = [...records]
    .sort((a, b) => (b.churnRiskScore ?? 0) - (a.churnRiskScore ?? 0))
    .slice(0, 5)
    .map((record) => {
      const row = rows.find((item) => item.id === record.id);
      const level = row?.riskLevel ?? toRiskLevel(record.churnRiskScore);
      return {
        id: record.id,
        name: row?.displayName ?? record.name ?? record.email ?? record.id,
        email: record.email ?? null,
        statusLabel: row?.statusLabel ?? 'Cliente',
        statusTone: row?.statusTone ?? 'warning',
        trainerName: record.trainerName ?? null,
        helper: `${riskLabel(level)} • ${formatHelper(record)}`,
        amount: formatCurrency(record.invoicesPendingTotal30d ?? 0),
      } satisfies AdminClientHighlight;
    });

  const newcomers = [...records]
    .sort((a, b) => {
      const aCreated = parseDate(a.createdAt)?.getTime() ?? 0;
      const bCreated = parseDate(b.createdAt)?.getTime() ?? 0;
      return bCreated - aCreated;
    })
    .slice(0, 5)
    .map((record) => {
      const row = rows.find((item) => item.id === record.id);
      const createdAt = parseDate(record.createdAt);
      const helper = createdAt
        ? `Criado em ${createdAt.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
          })}`
        : 'Sem data';
      return {
        id: record.id,
        name: row?.displayName ?? record.name ?? record.email ?? record.id,
        email: record.email ?? null,
        statusLabel: row?.statusLabel ?? 'Cliente',
        statusTone: row?.statusTone ?? 'primary',
        trainerName: record.trainerName ?? null,
        helper,
      } satisfies AdminClientHighlight;
    });

  return { revenue, atRisk: risk, newcomers };
}

function buildRows(records: AdminClientRecord[]): AdminClientRow[] {
  const rows: AdminClientRow[] = [];

  for (const record of records) {
    const displayName = record.name?.trim() || record.email?.trim() || `Cliente ${record.id}`;
    const statusKey = statusSelector(record) as AdminClientStatusKey;
    const status = statusLabel[statusKey] ?? 'Indefinido';
    const statusToneValue = statusTone[statusKey] ?? 'neutral';

    const balance = Number(record.walletBalance ?? 0);
    const currency = record.walletCurrency ?? 'EUR';
    const walletLabel = Number.isFinite(balance)
      ? formatCurrency(balance, currency)
      : '—';

    const spend = Number(record.invoicesPaidTotal30d ?? 0);
    const spendLabelValue = formatCurrency(spend, currency);

    const sessionsCompleted = record.sessionsCompleted30d ?? 0;
    const scheduled = record.sessionsScheduled7d ?? 0;
    const cancelled = record.sessionsCancelled30d ?? 0;
    const sessionsLabel = `${formatNumber(sessionsCompleted)} concl. / ${formatNumber(scheduled)} ag.`;

    const sessionsTooltip = `Concluídas: ${formatNumber(sessionsCompleted)} • Agendadas: ${formatNumber(
      scheduled,
    )} • Canceladas: ${formatNumber(cancelled)}`;

    const nextSession = parseDate(record.nextSessionAt);
    const nextSessionLabel = nextSession
      ? nextSession.toLocaleString('pt-PT', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Sem agendamento';

    const riskLevelValue = toRiskLevel(record.churnRiskScore);

    rows.push({
      id: record.id,
      displayName,
      email: record.email ?? null,
      statusKey,
      statusLabel: status,
      statusTone: statusToneValue,
      trainerName: record.trainerName ?? null,
      walletLabel,
      walletTone: walletTone(balance),
      walletValue: Number.isFinite(balance) ? balance : 0,
      spendLabel: spendLabelValue,
      spendValue: spend,
      spendTone: spendTone(spend),
      sessionsLabel,
      sessionsTooltip,
      sessionsCompleted,
      sessionsScheduled: scheduled,
      sessionsCancelled: cancelled,
      nextSessionLabel,
      riskLevel: riskLevelValue,
      riskLabel: riskLabel(riskLevelValue),
      riskTone: riskTone(riskLevelValue),
      createdAt: toIso(parseDate(record.createdAt)),
      lastActiveAt: toIso(parseDate(record.lastActiveAt ?? record.lastSignInAt)),
      lastSessionAt: toIso(parseDate(record.lastSessionAt)),
      nextSessionAt: toIso(nextSession),
    });
  }

  return rows;
}

export function buildAdminClientsDashboard(
  records: AdminClientRecord[],
  opts: { supabase?: boolean; fallback?: boolean; now?: Date | string | number; weeks?: number } = {},
): AdminClientsDashboardData {
  const now = parseDate(opts.now) ?? new Date();
  const weeks = Math.max(Math.min(opts.weeks ?? 12, 52), 4);

  const rows = buildRows(records);

  const hero = computeHeroMetrics(rows, records, { now, weeks });
  const timeline = computeTimeline(records, { now, weeks });
  const statuses = computeDistribution(records, statusSelector, statusLabelResolver);
  const engagement = computeDistribution(records, engagementSelector, engagementLabelResolver);
  const trainers = computeDistribution(records, trainerSelector, trainerLabelResolver);
  const wallet = computeDistribution(records, walletSelector, walletLabelResolver);
  const highlights = buildHighlights(rows, records);

  const trainerCounts = trainers
    .filter((segment) => segment.id !== 'Sem treinador atribuído')
    .map((segment) => ({ id: segment.id, name: segment.label, total: segment.total }));

  return {
    supabase: Boolean(opts.supabase),
    fallback: Boolean(opts.fallback),
    updatedAt: now.toISOString(),
    rangeWeeks: weeks,
    hero,
    timeline,
    statuses,
    engagement,
    trainers,
    wallet,
    highlights,
    rows,
    filters: {
      trainers: trainerCounts,
    },
  } satisfies AdminClientsDashboardData;
}
