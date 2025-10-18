import {
  type AuditLogActivityRow,
  type AuditLogDashboardData,
  type AuditLogDistributionSegment,
  type AuditLogHighlight,
  type AuditLogHeroMetric,
  type AuditLogRecord,
  type AuditLogTimelinePoint,
  type BuildAuditLogOptions,
} from './types';

const DAY_MS = 86_400_000;

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', {
  dateStyle: 'short',
  timeStyle: 'medium',
});

const numberFormatter = new Intl.NumberFormat('pt-PT');

const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

const SECURITY_CATEGORY_PREFIXES = ['auth', 'security', 'session', 'access'];
const OPERATIONS_CATEGORY_PREFIXES = ['admin', 'system', 'billing', 'plans', 'clients', 'trainer'];

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toStartOfDay(date: Date): Date {
  const copy = new Date(date.getTime());
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toIsoDay(date: Date): string {
  return toStartOfDay(date).toISOString().slice(0, 10);
}

function classify(record: AuditLogRecord): 'security' | 'operations' | 'content' {
  const kind = record.kind?.toUpperCase() ?? '';
  if (kind.includes('SECURITY') || kind.includes('LOGIN_FAIL') || kind.includes('BREACH')) {
    return 'security';
  }

  const category = record.category?.toLowerCase() ?? '';
  if (SECURITY_CATEGORY_PREFIXES.some((prefix) => category.startsWith(prefix))) {
    return 'security';
  }
  if (OPERATIONS_CATEGORY_PREFIXES.some((prefix) => category.startsWith(prefix))) {
    return 'operations';
  }
  return 'content';
}

function normaliseActor(record: AuditLogRecord): string | null {
  if (record.actor && record.actor.trim().length > 0) return record.actor.trim();
  if (record.actorId) return record.actorId;
  return null;
}

function normaliseCategory(record: AuditLogRecord): string {
  const category = record.category?.trim();
  if (category && category.length > 0) return category;
  const kind = record.kind?.trim();
  if (kind && kind.length > 0) return kind;
  return 'sem_categoria';
}

function formatDetail(record: AuditLogRecord): string | null {
  const candidates = [record.note, record.action, record.target, record.targetType];
  for (const candidate of candidates) {
    if (candidate && candidate.trim().length > 0) return candidate.trim();
  }

  const jsonCandidate = record.details ?? record.meta ?? record.payload;
  if (jsonCandidate && Object.keys(jsonCandidate).length > 0) {
    try {
      const text = JSON.stringify(jsonCandidate);
      if (text.length <= 180) return text;
      return `${text.slice(0, 177)}…`;
    } catch {
      return null;
    }
  }
  return null;
}

function formatRelative(date: Date, now: Date): string {
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const thresholds: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit; size: number }> = [
    { limit: 60_000, unit: 'second', size: 1_000 },
    { limit: 3_600_000, unit: 'minute', size: 60_000 },
    { limit: DAY_MS, unit: 'hour', size: 3_600_000 },
    { limit: 7 * DAY_MS, unit: 'day', size: DAY_MS },
    { limit: 30 * DAY_MS, unit: 'week', size: 7 * DAY_MS },
    { limit: 365 * DAY_MS, unit: 'month', size: 30 * DAY_MS },
    { limit: Infinity, unit: 'year', size: 365 * DAY_MS },
  ];
  const bucket = thresholds.find((item) => absMs < item.limit) ?? thresholds[thresholds.length - 1];
  const value = Math.round(diffMs / bucket.size);
  return relativeFormatter.format(value, bucket.unit);
}

function buildTimelineBuckets(start: Date, rangeDays: number): Map<string, AuditLogTimelinePoint> {
  const buckets = new Map<string, AuditLogTimelinePoint>();
  for (let index = 0; index < rangeDays; index += 1) {
    const current = new Date(start.getTime() + index * DAY_MS);
    buckets.set(toIsoDay(current), {
      iso: toIsoDay(current),
      label: dateFormatter.format(current),
      total: 0,
      security: 0,
      operations: 0,
      content: 0,
      logins: 0,
      failures: 0,
    });
  }
  return buckets;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return numberFormatter.format(Math.round(value));
}

export function buildAuditLogDashboard(
  records: AuditLogRecord[],
  options: BuildAuditLogOptions = {},
): AuditLogDashboardData {
  const now = options.now ?? new Date();
  const rangeDays = options.rangeDays ?? 14;

  const end = toStartOfDay(now);
  const start = new Date(end.getTime() - (rangeDays - 1) * DAY_MS);

  const previousRangeStart = new Date(start.getTime() - rangeDays * DAY_MS);
  const previousRangeEnd = new Date(start.getTime() - DAY_MS);
  previousRangeEnd.setHours(23, 59, 59, 999);

  const timelineBuckets = buildTimelineBuckets(start, rangeDays);
  const categoryCounts = new Map<string, number>();
  const actorCounts = new Map<string, { label: string; count: number }>();
  const targetCounts = new Map<string, { label: string; count: number }>();

  let totalEvents = 0;
  let loginSuccess = 0;
  let loginFailures = 0;
  let criticalEvents = 0;
  let lastEvent: { when: Date; record: AuditLogRecord } | null = null;
  let previousRangeTotal = 0;

  const filtered: Array<{ record: AuditLogRecord; createdAt: Date }> = [];

  for (const record of records) {
    const createdAt = parseDate(record.createdAt);
    if (!createdAt) continue;

    if (createdAt.getTime() >= start.getTime() && createdAt.getTime() <= end.getTime() + (DAY_MS - 1)) {
      filtered.push({ record, createdAt });
    } else if (
      createdAt.getTime() >= previousRangeStart.getTime() &&
      createdAt.getTime() <= previousRangeEnd.getTime()
    ) {
      previousRangeTotal += 1;
    }
  }

  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  for (const { record, createdAt } of filtered) {
    totalEvents += 1;
    if (!lastEvent || createdAt.getTime() > lastEvent.when.getTime()) {
      lastEvent = { when: createdAt, record };
    }

    const classification = classify(record);
    if (classification === 'security') criticalEvents += 1;

    const iso = toIsoDay(createdAt);
    const bucket = timelineBuckets.get(iso);
    if (bucket) {
      bucket.total += 1;
      bucket[classification] += 1;
      const kind = record.kind?.toUpperCase() ?? '';
      const action = record.action?.toLowerCase() ?? '';
      if (kind.includes('LOGIN') || action === 'login') {
        bucket.logins += 1;
      }
      if (kind.includes('FAIL') || action.includes('fail')) {
        bucket.failures += 1;
      }
    }

    const kind = record.kind?.toUpperCase() ?? '';
    const action = record.action?.toLowerCase() ?? '';
    if (kind.includes('LOGIN') || action === 'login') loginSuccess += 1;
    if (kind.includes('FAIL') || action.includes('fail')) loginFailures += 1;

    const category = normaliseCategory(record);
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);

    const actorKey = normaliseActor(record);
    if (actorKey) {
      const entry = actorCounts.get(actorKey) ?? { label: actorKey, count: 0 };
      entry.count += 1;
      if (record.actor && record.actor.trim().length > 0) entry.label = record.actor.trim();
      actorCounts.set(actorKey, entry);
    }

    const targetKey = record.targetId ?? record.target ?? null;
    if (targetKey) {
      const label = record.target ?? record.targetId ?? targetKey;
      const entry = targetCounts.get(targetKey) ?? { label: String(label), count: 0 };
      entry.count += 1;
      targetCounts.set(targetKey, entry);
    }
  }

  const uniqueActors = actorCounts.size;

  const hero: AuditLogHeroMetric[] = [
    {
      key: 'total-events',
      label: 'Eventos registados',
      value: formatNumber(totalEvents),
      hint: `Últimos ${rangeDays} dias`,
      trend:
        previousRangeTotal === 0
          ? undefined
          : `${totalEvents - previousRangeTotal >= 0 ? '+' : ''}${formatNumber(totalEvents - previousRangeTotal)} vs período anterior`,
    },
    {
      key: 'unique-actors',
      label: 'Actores envolvidos',
      value: formatNumber(uniqueActors),
      hint: 'Utilizadores com actividade de auditoria',
    },
    {
      key: 'login-success',
      label: 'Sessões iniciadas',
      value: formatNumber(loginSuccess),
      hint: 'Logins registados',
      tone: loginSuccess > 0 ? 'positive' : 'neutral',
    },
    {
      key: 'critical-events',
      label: 'Alertas críticos',
      value: formatNumber(criticalEvents),
      tone: criticalEvents > 0 ? 'warning' : 'neutral',
      hint: 'Eventos de segurança ou acesso',
    },
  ];

  const distribution: AuditLogDistributionSegment[] = (() => {
    if (totalEvents === 0) {
      return [
        { key: 'empty', label: 'Sem registos no intervalo', value: 0, percentage: 0, tone: 'neutral' },
      ];
    }
    return Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key, value]) => {
        const lower = key.toLowerCase();
        let tone: AuditLogDistributionSegment['tone'];
        if (SECURITY_CATEGORY_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
          tone = 'warning';
        } else if (OPERATIONS_CATEGORY_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
          tone = 'info';
        } else {
          tone = 'neutral';
        }
        return {
          key,
          label: key.replace(/_/g, ' '),
          value,
          percentage: value / totalEvents,
          tone,
        } satisfies AuditLogDistributionSegment;
      });
  })();

  const topActor = Array.from(actorCounts.values()).sort((a, b) => b.count - a.count)[0] ?? null;
  const topCategory = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0] ?? null;
  const topTarget = Array.from(targetCounts.values()).sort((a, b) => b.count - a.count)[0] ?? null;

  const highlights: AuditLogHighlight[] = [];

  if (lastEvent) {
    highlights.push({
      id: 'last-event',
      title: 'Último evento',
      description: lastEvent.record.action ?? lastEvent.record.kind ?? 'Evento registado',
      value: formatRelative(lastEvent.when, now),
      tone: 'info',
      meta: dateTimeFormatter.format(lastEvent.when),
    });
  } else {
    highlights.push({
      id: 'last-event',
      title: 'Último evento',
      description: 'Ainda não foram registados eventos no intervalo seleccionado.',
      value: '—',
      tone: 'neutral',
    });
  }

  if (topActor) {
    highlights.push({
      id: 'top-actor',
      title: 'Actor mais activo',
      description: topActor.label,
      value: `${formatNumber(topActor.count)} acções`,
      tone: 'positive',
    });
  }

  if (loginFailures > 0) {
    highlights.push({
      id: 'login-failures',
      title: 'Tentativas falhadas',
      description: 'Logins que falharam autenticação ou foram bloqueados.',
      value: formatNumber(loginFailures),
      tone: 'warning',
    });
  } else {
    highlights.push({
      id: 'login-failures',
      title: 'Tentativas falhadas',
      description: 'Sem falhas de autenticação reportadas.',
      value: '0',
      tone: 'positive',
    });
  }

  if (topCategory) {
    highlights.push({
      id: 'top-category',
      title: 'Categoria dominante',
      description: topCategory[0].replace(/_/g, ' '),
      value: `${formatNumber(topCategory[1])} eventos`,
      tone: 'info',
      meta: `${Math.round((topCategory[1] / Math.max(1, totalEvents)) * 100)}% do total`,
    });
  }

  if (topTarget) {
    highlights.push({
      id: 'top-target',
      title: 'Recurso mais tocado',
      description: topTarget.label,
      value: `${formatNumber(topTarget.count)} alterações`,
      tone: 'neutral',
    });
  }

  const activity: AuditLogActivityRow[] = filtered.slice(0, 80).map(({ record, createdAt }) => ({
    id: record.id,
    createdAt: createdAt.toISOString(),
    category: record.category,
    action: record.action,
    actor: record.actor ?? record.actorId ?? null,
    target: record.target ?? record.targetId ?? null,
    description: formatDetail(record),
    ip: record.ip,
  }));

  const timeline = Array.from(timelineBuckets.values()).sort((a, b) => (a.iso < b.iso ? -1 : 1));

  return {
    rangeDays,
    generatedAt: now.toISOString(),
    hero,
    timeline,
    distribution,
    highlights,
    activity,
    summary: {
      totalEvents,
      uniqueActors,
      loginSuccess,
      loginFailures,
      criticalEvents,
      lastEventAt: lastEvent?.when.toISOString() ?? null,
    },
  } satisfies AuditLogDashboardData;
}
