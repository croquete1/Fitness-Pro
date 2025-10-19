import {
  type SearchCollection,
  type SearchCollectionInput,
  type SearchDashboardData,
  type SearchDashboardInput,
  type SearchCollectionItem,
  type SearchHeroMetric,
  type SearchHighlight,
  type SearchInsight,
  type SearchResultRecord,
  type SearchTimelinePoint,
  type SearchTrend,
  type SearchResultType,
} from './types';

const DAY_MS = 86_400_000;

const TYPE_LABEL: Record<SearchResultType, string> = {
  users: 'Utilizadores',
  plans: 'Planos',
  exercises: 'Exercícios',
  sessions: 'Sessões',
};

const BADGE_TONE_BY_TYPE: Record<SearchResultType, SearchHighlight['tone']> = {
  users: 'positive',
  plans: 'neutral',
  exercises: 'neutral',
  sessions: 'warning',
};

const numberFormatter = new Intl.NumberFormat('pt-PT');
const dateFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function parseDate(value: Date | string | number | null | undefined): Date | null {
  if (!value && value !== 0) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }
  const date = new Date(value as any);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatRelative(date: Date | null, now: Date): string | null {
  if (!date) return null;
  const diff = now.getTime() - date.getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return 'Há instantes';
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Há ${hours} h`;
  const days = Math.round(hours / 24);
  if (days <= 7) return `Há ${days} dia${days === 1 ? '' : 's'}`;
  return dateTimeFormatter.format(date);
}

function computeScore(record: SearchResultRecord, normalizedQuery: string, now: Date): number {
  let score = 1;
  if (normalizedQuery) {
    for (const keyword of record.keywords) {
      const token = keyword?.toLowerCase?.() ?? '';
      if (!token) continue;
      if (token === normalizedQuery) score += 6;
      else if (token.startsWith(normalizedQuery)) score += 4;
      else if (token.includes(normalizedQuery)) score += 2;
    }
  } else {
    score += 1;
  }

  const activity = parseDate(record.updatedAt) ?? parseDate(record.createdAt);
  if (activity) {
    const diff = now.getTime() - activity.getTime();
    const days = diff / DAY_MS;
    if (days <= 1) score += 4;
    else if (days <= 7) score += 3;
    else if (days <= 30) score += 1.5;
    else if (days <= 60) score += 1;
  }

  if (record.type === 'users') score += 1.5;
  if (record.type === 'sessions') score += 0.75;

  return score;
}

function formatActivityLabel(record: SearchResultRecord, now: Date): string | null {
  const date = parseDate(record.updatedAt) ?? parseDate(record.createdAt);
  if (!date) return null;
  const diff = now.getTime() - date.getTime();
  const days = diff / DAY_MS;
  if (days < 1) return 'Actualizado hoje';
  if (days < 7) return `Actualizado há ${Math.round(days)} dia${Math.round(days) === 1 ? '' : 's'}`;
  return dateTimeFormatter.format(date);
}

function formatTimeline(collections: SearchCollectionInput[], now: Date): SearchTimelinePoint[] {
  const rangeDays = 14;
  const start = new Date(now.getTime() - (rangeDays - 1) * DAY_MS);
  start.setHours(0, 0, 0, 0);
  const timeline = new Map<string, SearchTimelinePoint>();

  for (let i = 0; i < rangeDays; i += 1) {
    const date = new Date(start.getTime() + i * DAY_MS);
    const key = date.toISOString().slice(0, 10);
    timeline.set(key, {
      iso: key,
      label: dateFormatter.format(date),
      matches: 0,
      newItems: 0,
    });
  }

  for (const collection of collections) {
    for (const record of collection.rows) {
      const activity = parseDate(record.updatedAt) ?? parseDate(record.createdAt);
      const created = parseDate(record.createdAt);
      const bucket = activity ?? created;
      if (!bucket) continue;
      const key = bucket.toISOString().slice(0, 10);
      const point = timeline.get(key);
      if (point) {
        point.matches += 1;
        if (created && now.getTime() - created.getTime() <= 7 * DAY_MS) {
          point.newItems += 1;
        }
      }
    }
  }

  return Array.from(timeline.values());
}

function buildCollection(
  input: SearchCollectionInput,
  normalizedQuery: string,
  now: Date,
): SearchCollection {
  const scored: SearchCollectionItem[] = input.rows.map((row) => {
    const score = computeScore(row, normalizedQuery, now);
    const relevance = formatRelative(parseDate(row.updatedAt) ?? parseDate(row.createdAt), now);
    return {
      ...row,
      score,
      relevance,
      activityLabel: formatActivityLabel(row, now),
    } satisfies SearchCollectionItem;
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aDate = parseDate(a.updatedAt) ?? parseDate(a.createdAt);
    const bDate = parseDate(b.updatedAt) ?? parseDate(b.createdAt);
    if (aDate && bDate) return bDate.getTime() - aDate.getTime();
    if (aDate) return -1;
    if (bDate) return 1;
    return a.title.localeCompare(b.title);
  });

  const total = input.total;
  const delivered = scored.length;
  const nextOffset = delivered < total ? delivered : null;

  return {
    type: input.type,
    label: input.label ?? TYPE_LABEL[input.type],
    total,
    nextOffset,
    items: scored,
  } satisfies SearchCollection;
}

function buildHeroMetrics(
  collections: SearchCollection[],
  totals: SearchDashboardData['totals'],
  query: string,
): SearchHeroMetric[] {
  const getTotal = (type: SearchResultType) =>
    collections.find((collection) => collection.type === type)?.total ?? 0;
  const lastActivity = totals.lastMatchAt ? parseDate(totals.lastMatchAt) : null;
  const lastHelper = lastActivity
    ? `Última actividade ${dateTimeFormatter.format(lastActivity)}`
    : 'Sem actividade recente';

  return [
    {
      id: 'matches',
      label: 'Resultados encontrados',
      value: numberFormatter.format(totals.matches),
      helper: query ? `para “${query}”` : 'no catálogo',
      tone: 'primary',
    },
    {
      id: 'recent',
      label: 'Novos (7 dias)',
      value: numberFormatter.format(totals.recent),
      helper: lastHelper,
      tone: totals.recent > 0 ? 'positive' : 'neutral',
    },
    {
      id: 'users',
      label: 'Utilizadores',
      value: numberFormatter.format(getTotal('users')),
      helper: 'Staff, PTs e clientes',
      tone: 'neutral',
    },
    {
      id: 'sessions',
      label: 'Sessões mapeadas',
      value: numberFormatter.format(getTotal('sessions')),
      helper: getTotal('sessions') > 0 ? 'Agenda e histórico' : 'Sem sessões registadas',
      tone: getTotal('sessions') > 0 ? 'primary' : 'neutral',
    },
  ];
}

function buildHighlights(collections: SearchCollection[]): SearchHighlight[] {
  const highlights: SearchHighlight[] = [];
  const allItems = collections.flatMap((collection) =>
    collection.items.map((item) => ({ item, collection })),
  );
  allItems.sort((a, b) => b.item.score - a.item.score);
  const top = allItems.slice(0, 4);
  for (const entry of top) {
    highlights.push({
      id: `${entry.collection.type}-${entry.item.id}`,
      title: entry.item.title,
      description: entry.item.subtitle ?? entry.item.meta ?? 'Resultado relevante',
      href: entry.item.href,
      tone: BADGE_TONE_BY_TYPE[entry.collection.type],
      meta: entry.item.activityLabel,
    });
  }
  return highlights;
}

function buildInsights(
  collections: SearchCollection[],
  totals: SearchDashboardData['totals'],
  now: Date,
): SearchInsight[] {
  const insights: SearchInsight[] = [];
  const ordered = collections.slice().sort((a, b) => b.total - a.total);
  if (ordered[0]?.total) {
    insights.push({
      id: 'dominant-collection',
      title: `${ordered[0].label} lideram a pesquisa`,
      description: `${numberFormatter.format(ordered[0].total)} resultados encontrados nesta categoria.`,
      icon: '📂',
      tone: 'neutral',
    });
  }
  if (totals.recent > 0) {
    insights.push({
      id: 'recent-activity',
      title: 'Actividade recente detectada',
      description: `${numberFormatter.format(totals.recent)} novos registos nos últimos sete dias.`,
      icon: '⚡️',
      tone: 'positive',
    });
  }
  const lastDate = totals.lastMatchAt ? parseDate(totals.lastMatchAt) : null;
  if (lastDate) {
    insights.push({
      id: 'last-activity',
      title: 'Última actualização',
      description: `Registada ${formatRelative(lastDate, now) ?? dateTimeFormatter.format(lastDate)}.`,
      icon: '🕒',
      tone: 'neutral',
    });
  }
  if (!insights.length) {
    insights.push({
      id: 'awaiting-search',
      title: 'Escreve para começar',
      description: 'Pesquisas refinadas desbloqueiam métricas, destaques e tendências ao vivo.',
      icon: '🔍',
      tone: 'neutral',
    });
  }
  return insights;
}

function computeTotals(collections: SearchCollectionInput[], now: Date) {
  const seenIds = new Set<string>();
  let matches = 0;
  let recent = 0;
  let first: Date | null = null;
  let last: Date | null = null;

  for (const collection of collections) {
    matches += collection.total;
    for (const row of collection.rows) {
      const key = `${collection.type}:${row.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
      }
      const created = parseDate(row.createdAt);
      const updated = parseDate(row.updatedAt);
      const activity = updated ?? created;
      if (activity) {
        if (!first || activity < first) first = activity;
        if (!last || activity > last) last = activity;
      }
      if (created && now.getTime() - created.getTime() <= 7 * DAY_MS) {
        recent += 1;
      }
    }
  }

  return {
    matches,
    recent,
    firstMatchAt: first ? first.toISOString() : null,
    lastMatchAt: last ? last.toISOString() : null,
  } satisfies SearchDashboardData['totals'];
}

function buildFilters(collections: SearchCollection[]): SearchDashboardData['filters'] {
  return {
    types: collections.map((collection) => ({
      id: collection.type,
      label: collection.label,
      total: collection.total,
    })),
  };
}

function buildTrends(input: SearchDashboardInput, collections: SearchCollection[]): SearchTrend[] {
  if (input.trending?.length) {
    return input.trending
      .slice()
      .sort((a, b) => b.count - a.count)
      .map((trend) => ({
        term: trend.term,
        count: trend.count,
        lastSearchedAt: trend.lastSearchedAt,
      }));
  }

  const map = new Map<string, { term: string; count: number; lastSearchedAt: string | null }>();
  for (const collection of collections) {
    for (const item of collection.items.slice(0, 5)) {
      const key = item.title.toLowerCase();
      const entry = map.get(key) ?? {
        term: item.title,
        count: 0,
        lastSearchedAt: item.createdAt ?? item.updatedAt ?? null,
      };
      entry.count += 1;
      if (item.updatedAt && (!entry.lastSearchedAt || item.updatedAt > entry.lastSearchedAt)) {
        entry.lastSearchedAt = item.updatedAt;
      }
      map.set(key, entry);
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function buildSearchDashboard(input: SearchDashboardInput): SearchDashboardData {
  const now = parseDate(input.now) ?? new Date();
  const normalizedQuery = input.query.trim().toLowerCase();
  const totals = computeTotals(input.collections, now);

  const collections = input.collections.map((collection) =>
    buildCollection(collection, normalizedQuery, now),
  );

  const hero = buildHeroMetrics(collections, totals, input.query.trim());
  const highlights = buildHighlights(collections);
  const insights = buildInsights(collections, totals, now);
  const timeline = formatTimeline(input.collections, now);
  const filters = buildFilters(collections);
  const trends = buildTrends(input, collections);

  const suggestions = input.suggestions?.length
    ? input.suggestions
    : collections
        .flatMap((collection) => collection.items.slice(0, 3).map((item) => item.title))
        .filter((value, index, all) => value && all.indexOf(value) === index)
        .slice(0, 6);

  return {
    query: input.query.trim(),
    normalizedQuery,
    generatedAt: now.toISOString(),
    hero,
    highlights,
    insights,
    timeline,
    collections,
    suggestions,
    trends,
    totals,
    filters,
    fallback: Boolean(input.fallback),
  } satisfies SearchDashboardData;
}
