import { parseTagList } from '@/lib/exercises/tags';

import {
  type AdminExerciseRecord,
  type AdminExerciseRow,
  type AdminExercisesDashboardData,
  type AdminExercisesDistributionSegment,
  type AdminExercisesHighlight,
  type AdminExercisesHeroMetric,
  type AdminExercisesTimelinePoint,
} from './types';

const DAY_MS = 86_400_000;

const numberFormatter = new Intl.NumberFormat('pt-PT', {
  maximumFractionDigits: 0,
});

const percentageFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'percent',
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', {
  numeric: 'auto',
});

function formatNumber(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0';
  return numberFormatter.format(Math.round(value));
}

function formatPercentage(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0%';
  return percentageFormatter.format(value);
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return dateTimeFormatter.format(new Date(value));
  } catch (error) {
    console.warn('[admin-exercises] formatDate failed', error);
    return '—';
  }
}

function toIsoDay(date: Date): string {
  const copy = new Date(date.getTime());
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

function isWithinRange(date: string | null, start: Date, end: Date): boolean {
  if (!date) return false;
  const parsed = new Date(date);
  if (!Number.isFinite(parsed.getTime())) return false;
  return parsed.getTime() >= start.getTime() && parsed.getTime() <= end.getTime();
}

function computeTrend(current: number, previous: number) {
  const delta = current - previous;
  if (delta === 0) return null;
  return {
    direction: delta > 0 ? 'up' : 'down',
    label: `${delta > 0 ? '+' : ''}${formatNumber(delta)} vs. período anterior`,
  } as AdminExercisesHeroMetric['trend'];
}

function computeHeroMetrics(records: AdminExerciseRecord[], rangeStart: Date, previousRangeStart: Date): AdminExercisesHeroMetric[] {
  const total = records.length;
  const published = records.filter((record) => record.isPublished).length;
  const global = records.filter((record) => record.isGlobal).length;

  const recentCreated = records.filter((record) => isWithinRange(record.createdAt, rangeStart, new Date()));
  const previousCreated = records.filter((record) =>
    isWithinRange(record.createdAt, previousRangeStart, new Date(rangeStart.getTime() - 1)),
  );

  const recentUpdated = records.filter((record) =>
    isWithinRange(record.updatedAt, rangeStart, new Date()),
  ).length;

  const publishShare = total > 0 ? published / total : 0;
  const globalShare = total > 0 ? global / total : 0;

  return [
    {
      id: 'total',
      label: 'Exercícios activos',
      value: formatNumber(total),
      tone: 'primary',
      trend: computeTrend(recentCreated.length, previousCreated.length),
      helper:
        total > 0
          ? `${formatNumber(recentCreated.length)} novos nos últimos 30 dias`
          : 'Sem exercícios registados',
    },
    {
      id: 'published',
      label: 'Publicados',
      value: formatNumber(published),
      tone: publishShare >= 0.7 ? 'positive' : publishShare >= 0.4 ? 'primary' : 'warning',
      helper: publishShare > 0 ? `${formatPercentage(publishShare)} do catálogo` : 'Sem exercícios publicados',
    },
    {
      id: 'global',
      label: 'Catálogo global',
      value: formatNumber(global),
      tone: globalShare >= 0.5 ? 'positive' : 'primary',
      helper: globalShare > 0 ? `${formatPercentage(globalShare)} acessível a toda a equipa` : 'Apenas exercícios privados',
    },
    {
      id: 'updated',
      label: 'Actualizados recentemente',
      value: formatNumber(recentUpdated),
      tone: recentUpdated > 0 ? 'primary' : 'neutral',
      helper: recentUpdated > 0 ? 'Últimos 30 dias' : 'Sem alterações recentes',
    },
  ];
}

function computeTimeline(records: AdminExerciseRecord[], rangeDays: number, now: Date): AdminExercisesTimelinePoint[] {
  const days = Math.max(rangeDays, 1);
  const start = new Date(now.getTime() - (days - 1) * DAY_MS);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now.getTime());
  end.setHours(23, 59, 59, 999);

  const buckets = new Map<string, AdminExercisesTimelinePoint>();
  for (let index = 0; index < days; index += 1) {
    const date = new Date(start.getTime() + index * DAY_MS);
    const iso = toIsoDay(date);
    buckets.set(iso, {
      iso,
      label: dateFormatter.format(date),
      created: 0,
      published: 0,
      global: 0,
    });
  }

  for (const record of records) {
    if (isWithinRange(record.createdAt, start, end)) {
      const createdIso = toIsoDay(new Date(record.createdAt!));
      const bucket = buckets.get(createdIso);
      if (bucket) {
        bucket.created += 1;
        if (record.isGlobal) bucket.global += 1;
      }
    }

    if (record.isPublished && isWithinRange(record.publishedAt, start, end)) {
      const publishedIso = toIsoDay(new Date(record.publishedAt!));
      const bucket = buckets.get(publishedIso);
      if (bucket) bucket.published += 1;
    }
  }

  return Array.from(buckets.values());
}

function computeDistribution(
  records: AdminExerciseRecord[],
  selector: (record: AdminExerciseRecord) => string[] | string | null | undefined,
  labelResolver: (value: string) => string,
  toneResolver: (value: string) => AdminExercisesDistributionSegment['tone'],
): AdminExercisesDistributionSegment[] {
  if (!records.length) {
    return [
      { key: 'empty', label: 'Sem dados', count: 0, share: 0, tone: 'neutral' },
    ];
  }

  const counts = new Map<string, number>();
  for (const record of records) {
    const value = selector(record);
    if (!value) continue;
    const list = Array.isArray(value) ? value : [value];
    for (const entry of list) {
      const key = entry.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const total = Array.from(counts.values()).reduce((acc, value) => acc + value, 0) || 1;

  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      label: labelResolver(key),
      count,
      share: count / total,
      tone: toneResolver(key),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function computeHighlights(records: AdminExerciseRecord[], timeline: AdminExercisesTimelinePoint[]): AdminExercisesHighlight[] {
  if (!records.length) {
    return [
      {
        id: 'empty',
        title: 'Catálogo vazio',
        description: 'Ainda não existem exercícios registados. Cria o primeiro para começares a partilhar planos.',
        tone: 'neutral',
      },
    ];
  }

  const publishedLast30 = records.filter((record) =>
    isWithinRange(record.publishedAt, new Date(Date.now() - 29 * DAY_MS), new Date()),
  ).length;

  const mostPopularMuscle = computeDistribution(
    records,
    (record) => parseTagList(record.muscleGroup ?? ''),
    (value) => value,
    () => 'primary',
  )[0];

  const busiestDay = timeline.reduce<AdminExercisesTimelinePoint | null>((acc, point) => {
    if (!acc) return point;
    const accTotal = acc.created + acc.published;
    const pointTotal = point.created + point.published;
    return pointTotal > accTotal ? point : acc;
  }, null);

  const highlights: AdminExercisesHighlight[] = [];

  highlights.push({
    id: 'catalogue',
    title: 'Catálogo activo',
    description: `${formatNumber(records.length)} exercícios disponíveis para a equipa.`,
    tone: 'primary',
  });

  highlights.push({
    id: 'recent-publish',
    title: 'Novas publicações',
    description:
      publishedLast30 > 0
        ? `${formatNumber(publishedLast30)} exercício(s) publicado(s) nos últimos 30 dias.`
        : 'Ainda não existem publicações recentes.',
    tone: publishedLast30 > 0 ? 'positive' : 'neutral',
  });

  if (mostPopularMuscle && mostPopularMuscle.count > 0) {
    highlights.push({
      id: 'top-muscle',
      title: 'Grupo muscular em foco',
      description: `${mostPopularMuscle.label} lidera o catálogo com ${formatNumber(
        mostPopularMuscle.count,
      )} exercício(s).`,
      tone: 'primary',
    });
  }

  if (busiestDay) {
    highlights.push({
      id: 'busiest-day',
      title: 'Dia com mais actividade',
      description: `Foram registados ${formatNumber(busiestDay.created + busiestDay.published)} exercício(s) em ${
        busiestDay.label
      }.`,
      tone: 'positive',
    });
  }

  return highlights;
}

function buildRow(record: AdminExerciseRecord): AdminExerciseRow {
  const muscleTags = parseTagList(record.muscleGroup ?? '');
  const equipmentTags = parseTagList(record.equipment ?? '');
  const audienceLabel = record.isGlobal
    ? 'Catálogo global'
    : record.ownerName ?? record.ownerEmail ?? 'Privado';
  const creatorLabel = record.creatorName ?? record.creatorEmail ?? audienceLabel;
  const createdLabel = formatDate(record.createdAt);

  return {
    ...record,
    muscleTags,
    equipmentTags,
    audienceLabel,
    creatorLabel,
    createdLabel,
  };
}

function buildFacets(records: AdminExerciseRecord[]) {
  const muscles = new Set<string>();
  const equipments = new Set<string>();
  const difficulties = new Set<string>();

  for (const record of records) {
    for (const tag of parseTagList(record.muscleGroup ?? '')) {
      muscles.add(tag);
    }
    for (const tag of parseTagList(record.equipment ?? '')) {
      equipments.add(tag);
    }
    if (record.difficulty) difficulties.add(record.difficulty);
  }

  const toSorted = (input: Set<string>) =>
    Array.from(input.values()).sort((a, b) => a.localeCompare(b, 'pt-PT'));

  return {
    muscles: toSorted(muscles),
    equipments: toSorted(equipments),
    difficulties: toSorted(difficulties),
  };
}

function resolveRangeLabel(rangeDays: number): string {
  if (rangeDays >= 365) return 'Últimos 12 meses';
  if (rangeDays >= 180) return 'Últimos 6 meses';
  if (rangeDays >= 90) return 'Últimos 3 meses';
  if (rangeDays >= 60) return 'Últimos 60 dias';
  if (rangeDays >= 30) return 'Últimos 30 dias';
  if (rangeDays >= 14) return 'Últimos 14 dias';
  return `Últimos ${rangeDays} dia(s)`;
}

export function buildAdminExercisesDashboard(options: {
  allRecords: AdminExerciseRecord[];
  rangeDays: number;
  now?: Date;
  tableRecords: AdminExerciseRecord[];
  tableTotal: number;
  page: number;
  pageSize: number;
}): AdminExercisesDashboardData {
  const { allRecords, rangeDays, now: nowOpt, tableRecords, tableTotal, page, pageSize } = options;
  const now = nowOpt ?? new Date();
  const rangeStart = new Date(now.getTime() - 29 * DAY_MS);
  const previousRangeStart = new Date(rangeStart.getTime() - 30 * DAY_MS);

  const timelineRecords = allRecords.filter((record) => {
    if (!record.createdAt) return false;
    const created = new Date(record.createdAt);
    if (!Number.isFinite(created.getTime())) return false;
    const rangeStartDate = new Date(now.getTime() - (Math.max(rangeDays, 1) - 1) * DAY_MS);
    rangeStartDate.setHours(0, 0, 0, 0);
    const rangeEndDate = new Date(now.getTime());
    rangeEndDate.setHours(23, 59, 59, 999);
    return created.getTime() >= rangeStartDate.getTime() && created.getTime() <= rangeEndDate.getTime();
  });

  const hero = computeHeroMetrics(allRecords, rangeStart, previousRangeStart);
  const timeline = computeTimeline(timelineRecords, rangeDays, now);

  const difficulties = computeDistribution(
    allRecords,
    (record) => (record.difficulty ? [record.difficulty] : []),
    (value) => value,
    (value) => (value === 'Difícil' ? 'warning' : value === 'Média' ? 'primary' : 'positive'),
  );

  const muscles = computeDistribution(
    allRecords,
    (record) => parseTagList(record.muscleGroup ?? ''),
    (value) => value,
    () => 'primary',
  );

  const equipments = computeDistribution(
    allRecords,
    (record) => parseTagList(record.equipment ?? ''),
    (value) => value,
    () => 'neutral',
  );

  const highlights = computeHighlights(allRecords, timeline);

  const tableRows = tableRecords.map(buildRow);

  const facets = buildFacets(allRecords);

  return {
    generatedAt: now.toISOString(),
    rangeLabel: resolveRangeLabel(rangeDays),
    hero,
    timeline,
    difficulties,
    muscles,
    equipments,
    highlights,
    table: {
      rows: tableRows,
      total: tableTotal,
      page,
      pageSize,
    },
    facets,
  };
}
