import type {
  AdminAuditDashboardData,
  AuditLogActorShare,
  AuditLogHeroMetric,
  AuditLogHighlight,
  AuditLogKindShare,
  AuditLogMeta,
  AuditLogRow,
  AuditLogTimelinePoint,
} from './types';

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function startOfDay(value: Date): Date {
  const clone = new Date(value);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function differenceInDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

function normaliseLabel(value: string | null | undefined): string {
  if (!value) return '—';
  const trimmed = value.trim();
  if (!trimmed) return '—';
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed;
}

function normaliseKind(kind: string | null | undefined): string {
  if (!kind) return 'outros';
  const trimmed = kind.trim();
  if (!trimmed) return 'outros';
  return trimmed.toLowerCase();
}

function isSecurityEvent(kind: string | null | undefined): boolean {
  if (!kind) return false;
  const normalised = kind.toUpperCase();
  return normalised.includes('LOGIN') || normalised.includes('LOGOUT') || normalised.includes('SUSPEND');
}

function isPlanEvent(kind: string | null | undefined): boolean {
  if (!kind) return false;
  const normalised = kind.toUpperCase();
  return normalised.includes('PLAN');
}

function isUserEvent(kind: string | null | undefined): boolean {
  if (!kind) return false;
  const normalised = kind.toUpperCase();
  return normalised.includes('USER') || normalised.includes('INVITE');
}

function toTimeline(rows: AuditLogRow[], now: Date): AuditLogTimelinePoint[] {
  const rangeDays = 14;
  const start = startOfDay(new Date(now.getTime() - (rangeDays - 1) * 86_400_000));
  const buckets = new Map<string, AuditLogTimelinePoint>();

  for (let i = 0; i < rangeDays; i++) {
    const date = new Date(start.getTime() + i * 86_400_000);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, {
      date: key,
      total: 0,
      security: 0,
      plans: 0,
      users: 0,
    });
  }

  rows.forEach((row) => {
    if (!row.created_at) return;
    const parsed = new Date(row.created_at);
    if (!Number.isFinite(parsed.getTime())) return;
    const key = startOfDay(parsed).toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) return;
    bucket.total += 1;
    if (isSecurityEvent(row.kind)) bucket.security += 1;
    if (isPlanEvent(row.kind)) bucket.plans += 1;
    if (isUserEvent(row.kind)) bucket.users += 1;
  });

  return Array.from(buckets.values());
}

function toKindShares(rows: AuditLogRow[]): AuditLogKindShare[] {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const key = normaliseKind(row.kind);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([kind, count]) => ({ kind, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function toActorShares(rows: AuditLogRow[]): AuditLogActorShare[] {
  const counts = new Map<string, { label: string; count: number }>();
  rows.forEach((row) => {
    const key = row.actor_id ?? row.actor ?? '—';
    const label = normaliseLabel(row.actor) ?? '—';
    const current = counts.get(key);
    if (current) {
      current.count += 1;
    } else {
      counts.set(key, { label, count: 1 });
    }
  });
  return Array.from(counts.entries())
    .map(([id, value]) => ({ id: id === '—' ? null : id, label: value.label, count: value.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function toHighlights(rows: AuditLogRow[], now: Date): AuditLogHighlight[] {
  const sorted = [...rows]
    .filter((row) => row.created_at)
    .sort((a, b) => {
      const timeA = new Date(a.created_at ?? 0).getTime();
      const timeB = new Date(b.created_at ?? 0).getTime();
      return timeB - timeA;
    })
    .slice(0, 6);

  return sorted.map((row) => {
    const createdAt = row.created_at ?? new Date().toISOString();
    const date = new Date(createdAt);
    const kind = row.kind ? row.kind.toUpperCase() : 'EVENTO';
    let tone: AuditLogHighlight['tone'] = 'info';
    if (isSecurityEvent(row.kind)) tone = 'warning';
    if (kind.includes('DELETE') || kind.includes('SUSPEND')) tone = 'danger';
    if (kind.includes('CREATE') || kind.includes('APPROVE')) tone = 'success';

    return {
      id: row.id,
      label: normaliseLabel(row.action ?? row.kind ?? 'Evento do sistema'),
      description: row.target
        ? `${row.target}${row.note ? ` · ${row.note}` : ''}`
        : row.note ?? 'Sem detalhes adicionais.',
      createdAt: DATE_TIME_FORMATTER.format(date),
      tone,
    } satisfies AuditLogHighlight;
  });
}

export function computeHeroMetrics(rows: AuditLogRow[], now: Date): AuditLogHeroMetric[] {
  const totalToday = rows.filter((row) => {
    if (!row.created_at) return false;
    const created = new Date(row.created_at);
    if (!Number.isFinite(created.getTime())) return false;
    return differenceInDays(now, created) === 0;
  }).length;

  const totalSecurity24h = rows.filter((row) => {
    if (!row.created_at) return false;
    const created = new Date(row.created_at);
    if (!Number.isFinite(created.getTime())) return false;
    return now.getTime() - created.getTime() <= 86_400_000 && isSecurityEvent(row.kind);
  }).length;

  const planEvents7d = rows.filter((row) => {
    if (!row.created_at) return false;
    const created = new Date(row.created_at);
    if (!Number.isFinite(created.getTime())) return false;
    return now.getTime() - created.getTime() <= 7 * 86_400_000 && isPlanEvent(row.kind);
  }).length;

  const userEvents30d = rows.filter((row) => {
    if (!row.created_at) return false;
    const created = new Date(row.created_at);
    if (!Number.isFinite(created.getTime())) return false;
    return now.getTime() - created.getTime() <= 30 * 86_400_000 && isUserEvent(row.kind);
  }).length;

  return [
    {
      id: 'total-today',
      label: 'Eventos hoje',
      value: String(totalToday),
      helper: 'registos nas últimas 24 horas',
      tone: 'primary',
    },
    {
      id: 'security',
      label: 'Alertas de segurança',
      value: String(totalSecurity24h),
      helper: 'últimas 24 h',
      tone: totalSecurity24h > 3 ? 'warning' : 'neutral',
    },
    {
      id: 'plans',
      label: 'Alterações de planos',
      value: String(planEvents7d),
      helper: 'últimos 7 dias',
      tone: 'teal',
    },
    {
      id: 'users',
      label: 'Eventos de utilizadores',
      value: String(userEvents30d),
      helper: 'últimos 30 dias',
      tone: 'danger',
    },
  ];
}

export function computeDashboard(rows: AuditLogRow[], now: Date = new Date()): AdminAuditDashboardData {
  const heroMetrics = computeHeroMetrics(rows, now);
  const timeline = toTimeline(rows, now);
  const kindShares = toKindShares(rows);
  const actorShares = toActorShares(rows);
  const highlights = toHighlights(rows, now);
  return {
    generatedAt: now.toISOString(),
    heroMetrics,
    timeline,
    kindShares,
    actorShares,
    highlights,
  } satisfies AdminAuditDashboardData;
}

export function computeMeta(rows: AuditLogRow[]): AuditLogMeta {
  const kinds = new Set<string>();
  const targetTypes = new Set<string>();
  const actors = new Map<string | null, string | null>();

  rows.forEach((row) => {
    if (row.kind) kinds.add(row.kind);
    if (row.target_type) targetTypes.add(row.target_type);
    const actorId = row.actor_id ?? null;
    const actorLabel = row.actor ?? row.actor_id ?? null;
    if (!actors.has(actorId)) actors.set(actorId, actorLabel);
  });

  return {
    kinds: Array.from(kinds).sort(),
    targetTypes: Array.from(targetTypes).sort(),
    actors: Array.from(actors.entries()).map(([id, label]) => ({ id, label })),
  };
}
