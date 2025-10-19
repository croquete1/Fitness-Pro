import { NextResponse } from 'next/server';

import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { getAdminPlansFallback } from '@/lib/fallback/admin-plans';
import { supabaseFallbackJson } from '@/lib/supabase/responses';
import { tryCreateServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const TABLE_CANDIDATES = ['plans', 'training_plans', 'programs'] as const;

type DifficultyStat = { key: string; count: number };

type TableCandidate = (typeof TABLE_CANDIDATES)[number];

type CountResult = { count: number; table: TableCandidate };

function normaliseDifficulty(value: unknown): string {
  if (!value) return 'Não definido';
  const label = String(value).trim();
  if (!label) return 'Não definido';
  const lower = label.toLowerCase();
  if (lower.includes('inic')) return 'Iniciante';
  if (lower.includes('inter')) return 'Intermédio';
  if (lower.includes('avan')) return 'Avançado';
  if (lower.includes('esp')) return 'Especializado';
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function pickTimestamp(row: Record<string, any>): string | null {
  const candidates = [
    row.updated_at,
    row.updatedAt,
    row.modified_at,
    row.modifiedAt,
    row.created_at,
    row.createdAt,
    row.inserted_at,
  ];
  for (const value of candidates) {
    if (!value) continue;
    const iso = new Date(value).toISOString();
    if (Number.isNaN(new Date(iso).getTime())) continue;
    return iso;
  }
  return null;
}

function pickDuration(row: Record<string, any>): number | null {
  const candidates = [
    row.duration_weeks,
    row.durationWeeks,
    row.duration,
    row.weeks,
    row.length_weeks,
  ];
  for (const value of candidates) {
    if (value == null) continue;
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue <= 0) continue;
    return numberValue;
  }
  return null;
}

async function detectTable(): Promise<CountResult | null> {
  const sb = tryCreateServerClient();
  if (!sb) return null;

  for (const table of TABLE_CANDIDATES) {
    const head = await sb.from(table).select('id', { head: true, count: 'exact' });
    if (head.error) {
      const code = head.error.code ?? '';
      if (code === '42P01' || code === 'PGRST205' || code === 'PGRST301') {
        continue;
      }
      throw head.error;
    }
    return { count: head.count ?? 0, table };
  }

  return { count: 0, table: TABLE_CANDIDATES[0] };
}

async function countFlag(
  table: TableCandidate,
  value: boolean,
  columns: string[],
): Promise<number | null> {
  const sb = tryCreateServerClient();
  if (!sb) return null;

  for (const column of columns) {
    const query = sb.from(table).select('id', { head: true, count: 'exact' }).eq(column, value);
    const { error, count } = await query;
    if (!error) return count ?? 0;
    const code = error.code ?? '';
    if (code === '42703' || code === 'PGRST204' || error.message?.includes('column')) {
      continue;
    }
    throw error;
  }

  return null;
}

function buildFallbackResponse() {
  const fallback = getAdminPlansFallback();
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const difficulties = new Map<string, number>();
  const durations: number[] = [];
  let latest: string | null = null;
  let publicCount = 0;
  let createdThisMonth = 0;

  fallback.forEach((plan) => {
    const key = normaliseDifficulty(plan.difficulty);
    difficulties.set(key, (difficulties.get(key) ?? 0) + 1);
    durations.push(plan.duration_weeks);
    if (plan.is_public) publicCount += 1;
    const ts = plan.updated_at ?? plan.created_at;
    if (ts && (!latest || new Date(ts).getTime() > new Date(latest).getTime())) {
      latest = ts;
    }
    if (ts && new Date(ts).getTime() >= monthStart.getTime()) {
      createdThisMonth += 1;
    }
  });

  const sorted = Array.from(difficulties.entries())
    .map<DifficultyStat>(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);

  const average = durations.length
    ? Math.round((durations.reduce((acc, value) => acc + value, 0) / durations.length) * 10) / 10
    : null;
  const median = (() => {
    if (!durations.length) return null;
    const sortedDurations = [...durations].sort((a, b) => a - b);
    const mid = Math.floor(sortedDurations.length / 2);
    if (sortedDurations.length % 2 === 0) {
      return Math.round(((sortedDurations[mid - 1] + sortedDurations[mid]) / 2) * 10) / 10;
    }
    return sortedDurations[mid];
  })();

  return supabaseFallbackJson({
    ok: true as const,
    source: 'fallback' as const,
    total: fallback.length,
    publicCount,
    privateCount: fallback.length - publicCount,
    averageDurationWeeks: average,
    medianDurationWeeks: median,
    latestUpdate: latest,
    createdThisMonth,
    difficulties: sorted,
    sampleSize: fallback.length,
    datasetSize: fallback.length,
  });
}

export async function GET() {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const detected = await detectTable().catch((error) => {
    console.warn('[admin/plans/insights] detect table failed', error);
    return null;
  });

  if (!detected) {
    return buildFallbackResponse();
  }

  const { table, count } = detected;
  const sb = tryCreateServerClient();
  if (!sb) {
    return buildFallbackResponse();
  }

  const detail = await sb
    .from(table)
    .select('*')
    .limit(1000);

  if (detail.error) {
    const code = detail.error.code ?? '';
    if (code === '42P01' || code === 'PGRST205' || code === 'PGRST301') {
      return buildFallbackResponse();
    }
    console.warn('[admin/plans/insights] select failed', detail.error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const rows = detail.data ?? [];
  const difficulties = new Map<string, number>();
  const durations: number[] = [];
  let latest: string | null = null;
  let publicCount = 0;
  let createdThisMonth = 0;
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  rows.forEach((row) => {
    const key = normaliseDifficulty(row.difficulty ?? row.level ?? row.dificuldade);
    difficulties.set(key, (difficulties.get(key) ?? 0) + 1);

    const duration = pickDuration(row);
    if (duration) durations.push(duration);

    const isPublic = Boolean(row.is_public ?? row.public ?? row.published ?? false);
    if (isPublic) publicCount += 1;

    const ts = pickTimestamp(row);
    if (ts && (!latest || new Date(ts).getTime() > new Date(latest).getTime())) {
      latest = ts;
    }
    if (ts && new Date(ts).getTime() >= monthStart.getTime()) {
      createdThisMonth += 1;
    }
  });

  const precisePublic = await countFlag(table, true, ['is_public', 'public']).catch((error) => {
    console.warn('[admin/plans/insights] public count failed', error);
    return null;
  });

  if (typeof precisePublic === 'number') {
    publicCount = precisePublic;
  }

  const privateCount = Math.max(count - publicCount, 0);

  const sorted = Array.from(difficulties.entries())
    .map<DifficultyStat>(([key, value]) => ({ key, count: value }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const average = durations.length
    ? Math.round((durations.reduce((acc, value) => acc + value, 0) / durations.length) * 10) / 10
    : null;
  const median = (() => {
    if (!durations.length) return null;
    const ordered = [...durations].sort((a, b) => a - b);
    const middle = Math.floor(ordered.length / 2);
    if (ordered.length % 2 === 0) {
      return Math.round(((ordered[middle - 1] + ordered[middle]) / 2) * 10) / 10;
    }
    return ordered[middle];
  })();

  return NextResponse.json(
    {
      ok: true as const,
      source: 'supabase' as const,
      total: count,
      publicCount,
      privateCount,
      averageDurationWeeks: average,
      medianDurationWeeks: median,
      latestUpdate: latest,
      createdThisMonth,
      difficulties: sorted,
      sampleSize: rows.length,
      datasetSize: count,
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}
