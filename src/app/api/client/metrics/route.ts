import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import {
  computeClientMetrics,
  normalizeClientMetricRows,
  type ClientMetricRow,
  type MetricsSummary,
  type MetricsTimelinePoint,
} from '@/lib/metrics/dashboard';
import { fallbackClientMetrics } from '@/lib/fallback/metrics';

type MetricsSuccessResponse = {
  ok: true;
  rows: ClientMetricRow[];
  summary: MetricsSummary;
  timeline: MetricsTimelinePoint[];
  source: 'supabase' | 'fallback';
  updatedAt: string;
  dataset?: ClientMetricRow[];
};

type MetricsErrorResponse = {
  ok: false;
  message: string;
};

type MetricsPayload = MetricsSuccessResponse | MetricsErrorResponse;

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const normalized = Number(value.replace(',', '.'));
    return Number.isFinite(normalized) ? normalized : null;
  }
  return null;
}

function coerceIso(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (!Number.isFinite(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function buildSuccessPayload(rows: ClientMetricRow[], source: 'supabase' | 'fallback'): MetricsSuccessResponse {
  const dashboard = computeClientMetrics(rows);
  return {
    ok: true,
    rows,
    summary: dashboard.summary,
    timeline: dashboard.timeline,
    source,
    updatedAt: dashboard.summary.lastUpdatedAt ?? new Date().toISOString(),
  };
}

export async function GET(): Promise<NextResponse<MetricsPayload>> {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const sb = createServerClient();
  const { data, error } = await sb
    .from('anthropometry')
    .select('id,measured_at,weight_kg,height_cm,body_fat_pct,bmi,notes')
    .eq('user_id', session.user.id)
    .order('measured_at', { ascending: false })
    .limit(365);

  if (error) {
    return NextResponse.json(buildSuccessPayload(fallbackClientMetrics, 'fallback'));
  }

  const rows = normalizeClientMetricRows(data ?? []);
  return NextResponse.json(buildSuccessPayload(rows, 'supabase'));
}

export async function POST(req: Request): Promise<NextResponse<MetricsPayload>> {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const items = Array.isArray(body)
    ? body
    : Array.isArray(body?.rows)
    ? body.rows
    : body
    ? [body]
    : [];

  const rowsToInsert = items
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const measuredIso =
        'measured_at' in entry && entry.measured_at
          ? coerceIso(entry.measured_at)
          : 'date' in entry && entry.date
          ? coerceIso(entry.date)
          : null;
      const nowIso = new Date().toISOString();
      const baseNotes = (entry as { notes?: unknown }).notes;

      return {
        user_id: session.user.id,
        measured_at: measuredIso ?? nowIso,
        weight_kg:
          coerceNumber((entry as { weight_kg?: unknown; weight?: unknown }).weight_kg ?? (entry as { weight?: unknown }).weight) ??
          null,
        height_cm:
          coerceNumber((entry as { height_cm?: unknown; height?: unknown }).height_cm ?? (entry as { height?: unknown }).height) ??
          null,
        body_fat_pct:
          coerceNumber(
            (entry as { body_fat_pct?: unknown; bodyFat?: unknown; body_fat?: unknown }).body_fat_pct ??
              (entry as { bodyFat?: unknown; body_fat?: unknown }).bodyFat ??
              (entry as { body_fat?: unknown }).body_fat,
          ) ?? null,
        bmi: coerceNumber((entry as { bmi?: unknown }).bmi) ?? null,
        notes:
          typeof baseNotes === 'string'
            ? baseNotes
            : baseNotes != null
            ? String(baseNotes)
            : null,
      };
    })
    .filter((row): row is {
      user_id: string;
      measured_at: string;
      weight_kg: number | null;
      height_cm: number | null;
      body_fat_pct: number | null;
      bmi: number | null;
      notes: string | null;
    } => Boolean(row));

  if (!rowsToInsert.length) {
    return NextResponse.json({ ok: false, message: 'Sem dados para guardar.' }, { status: 400 });
  }

  const sb = createServerClient();
  const { data, error } = await sb
    .from('anthropometry')
    .insert(rowsToInsert)
    .select('id,measured_at,weight_kg,height_cm,body_fat_pct,bmi,notes')
    .order('measured_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const { data: dataset, error: datasetError } = await sb
    .from('anthropometry')
    .select('id,measured_at,weight_kg,height_cm,body_fat_pct,bmi,notes')
    .eq('user_id', session.user.id)
    .order('measured_at', { ascending: false })
    .limit(365);

  if (datasetError) {
    return NextResponse.json(buildSuccessPayload(fallbackClientMetrics, 'fallback'));
  }

  const normalizedDataset = normalizeClientMetricRows(dataset ?? []);
  const dashboard = computeClientMetrics(normalizedDataset);

  return NextResponse.json({
    ok: true,
    rows: normalizeClientMetricRows(data ?? []),
    dataset: normalizedDataset,
    summary: dashboard.summary,
    timeline: dashboard.timeline,
    source: 'supabase',
    updatedAt: dashboard.summary.lastUpdatedAt ?? new Date().toISOString(),
  });
}
