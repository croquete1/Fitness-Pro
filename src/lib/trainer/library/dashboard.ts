import { parseTagList } from '@/lib/exercises/tags';
import {
  type TrainerLibraryDashboardData,
  type TrainerLibraryDistributionStat,
  type TrainerLibraryExerciseRecord,
  type TrainerLibraryFacet,
  type TrainerLibraryHighlight,
  type TrainerLibraryHeroMetric,
  type TrainerLibraryScope,
  type TrainerLibraryTableRow,
  type TrainerLibraryTimelinePoint,
} from './types';

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});
const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

const scopeTokens: Record<TrainerLibraryScope, { label: string; tone: 'positive' | 'warning' | 'critical' | 'neutral' }> = {
  personal: { label: 'Pessoal', tone: 'positive' },
  global: { label: 'Catálogo', tone: 'neutral' },
};

const difficultyTokens = {
  beginner: { label: 'Iniciantes', tone: 'positive' as const },
  intermediate: { label: 'Intermédios', tone: 'neutral' as const },
  advanced: { label: 'Avançados', tone: 'warning' as const },
  unspecified: { label: 'Sem dificuldade', tone: 'neutral' as const },
};

type Options = { supabase: boolean };

type DifficultyKey = keyof typeof difficultyTokens;

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfWeek(date: Date): Date {
  const clone = new Date(date.getTime());
  const day = clone.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday first
  clone.setDate(clone.getDate() - diff);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function isoWeekKey(date: Date): string {
  return startOfWeek(date).toISOString().slice(0, 10);
}

function formatWeekLabel(date: Date): string {
  return dateFormatter.format(date);
}

function formatRelative(date: Date | null, now: Date): string | null {
  if (!date) return null;
  const diff = date.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const thresholds: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit; size: number }> = [
    { limit: 60_000, unit: 'second', size: 1_000 },
    { limit: 3_600_000, unit: 'minute', size: 60_000 },
    { limit: 86_400_000, unit: 'hour', size: 3_600_000 },
    { limit: 604_800_000, unit: 'day', size: 86_400_000 },
    { limit: 2_629_746_000, unit: 'week', size: 604_800_000 },
    { limit: 31_556_952_000, unit: 'month', size: 2_629_746_000 },
    { limit: Infinity, unit: 'year', size: 31_556_952_000 },
  ];
  const bucket = thresholds.find((item) => abs < item.limit) ?? thresholds[thresholds.length - 1]!;
  const value = Math.round(diff / bucket.size);
  return relativeFormatter.format(value, bucket.unit);
}

function normaliseDifficulty(value: string | null | undefined): DifficultyKey {
  if (!value) return 'unspecified';
  const key = value.toString().trim().toLowerCase();
  if (!key) return 'unspecified';
  if (['easy', 'facil', 'fácil', 'iniciante', 'beginner'].some((token) => key.includes(token))) {
    return 'beginner';
  }
  if (['medium', 'medio', 'médio', 'intermedio', 'intermédio', 'intermediate'].some((token) => key.includes(token))) {
    return 'intermediate';
  }
  if (['hard', 'dificil', 'difícil', 'avancado', 'avançado', 'advanced', 'expert'].some((token) => key.includes(token))) {
    return 'advanced';
  }
  return 'unspecified';
}

function addFacet(map: Map<string, number>, key: string | null | undefined) {
  if (!key) return;
  const id = key.trim();
  if (!id) return;
  map.set(id, (map.get(id) ?? 0) + 1);
}

function buildFacets(records: TrainerLibraryExerciseRecord[]): {
  muscles: TrainerLibraryFacet[];
  equipments: TrainerLibraryFacet[];
  difficulties: TrainerLibraryFacet[];
} {
  const muscleMap = new Map<string, number>();
  const equipmentMap = new Map<string, number>();
  const difficultyMap = new Map<string, number>();

  records.forEach((record) => {
    const muscles = record.muscleTags?.length ? record.muscleTags : parseTagList(record.muscleGroup);
    muscles.forEach((tag) => addFacet(muscleMap, tag));

    const equipments = record.equipmentTags?.length ? record.equipmentTags : parseTagList(record.equipment);
    equipments.forEach((tag) => addFacet(equipmentMap, tag));

    const difficulty = normaliseDifficulty(record.difficultyRaw ?? record.difficulty);
    difficultyMap.set(difficulty, (difficultyMap.get(difficulty) ?? 0) + 1);
  });

  const muscles = Array.from(muscleMap.entries())
    .sort((a, b) => b[1]! - a[1]!)
    .slice(0, 24)
    .map(([id, count]) => ({ id, label: id, count } satisfies TrainerLibraryFacet));

  const equipments = Array.from(equipmentMap.entries())
    .sort((a, b) => b[1]! - a[1]!)
    .slice(0, 24)
    .map(([id, count]) => ({ id, label: id, count } satisfies TrainerLibraryFacet));

  const difficulties = (Object.keys(difficultyTokens) as DifficultyKey[]).map((id) => ({
    id,
    label: difficultyTokens[id].label,
    count: difficultyMap.get(id) ?? 0,
  }));

  return { muscles, equipments, difficulties };
}

function buildTimeline(records: TrainerLibraryExerciseRecord[], now: Date): TrainerLibraryTimelinePoint[] {
  const buckets = new Map<string, { start: Date; personal: number; global: number }>();
  const startCurrent = startOfWeek(now);

  for (let index = 11; index >= 0; index -= 1) {
    const start = new Date(startCurrent.getTime() - index * WEEK_MS);
    const key = isoWeekKey(start);
    buckets.set(key, { start, personal: 0, global: 0 });
  }

  records.forEach((record) => {
    const created = parseDate(record.createdAt) ?? parseDate(record.updatedAt);
    if (!created) return;
    const key = isoWeekKey(created);
    const bucket = buckets.get(key);
    if (!bucket) return;
    if (record.scope === 'personal') bucket.personal += 1;
    else bucket.global += 1;
  });

  return Array.from(buckets.values()).map((bucket) => ({
    week: bucket.start.toISOString().slice(0, 10),
    label: formatWeekLabel(bucket.start),
    personal: bucket.personal,
    global: bucket.global,
    total: bucket.personal + bucket.global,
  } satisfies TrainerLibraryTimelinePoint));
}

function buildDistribution(
  records: TrainerLibraryExerciseRecord[],
  total: number,
): TrainerLibraryDistributionStat[] {
  if (total <= 0) {
    return (Object.keys(difficultyTokens) as DifficultyKey[]).map((key) => ({
      id: key,
      label: difficultyTokens[key].label,
      count: 0,
      percentage: 0,
      tone: difficultyTokens[key].tone,
    }));
  }

  const map = new Map<DifficultyKey, number>();
  records.forEach((record) => {
    const key = normaliseDifficulty(record.difficultyRaw ?? record.difficulty);
    map.set(key, (map.get(key) ?? 0) + 1);
  });

  return (Object.keys(difficultyTokens) as DifficultyKey[]).map((key) => ({
    id: key,
    label: difficultyTokens[key].label,
    count: map.get(key) ?? 0,
    percentage: map.get(key) ? (map.get(key)! / total) * 100 : 0,
    tone: difficultyTokens[key].tone,
  } satisfies TrainerLibraryDistributionStat));
}

function buildMuscleFocus(records: TrainerLibraryExerciseRecord[], total: number): TrainerLibraryDistributionStat[] {
  const map = new Map<string, number>();
  records.forEach((record) => {
    const muscles = record.muscleTags?.length ? record.muscleTags : parseTagList(record.muscleGroup);
    const unique = new Set(muscles.map((tag) => tag.trim()).filter(Boolean));
    unique.forEach((tag) => map.set(tag, (map.get(tag) ?? 0) + 1));
  });

  if (!map.size) {
    return [];
  }

  const entries = Array.from(map.entries()).sort((a, b) => b[1]! - a[1]!);
  return entries.slice(0, 6).map(([label, count], index) => ({
    id: label,
    label,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    tone: index === 0 ? 'positive' : 'neutral',
  } satisfies TrainerLibraryDistributionStat));
}

function buildHeroMetrics(
  personal: TrainerLibraryExerciseRecord[],
  catalog: TrainerLibraryExerciseRecord[],
  now: Date,
): TrainerLibraryHeroMetric[] {
  const totalPersonal = personal.length;
  const totalCatalog = catalog.length;

  const startOfMonthValue = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const createdThisMonth = personal.filter((record) => {
    const created = parseDate(record.createdAt);
    return created ? created.getTime() >= startOfMonthValue.getTime() : false;
  }).length;

  const createdLastMonth = personal.filter((record) => {
    const created = parseDate(record.createdAt);
    if (!created) return false;
    return created.getTime() >= previousMonthStart.getTime() && created.getTime() <= previousMonthEnd.getTime();
  }).length;

  let trend: string | null = null;
  if (createdLastMonth > 0) {
    const diff = createdThisMonth - createdLastMonth;
    const percent = (diff / createdLastMonth) * 100;
    const prefix = diff >= 0 ? '+' : '−';
    trend = `${prefix}${Math.abs(percent).toFixed(0)}% vs. mês anterior`;
  } else if (createdThisMonth > 0) {
    trend = '+∞% vs. mês anterior';
  }

  const withVideo = personal.filter((record) => Boolean(record.videoUrl)).length;

  return [
    {
      id: 'personal-total',
      label: 'Biblioteca pessoal',
      value: numberFormatter.format(totalPersonal),
      hint: 'Exercícios disponíveis para planos.',
      tone: 'positive',
    },
    {
      id: 'personal-new-month',
      label: 'Novos este mês',
      value: numberFormatter.format(createdThisMonth),
      hint: `Desde ${dateFormatter.format(startOfMonthValue)}`,
      trend: trend ?? undefined,
      tone: createdThisMonth > createdLastMonth ? 'positive' : 'neutral',
    },
    {
      id: 'catalog-size',
      label: 'Catálogo global',
      value: numberFormatter.format(totalCatalog),
      hint: 'Exercícios publicados pela equipa.',
      tone: totalCatalog > 0 ? 'neutral' : 'warning',
    },
    {
      id: 'videos-ready',
      label: 'Com vídeo',
      value: numberFormatter.format(withVideo),
      hint: 'Prontos para partilhar com clientes.',
      tone: withVideo > 0 ? 'positive' : 'warning',
    },
  ];
}

function buildHighlights(
  personal: TrainerLibraryExerciseRecord[],
  catalog: TrainerLibraryExerciseRecord[],
  now: Date,
): TrainerLibraryHighlight[] {
  const highlights: TrainerLibraryHighlight[] = [];

  const lastUpdated = personal
    .map((record) => parseDate(record.updatedAt) ?? parseDate(record.createdAt))
    .filter((date): date is Date => date instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  if (lastUpdated) {
    highlights.push({
      id: 'recent-update',
      title: 'Última atualização',
      description: `Actualizado ${formatRelative(lastUpdated, now) ?? 'recentemente'}.`,
      meta: dateTimeFormatter.format(lastUpdated),
      tone: 'positive',
    });
  } else {
    highlights.push({
      id: 'recent-update',
      title: 'Sem actividade recente',
      description: 'Ainda não registaste exercícios pessoais este mês.',
      tone: 'warning',
    });
  }

  const focus = buildMuscleFocus(personal, personal.length);
  if (focus.length) {
    const leader = focus[0]!;
    highlights.push({
      id: 'focus-muscle',
      title: 'Foco principal',
      description: `${leader.label} lidera a biblioteca pessoal.`,
      meta: `${numberFormatter.format(leader.count)} exercícios`,
      tone: 'positive',
    });
  } else {
    highlights.push({
      id: 'focus-muscle',
      title: 'Define grupos musculares',
      description: 'Adiciona tags musculares para desbloquear recomendações mais ricas.',
      tone: 'neutral',
    });
  }

  const clones = catalog.filter((record) => Boolean(record.videoUrl)).length;
  highlights.push({
    id: 'catalog-ready',
    title: 'Catálogo disponível',
    description: `${numberFormatter.format(catalog.length)} exercícios globais prontos a duplicar.`,
    meta: clones > 0 ? `${numberFormatter.format(clones)} com vídeo e instruções.` : null,
    tone: catalog.length > 0 ? 'neutral' : 'warning',
    href: '/dashboard/pt/library?scope=global',
  });

  return highlights;
}

function buildRows(records: TrainerLibraryExerciseRecord[], now: Date): TrainerLibraryTableRow[] {
  const sorted = [...records].sort((a, b) => {
    const aDate = parseDate(a.updatedAt) ?? parseDate(a.createdAt);
    const bDate = parseDate(b.updatedAt) ?? parseDate(b.createdAt);
    const aTime = aDate ? aDate.getTime() : 0;
    const bTime = bDate ? bDate.getTime() : 0;
    return bTime - aTime;
  });

  return sorted.map((record) => {
    const scope = scopeTokens[record.scope];
    const difficultyKey = normaliseDifficulty(record.difficultyRaw ?? record.difficulty);
    const difficulty = difficultyTokens[difficultyKey];

    const muscles = record.muscleTags?.length ? record.muscleTags : parseTagList(record.muscleGroup);
    const equipments = record.equipmentTags?.length ? record.equipmentTags : parseTagList(record.equipment);

    const createdDate = parseDate(record.createdAt);
    const updatedDate = parseDate(record.updatedAt) ?? createdDate;

    return {
      id: record.id,
      name: record.name,
      description: record.description ?? null,
      scope: record.scope,
      scopeLabel: scope.label,
      scopeTone: scope.tone,
      muscleTags: muscles,
      equipmentTags: equipments,
      muscleGroup: record.muscleGroup ?? null,
      equipment: record.equipment ?? null,
      difficulty: difficultyKey,
      difficultyLabel: difficulty.label,
      difficultyTone: difficulty.tone,
      difficultyRaw: record.difficultyRaw ?? null,
      createdAt: record.createdAt,
      createdLabel: createdDate ? dateFormatter.format(createdDate) : '—',
      createdRelative: formatRelative(createdDate, now),
      updatedAt: record.updatedAt ?? record.createdAt,
      updatedLabel: updatedDate ? dateTimeFormatter.format(updatedDate) : '—',
      updatedRelative: formatRelative(updatedDate, now),
      videoUrl: record.videoUrl ?? null,
    } satisfies TrainerLibraryTableRow;
  });
}

export function buildTrainerLibraryDashboard(
  records: TrainerLibraryExerciseRecord[],
  options: Options,
): TrainerLibraryDashboardData {
  const now = new Date();
  const personal = records.filter((record) => record.scope === 'personal');
  const catalog = records.filter((record) => record.scope === 'global');

  const hero = buildHeroMetrics(personal, catalog, now);
  const timeline = buildTimeline(records, now);
  const difficulties = buildDistribution(records, records.length);
  const muscleFocus = buildMuscleFocus(personal, personal.length);
  const highlights = buildHighlights(personal, catalog, now);
  const rows = buildRows(records, now);
  const facets = buildFacets(records);

  const lastUpdatedDate = rows
    .map((row) => parseDate(row.updatedAt) ?? parseDate(row.createdAt))
    .filter((date): date is Date => date instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? now;

  return {
    updatedAt: lastUpdatedDate.toISOString(),
    supabase: options.supabase,
    hero,
    timeline,
    difficulties,
    muscleFocus,
    highlights,
    rows,
    facets,
  } satisfies TrainerLibraryDashboardData;
}
