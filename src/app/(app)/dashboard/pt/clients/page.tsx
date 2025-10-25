export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/ui/PageHeader';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { brand } from '@/lib/brand';
import { loadTrainerClientOverview } from '@/lib/trainer/clients/server';
import { normalizePhone } from '@/lib/phone';
import { formatRelativeTime } from '@/lib/datetime/relative';

export const metadata: Metadata = {
  title: `Clientes do Personal Trainer · ${brand.name}`,
  description: 'Consulta os clientes associados aos teus planos e sessões.',
};

type Metric = {
  label: string;
  value: number;
  hint?: string;
  tone?: 'primary' | 'info' | 'success' | 'warning' | 'violet';
};

type StatusTone = 'ok' | 'warn' | 'down';

type PlanStatusTone = 'primary' | 'success' | 'warning' | 'violet' | 'info';

type AlertTone = 'warning' | 'info' | 'violet';

type PreparedQuery = {
  raw: string;
  compact: string;
  ascii: string;
  asciiCompact: string;
  rawTokens: string[];
  asciiTokens: string[];
  orthographyAscii: string | null;
  orthographyAsciiCompact: string | null;
  orthographyAsciiTokens: string[];
  digits: string | null;
};

const PREPARED_CANDIDATE_CACHE = new Map<string, PreparedQuery>();

type ClientAlertKey =
  | 'NO_UPCOMING'
  | 'NO_PLAN'
  | 'PLAN_NOT_ACTIVE'
  | 'NO_CONTACT'
  | 'CLIENT_STATUS'
  | 'NO_HISTORY'
  | 'LAST_SESSION_STALE';

type ClientAlert = { key: ClientAlertKey; label: string; tone: AlertTone };

const ALERT_KEYS: ClientAlertKey[] = [
  'NO_UPCOMING',
  'NO_PLAN',
  'PLAN_NOT_ACTIVE',
  'NO_CONTACT',
  'CLIENT_STATUS',
  'NO_HISTORY',
  'LAST_SESSION_STALE',
];

const BASE_PATH = '/dashboard/pt/clients';

const ALERT_SUMMARY_META: Record<ClientAlertKey, { label: string; tone: AlertTone }> = {
  NO_UPCOMING: { label: 'Sem próxima sessão agendada', tone: 'warning' },
  NO_PLAN: { label: 'Sem plano activo', tone: 'info' },
  PLAN_NOT_ACTIVE: { label: 'Planos por activar', tone: 'info' },
  NO_CONTACT: { label: 'Sem contacto directo', tone: 'warning' },
  CLIENT_STATUS: { label: 'Estado do cliente a rever', tone: 'violet' },
  NO_HISTORY: { label: 'Sem histórico de sessões', tone: 'violet' },
  LAST_SESSION_STALE: { label: 'Sessão recente em atraso', tone: 'warning' },
};

const DAY_IN_MS = 86_400_000;
const STALE_SESSION_THRESHOLD_DAYS = 14;
const STALE_SESSION_THRESHOLD_MS = STALE_SESSION_THRESHOLD_DAYS * DAY_IN_MS;

const CLIENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  SUSPENDED: 'Suspenso',
  PENDING: 'Pendente',
};

const PLAN_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  DRAFT: 'Em construção',
  ARCHIVED: 'Arquivado',
  DELETED: 'Removido',
};

function normalize(value: string | null | undefined): string {
  return value ? value.toString().trim().toUpperCase() : '';
}

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const PORTUGUESE_STOP_WORDS = new Set([
  'a',
  'o',
  'os',
  'as',
  'um',
  'uma',
  'uns',
  'umas',
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'ao',
  'aos',
  'à',
  'às',
  'com',
  'para',
  'pra',
  'por',
  'pelo',
  'pela',
  'pelos',
  'pelas',
  'dum',
  'duma',
  'duns',
  'dumas',
  'num',
  'numa',
  'nuns',
  'numas',
  'que',
]);

function splitTokens(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/\s+/g)
        .map((token) => token.trim())
        .filter(Boolean)
        .filter((token) => token.length > 1 && !PORTUGUESE_STOP_WORDS.has(token)),
    ),
  );
}

const PORTUGUESE_ORTHOGRAPHY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/([aeiou])c(?=[pt][aeiou])/g, '$1'],
  [/([aeiou])c(?=c[aeiou])/g, '$1'],
  [/([aeiou])p(?=[tc][aeiou])/g, '$1'],
];

function applyPortugueseOrthographyReform(value: string): string | null {
  if (!value) return null;
  let transformed = value;
  for (const [pattern, replacement] of PORTUGUESE_ORTHOGRAPHY_REPLACEMENTS) {
    transformed = transformed.replace(pattern, replacement);
  }
  return transformed !== value ? transformed : null;
}

function prepareQuery(value: string | null | undefined): PreparedQuery {
  const raw = value ? value.toString().trim().toLocaleLowerCase('pt-PT') : '';
  if (!raw) {
    return {
      raw: '',
      compact: '',
      ascii: '',
      asciiCompact: '',
      rawTokens: [],
      asciiTokens: [],
      orthographyAscii: null,
      orthographyAsciiCompact: null,
      orthographyAsciiTokens: [],
      digits: null,
    } satisfies PreparedQuery;
  }

  const ascii = stripDiacritics(raw);
  const compact = raw.replace(/\s+/g, '');
  const asciiCompact = ascii.replace(/\s+/g, '');
  const orthographyAscii = applyPortugueseOrthographyReform(ascii);
  const orthographyAsciiCompact = asciiCompact
    ? applyPortugueseOrthographyReform(asciiCompact)
    : null;
  const digits = raw.replace(/\D+/g, '');

  return {
    raw,
    compact,
    ascii,
    asciiCompact,
    rawTokens: splitTokens(raw),
    asciiTokens: splitTokens(ascii),
    orthographyAscii,
    orthographyAsciiCompact,
    orthographyAsciiTokens: orthographyAscii ? splitTokens(orthographyAscii) : [],
    digits: digits ? digits : null,
  } satisfies PreparedQuery;
}

function prepareCandidateQuery(value: string | null | undefined): PreparedQuery | null {
  if (!value) return null;
  const trimmed = value.toString().trim();
  if (!trimmed) return null;
  const cacheKey = trimmed.toLocaleLowerCase('pt-PT');
  const cached = PREPARED_CANDIDATE_CACHE.get(cacheKey);
  if (cached) return cached;
  const prepared = prepareQuery(trimmed);
  if (!prepared.raw) return null;
  PREPARED_CANDIDATE_CACHE.set(cacheKey, prepared);
  return prepared;
}

function clientStatusTone(value: string | null | undefined): StatusTone {
  const normalized = normalize(value);
  if (normalized === 'ACTIVE') return 'ok';
  if (normalized === 'SUSPENDED') return 'down';
  if (!normalized || normalized === 'PENDING') return 'warn';
  return 'warn';
}

function clientStatusLabel(value: string | null | undefined): string {
  const normalized = normalize(value);
  return CLIENT_STATUS_LABELS[normalized] ?? (value || '—');
}

function planBadgeTone(value: string | null | undefined): PlanStatusTone {
  const normalized = normalize(value);
  if (normalized === 'ACTIVE') return 'success';
  if (normalized === 'ARCHIVED') return 'info';
  if (normalized === 'DELETED') return 'violet';
  return 'warning';
}

function planStatusLabel(value: string | null | undefined): string {
  const normalized = normalize(value);
  if (!normalized) return 'Sem plano activo';
  return PLAN_STATUS_LABELS[normalized] ?? value ?? 'Sem plano activo';
}

function formatTimestamp(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('pt-PT');
}

function relativeLabel(value: string | null, empty: string, now: Date = new Date()): string {
  const relative = formatRelativeTime(value, now);
  if (relative) return relative;
  if (value) {
    const formatted = formatTimestamp(value);
    if (formatted) return formatted;
  }
  return empty;
}

type MutableClientRowSearchIndex = {
  raw: Set<string>;
  ascii: Set<string>;
  compact: Set<string>;
  asciiCompact: Set<string>;
  digits: Set<string>;
};

function createMutableSearchIndex(): MutableClientRowSearchIndex {
  return {
    raw: new Set<string>(),
    ascii: new Set<string>(),
    compact: new Set<string>(),
    asciiCompact: new Set<string>(),
    digits: new Set<string>(),
  } satisfies MutableClientRowSearchIndex;
}

function pushSearchCandidate(index: MutableClientRowSearchIndex, value: string | null | undefined) {
  const prepared = prepareCandidateQuery(value);
  if (!prepared || !prepared.raw) return;

  index.raw.add(prepared.raw);

  if (prepared.ascii) {
    index.ascii.add(prepared.ascii);
    if (prepared.orthographyAscii) {
      index.ascii.add(prepared.orthographyAscii);
    }
  }

  if (prepared.compact) {
    index.compact.add(prepared.compact);
  }

  if (prepared.asciiCompact) {
    index.asciiCompact.add(prepared.asciiCompact);
    if (prepared.orthographyAsciiCompact) {
      index.asciiCompact.add(prepared.orthographyAsciiCompact);
    }
  }

  if (prepared.digits) {
    index.digits.add(prepared.digits);
  }
}

function buildRowSearchIndex(
  row: Awaited<ReturnType<typeof loadTrainerClientOverview>>['rows'][number],
  derived: ClientRowDerivedBase,
  alerts: ClientAlert[],
): ClientRowSearchIndex {
  const index = createMutableSearchIndex();

  pushSearchCandidate(index, row.name);
  pushSearchCandidate(index, row.email);
  pushSearchCandidate(index, row.planTitle);
  pushSearchCandidate(index, row.planStatus);
  pushSearchCandidate(index, planStatusLabel(row.planStatus));
  pushSearchCandidate(index, clientStatusLabel(row.clientStatus));
  pushSearchCandidate(index, row.id);
  pushSearchCandidate(index, `ID #${row.id}`);

  if (row.phone) {
    pushSearchCandidate(index, row.phone);
    pushSearchCandidate(index, normalizePhone(row.phone));
    const digitsOnly = row.phone.replace(/\D+/g, '');
    if (digitsOnly) {
      pushSearchCandidate(index, digitsOnly);
    }
  }

  pushSearchCandidate(index, derived.nextRelative);
  pushSearchCandidate(index, `Próxima sessão ${derived.nextRelative}`);
  if (derived.nextAbsolute) {
    pushSearchCandidate(index, derived.nextAbsolute);
    pushSearchCandidate(index, `Próxima sessão ${derived.nextAbsolute}`);
  }
  pushSearchCandidate(index, derived.lastRelative);
  pushSearchCandidate(index, `Última sessão ${derived.lastRelative}`);
  if (derived.lastAbsolute) {
    pushSearchCandidate(index, derived.lastAbsolute);
    pushSearchCandidate(index, `Última sessão ${derived.lastAbsolute}`);
  }
  pushSearchCandidate(index, derived.linkedRelative);
  pushSearchCandidate(index, `Ligado ${derived.linkedRelative}`);
  if (derived.planUpdatedRelative) {
    pushSearchCandidate(index, derived.planUpdatedRelative);
    pushSearchCandidate(index, `Actualizado ${derived.planUpdatedRelative}`);
    if (derived.planUpdatedAbsolute) {
      pushSearchCandidate(index, derived.planUpdatedAbsolute);
      pushSearchCandidate(index, `Actualizado ${derived.planUpdatedAbsolute}`);
    }
  } else {
    pushSearchCandidate(index, 'Sem histórico de actualização');
  }

  if (!derived.hasContact) {
    pushSearchCandidate(index, 'Sem contacto directo');
    pushSearchCandidate(index, 'Sem contacto');
  }

  for (const alert of alerts) {
    pushSearchCandidate(index, alert.label);
  }

  return {
    raw: Array.from(index.raw),
    ascii: Array.from(index.ascii),
    compact: Array.from(index.compact),
    asciiCompact: Array.from(index.asciiCompact),
    digits: Array.from(index.digits),
  } satisfies ClientRowSearchIndex;
}

function matchesAllTokens(tokens: string[], candidates: string[]): boolean {
  if (!tokens.length) return false;
  return tokens.every((token) => candidates.some((candidate) => candidate.includes(token)));
}

function rowMatchesQuery(entry: ClientRowAnalysis, query: PreparedQuery): boolean {
  if (!query.raw) return true;
  const { searchIndex } = entry.derived;

  if (matchesAllTokens(query.rawTokens, searchIndex.raw)) {
    return true;
  }

  if (query.ascii && matchesAllTokens(query.asciiTokens, searchIndex.ascii)) {
    return true;
  }

  if (
    query.orthographyAscii &&
    matchesAllTokens(query.orthographyAsciiTokens, searchIndex.ascii)
  ) {
    return true;
  }

  if (query.compact && searchIndex.compact.some((candidate) => candidate.includes(query.compact))) {
    return true;
  }

  if (query.asciiCompact && searchIndex.asciiCompact.some((candidate) => candidate.includes(query.asciiCompact))) {
    return true;
  }

  if (
    query.orthographyAsciiCompact &&
    searchIndex.asciiCompact.some((candidate) => candidate.includes(query.orthographyAsciiCompact))
  ) {
    return true;
  }

  if (query.digits && searchIndex.digits.some((candidate) => candidate.includes(query.digits))) {
    return true;
  }

  return false;
}

type ClientRowSearchIndex = {
  raw: string[];
  ascii: string[];
  compact: string[];
  asciiCompact: string[];
  digits: string[];
};

type ClientRowDerived = {
  nextRelative: string;
  nextAbsolute: string | null;
  lastRelative: string;
  lastAbsolute: string | null;
  linkedRelative: string;
  planUpdatedRelative: string | null;
  planUpdatedAbsolute: string | null;
  telHref: string | null;
  hasContact: boolean;
  searchIndex: ClientRowSearchIndex;
};

type ClientRowDerivedBase = Omit<ClientRowDerived, 'searchIndex'>;

type ClientRowAnalysis = {
  row: Awaited<ReturnType<typeof loadTrainerClientOverview>>['rows'][number];
  alerts: ClientAlert[];
  urgency: number;
  derived: ClientRowDerived;
};

function decorateRow(
  row: Awaited<ReturnType<typeof loadTrainerClientOverview>>['rows'][number],
  now: Date,
  alerts: ClientAlert[],
): ClientRowDerived {
  const nextRelative = relativeLabel(row.nextSessionAt, 'Sem agendamento', now);
  const nextAbsolute = formatTimestamp(row.nextSessionAt);
  const lastRelative = relativeLabel(row.lastSessionAt, 'Sem histórico', now);
  const lastAbsolute = formatTimestamp(row.lastSessionAt);
  const linkedRelative = row.linkedAt
    ? relativeLabel(row.linkedAt, 'há algum tempo', now) ?? 'há algum tempo'
    : 'Ligação pendente';
  const planUpdatedRelative = row.planUpdatedAt
    ? relativeLabel(row.planUpdatedAt, 'há algum tempo', now)
    : null;
  const planUpdatedAbsolute = formatTimestamp(row.planUpdatedAt);
  const telHref = buildTelHref(row.phone);
  const hasContact = Boolean(row.email || row.phone);
  const baseDerived: ClientRowDerivedBase = {
    nextRelative,
    nextAbsolute,
    lastRelative,
    lastAbsolute,
    linkedRelative,
    planUpdatedRelative,
    planUpdatedAbsolute,
    telHref,
    hasContact,
  } satisfies ClientRowDerivedBase;
  const searchIndex = buildRowSearchIndex(row, baseDerived, alerts);

  return { ...baseDerived, searchIndex } satisfies ClientRowDerived;
}

function buildRowAnalysis(
  rows: Awaited<ReturnType<typeof loadTrainerClientOverview>>['rows'],
  nowMs = Date.now(),
): ClientRowAnalysis[] {
  const now = new Date(nowMs);
  return rows.map((row) => {
    const alerts = buildRowAlerts(row, nowMs, now);
    return {
      row,
      alerts,
      urgency: clientUrgencyScore(row, nowMs),
      derived: decorateRow(row, now, alerts),
    } satisfies ClientRowAnalysis;
  });
}

function sortAnalysedRows(entries: ClientRowAnalysis[]): ClientRowAnalysis[] {
  return [...entries].sort((a, b) => {
    if (a.urgency !== b.urgency) return b.urgency - a.urgency;
    const aNext = a.row.nextSessionAt ? new Date(a.row.nextSessionAt).getTime() : Infinity;
    const bNext = b.row.nextSessionAt ? new Date(b.row.nextSessionAt).getTime() : Infinity;
    if (aNext !== bNext) return aNext - bNext;
    if (b.row.upcomingCount !== a.row.upcomingCount) {
      return b.row.upcomingCount - a.row.upcomingCount;
    }
    return a.row.name.localeCompare(b.row.name, 'pt-PT');
  });
}

function clientUrgencyScore(
  row: Awaited<ReturnType<typeof loadTrainerClientOverview>>['rows'][number],
  nowMs = Date.now(),
) {
  let score = 0;
  const planStatus = row.planStatus ? row.planStatus.toString().trim().toUpperCase() : '';
  if (!row.upcomingCount) {
    score += 4;
  }
  if (!planStatus || planStatus !== 'ACTIVE') {
    score += 2;
  }
  if (!row.email && !row.phone) {
    score += 1;
  }
  const clientStatus = row.clientStatus ? row.clientStatus.toString().trim().toUpperCase() : '';
  if (clientStatus && clientStatus !== 'ACTIVE') {
    score += 3;
  }
  const lastAt = row.lastSessionAt ? new Date(row.lastSessionAt).getTime() : Number.NaN;
  if (!row.lastSessionAt) {
    score += 1;
  } else if (!Number.isNaN(lastAt) && nowMs - lastAt > STALE_SESSION_THRESHOLD_MS) {
    score += 2;
  }
  return score;
}

function buildTelHref(value: string | null | undefined) {
  if (!value) return null;
  const normalized = normalizePhone(value);
  if (!normalized) return null;
  const compact = normalized.replace(/\s+/g, '');
  return `tel:${compact}`;
}

function buildRowAlerts(
  row: Awaited<ReturnType<typeof loadTrainerClientOverview>>['rows'][number],
  nowMs = Date.now(),
  nowDate?: Date,
): ClientAlert[] {
  const alerts: ClientAlert[] = [];
  const now = nowDate ?? new Date(nowMs);
  if (!row.upcomingCount) {
    alerts.push({ key: 'NO_UPCOMING', label: 'Sem próxima sessão agendada', tone: 'warning' });
  }

  const planStatus = normalize(row.planStatus);
  if (!planStatus) {
    alerts.push({ key: 'NO_PLAN', label: 'Sem plano activo', tone: 'info' });
  } else if (planStatus !== 'ACTIVE') {
    alerts.push({
      key: 'PLAN_NOT_ACTIVE',
      label: `Plano ${planStatusLabel(row.planStatus)}`,
      tone: 'info',
    });
  }

  if (!row.email && !row.phone) {
    alerts.push({ key: 'NO_CONTACT', label: 'Sem contacto directo', tone: 'warning' });
  }

  const status = normalize(row.clientStatus);
  if (status && status !== 'ACTIVE') {
    alerts.push({
      key: 'CLIENT_STATUS',
      label: `Estado ${clientStatusLabel(row.clientStatus)}`,
      tone: 'violet',
    });
  }

  const lastAt = row.lastSessionAt ? new Date(row.lastSessionAt).getTime() : Number.NaN;
  if (!row.lastSessionAt) {
    alerts.push({ key: 'NO_HISTORY', label: 'Sem sessões registadas', tone: 'violet' });
  } else if (!Number.isNaN(lastAt) && nowMs - lastAt > STALE_SESSION_THRESHOLD_MS) {
    alerts.push({
      key: 'LAST_SESSION_STALE',
      label: `Última sessão ${relativeLabel(row.lastSessionAt, 'há mais de 14 dias', now)}`,
      tone: 'warning',
    });
  }

  return alerts;
}

function summarizeAlerts(entries: ClientRowAnalysis[]) {
  const summary = new Map<
    ClientAlertKey,
    { key: ClientAlertKey; label: string; tone: AlertTone; count: number }
  >();

  for (const entry of entries) {
    for (const alert of entry.alerts) {
      const meta = ALERT_SUMMARY_META[alert.key];
      if (!meta) continue;
      const current = summary.get(alert.key) ?? {
        key: alert.key,
        label: meta.label,
        tone: meta.tone,
        count: 0,
      };
      current.count += 1;
      summary.set(alert.key, current);
    }
  }

  return Array.from(summary.values()).sort((a, b) => {
    if (a.count !== b.count) return b.count - a.count;
    return a.label.localeCompare(b.label, 'pt-PT');
  });
}

type PageSearchParams = {
  scope?: string | string[];
  alert?: string | string[];
  q?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function parseAlertParam(value: string | null): ClientAlertKey | null {
  if (!value) return null;
  const normalized = value.toString().trim().toUpperCase();
  return ALERT_KEYS.includes(normalized as ClientAlertKey)
    ? (normalized as ClientAlertKey)
    : null;
}

function buildFilterHref({
  scope,
  alert,
  query,
}: {
  scope: 'all' | 'alerts';
  alert?: ClientAlertKey | null;
  query?: string | null;
}) {
  const params = new URLSearchParams();
  if (scope === 'alerts' || alert) {
    params.set('scope', 'alerts');
  }
  if (alert) {
    params.set('alert', alert);
  }
  if (query) {
    params.set('q', query);
  }
  const search = params.toString();
  return search ? `${BASE_PATH}?${search}` : BASE_PATH;
}

export default async function PtClientsPage({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect('/login');
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const overview = await loadTrainerClientOverview(me.id);
  const nowMs = Date.now();
  const analysedRows = sortAnalysedRows(buildRowAnalysis(overview.rows, nowMs));
  const rows = analysedRows.map((entry) => entry.row);
  const lastUpdatedLabel = relativeLabel(overview.updatedAt, 'actualizado agora mesmo');
  const rawScope = firstParam(searchParams?.scope) ?? null;
  const requestedScope = rawScope?.toLowerCase() === 'alerts' ? 'alerts' : 'all';
  const alertFilter = parseAlertParam(firstParam(searchParams?.alert));
  const scope: 'all' | 'alerts' = alertFilter ? 'alerts' : requestedScope;
  const rawQuery = firstParam(searchParams?.q);
  const query = rawQuery ? rawQuery.toString().trim() : '';
  const preparedQuery = prepareQuery(query);
  const hasQuery = Boolean(query);
  const activeQuery = hasQuery ? query : null;

  const queryMatches = hasQuery
    ? analysedRows.filter((entry) => rowMatchesQuery(entry, preparedQuery))
    : analysedRows;
  const attentionAll = analysedRows.filter((entry) => entry.alerts.length > 0);
  const attentionMatches = queryMatches.filter((entry) => entry.alerts.length > 0);
  const urgentRows = attentionMatches.slice(0, 6);
  const overflowCount = Math.max(attentionMatches.length - urgentRows.length, 0);
  const alertSummary = summarizeAlerts(attentionMatches);

  const filteredAnalysedRows = queryMatches.filter((entry) => {
    if (scope === 'alerts' && entry.alerts.length === 0) {
      return false;
    }
    if (alertFilter && !entry.alerts.some((alert) => alert.key === alertFilter)) {
      return false;
    }
    return true;
  });
  const hasFilters = scope === 'alerts' || Boolean(alertFilter) || hasQuery;
  const activeAlertLabel = alertFilter ? ALERT_SUMMARY_META[alertFilter]?.label ?? null : null;
  const queryMatchedCount = queryMatches.length;
  const attentionDisplayCount = hasQuery ? attentionMatches.length : attentionAll.length;
  const hasHiddenAlerts = hasQuery && attentionDisplayCount === 0 && attentionAll.length > 0;
  const attentionBadgeTone: 'warning' | 'success' | 'info' = hasHiddenAlerts
    ? 'info'
    : attentionDisplayCount > 0
    ? 'warning'
    : 'success';
  const attentionBadgeLabel = hasHiddenAlerts
    ? 'Sem alertas na pesquisa'
    : attentionDisplayCount > 0
    ? `${attentionDisplayCount} cliente(s) a requerer atenção`
    : 'Carteira em dia';

  const metrics: Metric[] = [
    {
      label: 'Total na carteira',
      value: overview.metrics.total,
      hint: 'Clientes com vínculo activo ao teu perfil',
      tone: 'primary',
    },
    {
      label: 'Planos activos',
      value: overview.metrics.activePlans,
      hint: 'Com plano marcado como ACTIVO',
      tone: 'success',
    },
    {
      label: 'Sessões agendadas',
      value: overview.metrics.upcomingSessions,
      hint: 'Nos próximos 120 dias de agenda',
      tone: 'info',
    },
    {
      label: 'Sem próxima sessão',
      value: overview.metrics.withoutUpcoming,
      hint: 'Clientes sem agendamentos futuros',
      tone: 'warning',
    },
    {
      label: 'Em onboarding',
      value: overview.metrics.onboarding,
      hint: 'A iniciar acompanhamento ou a aguardar activação',
      tone: 'violet',
    },
    {
      label: 'Sem contacto directo',
      value: overview.metrics.missingContacts,
      hint: 'Clientes sem email ou telefone registado',
      tone: 'warning',
    },
    {
      label: 'Sem plano activo',
      value: overview.metrics.withoutPlan,
      hint: 'Clientes ligados mas sem plano identificado',
      tone: 'info',
    },
  ];

  const realtime = overview.source === 'supabase' && overview.supabase;
  const supabaseTone: StatusTone = realtime ? 'ok' : 'warn';
  const supabaseLabel = realtime ? 'Dados em tempo real' : 'Modo offline';

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <PageHeader
        title="Carteira de clientes"
        subtitle="Uma visão consolidada dos clientes que confiam no teu acompanhamento."
        actions={
          <div className="neo-inline neo-inline--wrap neo-inline--sm">
            <span className="status-pill" data-state={supabaseTone}>
              {supabaseLabel}
            </span>
            <span className="text-xs text-muted" aria-live="polite">
              Actualizado {lastUpdatedLabel}
            </span>
            <Link href="/register" prefetch={false} className="btn primary">
              Adicionar novo cliente
            </Link>
            <Link href="/dashboard/pt/plans" prefetch={false} className="btn ghost">
              Criar plano personalizado
            </Link>
          </div>
        }
      />

      <section className="neo-panel space-y-4" aria-label="Resumo de clientes">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="neo-panel__title">Panorama rápido</h2>
            <p className="neo-panel__subtitle">Indicadores para priorizares onboarding e acompanhamento.</p>
          </div>
          <span className="status-pill" data-state={overview.metrics.total > 0 ? 'ok' : 'warn'}>
            {overview.metrics.total > 0
              ? `${overview.metrics.total} cliente(s)`
              : 'Sem clientes ainda'}
          </span>
        </div>
        <div className="neo-grid auto-fit min-[320px]:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="neo-surface neo-surface--interactive space-y-3 p-4"
              data-variant={metric.tone}
            >
              <div className="space-y-1">
                <span className="neo-surface__hint uppercase tracking-wide">{metric.label}</span>
                <span className="neo-surface__value text-2xl font-semibold text-fg">{metric.value}</span>
              </div>
              {metric.hint && <p className="text-xs text-muted">{metric.hint}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel space-y-4" aria-label="Alertas operacionais">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="neo-panel__title">Alertas operacionais</h2>
            <p className="neo-panel__subtitle">
              Prioriza clientes com bloqueios imediatos no plano, contacto ou sessões.
            </p>
          </div>
          <span className="neo-badge neo-badge--muted" data-tone={attentionBadgeTone}>
            {attentionBadgeLabel}
          </span>
        </div>

        {alertSummary.length > 0 && (
          <div className="neo-inline neo-inline--sm flex-wrap" role="list">
            {alertSummary.map((item) => (
              <Link
                key={item.key}
                href={buildFilterHref({ scope: 'alerts', alert: item.key, query: activeQuery })}
                className="neo-badge"
                data-tone={item.tone}
                role="listitem"
                aria-label={`${item.count} clientes com alerta: ${item.label}`}
                aria-current={alertFilter === item.key ? 'true' : undefined}
                data-selected={alertFilter === item.key ? 'true' : 'false'}
              >
                <span className="font-semibold">{item.count}</span>
                <span aria-hidden="true"> · </span>
                {item.label}
                {alertFilter === item.key && <span className="sr-only"> (filtro activo)</span>}
              </Link>
            ))}
          </div>
        )}

        {alertSummary.length === 0 && hasHiddenAlerts && (
          <p className="text-xs text-muted">
            Não existem alertas a corresponder à pesquisa actual. Limpa a pesquisa para voltares a ver a lista completa de
            alertas.
          </p>
        )}

        {urgentRows.length > 0 ? (
          <div className="neo-stack space-y-3">
            {urgentRows.map(({ row, alerts, derived }) => {
              const variant: AlertTone = alerts.some((alert) => alert.tone === 'warning')
                ? 'warning'
                : alerts.some((alert) => alert.tone === 'violet')
                ? 'violet'
                : 'info';

              return (
                <article key={row.id} className="neo-surface space-y-3 p-4" data-variant={variant}>
                  <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-fg">{row.name}</p>
                      <p className="text-xs text-muted">Ligado {derived.linkedRelative}</p>
                    </div>
                    <span className="status-pill" data-state={clientStatusTone(row.clientStatus)}>
                      {clientStatusLabel(row.clientStatus)}
                    </span>
                  </header>

                  <div className="neo-inline neo-inline--sm" role="list">
                    {alerts.map((alert) => (
                      <span
                        key={`${alert.key}-${alert.label}`}
                        className="neo-badge"
                        data-tone={alert.tone}
                        role="listitem"
                      >
                        {alert.label}
                      </span>
                    ))}
                  </div>

                  <dl className="grid grid-cols-1 gap-3 text-xs text-muted sm:grid-cols-3">
                    <div>
                      <dt className="font-semibold text-fg">Próxima sessão</dt>
                      <dd className="text-sm">{derived.nextRelative}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-fg">Última sessão</dt>
                      <dd className="text-sm">{derived.lastRelative}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-fg">Plano</dt>
                      <dd className="flex flex-wrap items-center gap-2 text-sm text-muted">
                        <span className="neo-badge" data-tone={planBadgeTone(row.planStatus)}>
                          {planStatusLabel(row.planStatus)}
                        </span>
                        {row.planTitle && <span className="truncate" title={row.planTitle}>{row.planTitle}</span>}
                      </dd>
                    </div>
                  </dl>

                  <div className="neo-inline neo-inline--sm flex-wrap text-xs">
                    {row.email && (
                      <a
                        href={`mailto:${row.email}`}
                        className="link-arrow text-sm"
                        aria-label={`Enviar email para ${row.name}`}
                      >
                        Enviar email
                      </a>
                    )}
                    {derived.telHref && (
                      <a
                        href={derived.telHref}
                        className="link-arrow text-sm"
                        aria-label={`Ligar para ${row.name}`}
                      >
                        Ligar agora
                      </a>
                    )}
                    <Link
                      href={`/dashboard/users/${row.id}`}
                      prefetch={false}
                      className="link-arrow text-sm"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : hasHiddenAlerts ? (
          <p className="rounded-xl border border-dashed border-white/40 bg-white/30 p-4 text-sm text-muted dark:border-slate-700/60 dark:bg-slate-900/20">
            Nenhum cliente com alertas corresponde à pesquisa. Ajusta ou limpa a pesquisa para retomar o destaque automático.
          </p>
        ) : (
          <p className="rounded-xl border border-dashed border-white/40 bg-white/30 p-4 text-sm text-muted dark:border-slate-700/60 dark:bg-slate-900/20">
            Todos os clientes têm plano activo, contacto directo e sessões em curso.
          </p>
        )}

        {overflowCount > 0 && (
          <p className="text-xs text-muted">
            {hasQuery
              ? `Outros ${overflowCount} cliente(s) com alertas que correspondem à pesquisa estão detalhados na tabela abaixo.`
              : `Outros ${overflowCount} cliente(s) com alertas estão detalhados na tabela abaixo.`}
          </p>
        )}
      </section>

      <section className="neo-panel space-y-4" aria-label="Lista de clientes">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="neo-panel__title">Clientes associados</h2>
            <p className="neo-panel__subtitle">
              Contactos, planos e agenda sincronizados com a tua operação diária.
            </p>
          </div>
          <Link href="/dashboard/pt/messages" prefetch={false} className="btn ghost">
            Enviar mensagem
          </Link>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <nav className="neo-inline neo-inline--sm flex-wrap text-xs" aria-label="Filtros da tabela">
            <Link
              href={buildFilterHref({ scope: 'all', query: activeQuery })}
              className="neo-badge neo-badge--muted"
              data-selected={scope === 'all' ? 'true' : 'false'}
              aria-current={scope === 'all' ? 'true' : undefined}
            >
              Todos os clientes ({queryMatchedCount})
            </Link>
            <Link
              href={buildFilterHref({ scope: 'alerts', alert: alertFilter, query: activeQuery })}
              className="neo-badge neo-badge--muted"
              data-selected={scope === 'alerts' ? 'true' : 'false'}
              aria-current={scope === 'alerts' ? 'true' : undefined}
            >
              Clientes com alertas ({hasQuery ? attentionMatches.length : attentionAll.length})
            </Link>
            {alertFilter && (
              <Link
                href={buildFilterHref({ scope: 'alerts', query: activeQuery })}
                className="neo-badge"
                data-tone="info"
              >
                Remover filtro específico
              </Link>
            )}
          </nav>

          <form
            method="get"
            className="neo-inline neo-inline--sm flex-wrap items-center gap-2"
            aria-label="Pesquisar clientes"
          >
            {scope === 'alerts' && <input type="hidden" name="scope" value="alerts" />}
            {alertFilter && <input type="hidden" name="alert" value={alertFilter} />}
            <label htmlFor="pt-clients-search" className="sr-only">
              Pesquisa por nome, contacto ou plano
            </label>
            <input
              id="pt-clients-search"
              name="q"
              type="search"
              inputMode="search"
              placeholder="Procurar clientes"
              defaultValue={query}
              className="neo-input neo-input--compact min-w-[220px]"
            />
            <button type="submit" className="btn ghost text-xs">
              Procurar
            </button>
            {hasQuery && (
              <Link
                href={buildFilterHref({ scope, alert: alertFilter, query: null })}
                className="btn ghost text-xs"
              >
                Limpar
              </Link>
            )}
          </form>
        </div>

        {hasFilters && (
          <div className="neo-inline neo-inline--sm flex-wrap text-xs text-muted" role="status" aria-live="polite">
            <span>
              A mostrar {filteredAnalysedRows.length} de {rows.length} cliente(s).
            </span>
            {hasQuery && (
              <span>
                Pesquisa activa: “{query}” ({queryMatchedCount} cliente(s) encontrado(s))
              </span>
            )}
            {activeAlertLabel && <span>Filtro activo: {activeAlertLabel}</span>}
          </div>
        )}

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Plano</th>
                <th scope="col">Próxima sessão</th>
                <th scope="col">Última sessão</th>
                <th scope="col">Estado</th>
                <th scope="col" className="text-right">
                  Acções
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAnalysedRows.map(({ row, alerts, derived }) => {
                const matchesActiveAlert = alertFilter
                  ? alerts.some((alert) => alert.key === alertFilter)
                  : false;

                return (
                  <tr
                    key={row.id}
                    data-alerts={alerts.length > 0 ? 'true' : 'false'}
                    data-alert-match={matchesActiveAlert ? 'true' : 'false'}
                  >
                    <td>
                      <div className="space-y-1">
                        <span className="font-semibold text-fg">{row.name}</span>
                        <p className="text-xs text-muted">Ligado {derived.linkedRelative}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted">
                          {row.email && <span>{row.email}</span>}
                          {row.phone && <span>{row.phone}</span>}
                          <span className="opacity-70">ID #{row.id}</span>
                          {row.upcomingCount > 0 && (
                            <span className="neo-badge neo-badge--muted">
                              {row.upcomingCount} sessão(ões) futura(s)
                            </span>
                          )}
                          {!derived.hasContact && (
                            <span className="neo-badge neo-badge--muted" data-tone="warning">
                              Sem contacto directo
                            </span>
                          )}
                        </div>
                        {alerts.length > 0 && (
                          <div className="neo-inline neo-inline--xs flex-wrap text-[11px] text-muted">
                            {alerts.map((alert) => (
                              <span
                                key={`${row.id}-${alert.key}`}
                                className="neo-badge"
                                data-tone={alert.tone}
                              >
                                {alert.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="neo-badge" data-tone={planBadgeTone(row.planStatus)}>
                            {planStatusLabel(row.planStatus)}
                          </span>
                          {row.planTitle && (
                            <span className="text-xs text-muted" title={row.planTitle}>
                              {row.planTitle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted">
                          {derived.planUpdatedRelative
                            ? `Actualizado ${derived.planUpdatedRelative}`
                            : 'Sem histórico de actualização'}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <span className="font-medium text-fg">{derived.nextRelative}</span>
                        {derived.nextAbsolute && (
                          <span className="text-xs text-muted">{derived.nextAbsolute}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <span className="text-sm text-fg">{derived.lastRelative}</span>
                        {derived.lastAbsolute && (
                          <span className="text-xs text-muted">{derived.lastAbsolute}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="status-pill" data-state={clientStatusTone(row.clientStatus)}>
                        {clientStatusLabel(row.clientStatus)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="neo-inline neo-inline--sm justify-end">
                        {row.email && (
                          <a
                            href={`mailto:${row.email}`}
                            className="link-arrow text-sm"
                            aria-label={`Enviar email para ${row.name}`}
                          >
                            Enviar email
                          </a>
                        )}
                        {derived.telHref && (
                          <a
                            href={derived.telHref}
                            className="link-arrow text-sm"
                            aria-label={`Ligar para ${row.name}`}
                          >
                            Ligar agora
                          </a>
                        )}
                        <Link
                          href={`/dashboard/users/${row.id}`}
                          prefetch={false}
                          className="link-arrow inline-flex items-center gap-1 text-sm"
                        >
                          Ver perfil
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAnalysedRows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="rounded-2xl border border-dashed border-white/40 bg-white/40 p-6 text-center text-sm text-muted dark:border-slate-700/60 dark:bg-slate-900/30">
                      {hasFilters
                        ? hasQuery
                          ? 'Nenhum cliente corresponde à pesquisa ou filtros seleccionados. Ajusta ou limpa a pesquisa para voltar a ver a carteira completa.'
                          : 'Nenhum cliente corresponde aos filtros seleccionados. Remove os filtros para voltar a ver toda a carteira.'
                        : 'Ainda não tens clientes atribuídos. Usa as acções acima para convidar o primeiro atleta.'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
