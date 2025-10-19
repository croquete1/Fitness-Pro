export type ClientMetricRow = {
  id: string;
  measured_at: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_pct: number | null;
  bmi: number | null;
  notes: string | null;
};

export type MetricsTimelinePoint = {
  iso: string;
  weight: number | null;
  bodyFat: number | null;
  bmi: number | null;
};

export type MetricsSummary = {
  latest: ClientMetricRow | null;
  previous: ClientMetricRow | null;
  earliest: ClientMetricRow | null;
  averageWeight: number | null;
  averageBodyFat: number | null;
  averageBmi: number | null;
  trendWeight: number | null;
  trendBodyFat: number | null;
  trendBmi: number | null;
  totalChangeWeight: number | null;
  totalChangeBodyFat: number | null;
  measurementsTotal: number;
  measurements30d: number;
  measurements90d: number;
  measurementFrequencyDays: number | null;
  streakDays: number | null;
  bestWeight: number | null;
  worstWeight: number | null;
  lastUpdatedAt: string | null;
};

export type MetricsDashboard = {
  summary: MetricsSummary;
  timeline: MetricsTimelinePoint[];
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toIsoDate(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  const str = typeof value === "string" ? value.trim() : String(value);
  if (!str) return null;
  const date = new Date(str);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toISOString();
}

export function normalizeClientMetricRows(
  input: ReadonlyArray<Partial<ClientMetricRow> & Record<string, unknown>> | null | undefined,
): ClientMetricRow[] {
  if (!input) return [];

  return input
    .map((row, index) => {
      const measured_at = toIsoDate(row.measured_at);
      const weight_kg = toNumber(row.weight_kg);
      const height_cm = toNumber(row.height_cm);
      const body_fat_pct = toNumber(row.body_fat_pct);
      const bmi = toNumber(row.bmi);
      const notes = typeof row.notes === "string" ? row.notes : row.notes != null ? String(row.notes) : null;
      const idSource = row.id ?? `${measured_at ?? "row"}-${index}`;
      const id = typeof idSource === "string" ? idSource : String(idSource);

      return {
        id,
        measured_at,
        weight_kg,
        height_cm,
        body_fat_pct,
        bmi,
        notes,
      } satisfies ClientMetricRow;
    })
    .sort((a, b) => {
      if (!a.measured_at && !b.measured_at) return 0;
      if (!a.measured_at) return 1;
      if (!b.measured_at) return -1;
      return new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime();
    });
}

export function computeClientMetrics(rows: ClientMetricRow[], now = new Date()): MetricsDashboard {
  const normalized = rows.slice();
  const weights = normalized
    .map((row) => row.weight_kg)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const bodyFats = normalized
    .map((row) => row.body_fat_pct)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const bmis = normalized
    .map((row) => row.bmi ?? (row.weight_kg && row.height_cm ? row.weight_kg / Math.pow(row.height_cm / 100, 2) : null))
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  const latest = normalized.find((row) => row.measured_at) ?? null;
  const previous = normalized.find((row, index) => index > 0 && row.measured_at) ?? null;
  const earliest = [...normalized].reverse().find((row) => row.measured_at) ?? null;

  const trendWeight =
    latest?.weight_kg != null && previous?.weight_kg != null
      ? Number((latest.weight_kg - previous.weight_kg).toFixed(1))
      : null;
  const trendBodyFat =
    latest?.body_fat_pct != null && previous?.body_fat_pct != null
      ? Number((latest.body_fat_pct - previous.body_fat_pct).toFixed(1))
      : null;
  const trendBmi =
    latest?.bmi != null && previous?.bmi != null
      ? Number((latest.bmi - previous.bmi).toFixed(1))
      : null;

  const totalChangeWeight =
    latest?.weight_kg != null && earliest?.weight_kg != null
      ? Number((latest.weight_kg - earliest.weight_kg).toFixed(1))
      : null;
  const totalChangeBodyFat =
    latest?.body_fat_pct != null && earliest?.body_fat_pct != null
      ? Number((latest.body_fat_pct - earliest.body_fat_pct).toFixed(1))
      : null;

  const timestamps = normalized
    .map((row) => (row.measured_at ? new Date(row.measured_at).getTime() : null))
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    .sort((a, b) => a - b);
  const cadenceDiffs: number[] = [];
  for (let i = 1; i < timestamps.length; i += 1) {
    const diffDays = (timestamps[i] - timestamps[i - 1]) / 86_400_000;
    if (Number.isFinite(diffDays)) {
      cadenceDiffs.push(diffDays);
    }
  }
  const measurementFrequencyDays =
    cadenceDiffs.length > 0
      ? Number((cadenceDiffs.reduce((acc, value) => acc + value, 0) / cadenceDiffs.length).toFixed(1))
      : null;

  const nowTime = now.getTime();
  const measurements30d = normalized.filter((row) => {
    if (!row.measured_at) return false;
    const diff = nowTime - new Date(row.measured_at).getTime();
    return diff >= 0 && diff <= 30 * 86_400_000;
  }).length;
  const measurements90d = normalized.filter((row) => {
    if (!row.measured_at) return false;
    const diff = nowTime - new Date(row.measured_at).getTime();
    return diff >= 0 && diff <= 90 * 86_400_000;
  }).length;

  const streakDays = latest?.measured_at
    ? Math.max(0, Math.round((nowTime - new Date(latest.measured_at).getTime()) / 86_400_000))
    : null;

  const timeline: MetricsTimelinePoint[] = normalized
    .filter((row): row is ClientMetricRow & { measured_at: string } => Boolean(row.measured_at))
    .slice()
    .sort((a, b) => new Date(a.measured_at!).getTime() - new Date(b.measured_at!).getTime())
    .map((row) => ({
      iso: row.measured_at!,
      weight: row.weight_kg,
      bodyFat: row.body_fat_pct,
      bmi: row.bmi ?? (row.weight_kg && row.height_cm ? Number((row.weight_kg / Math.pow(row.height_cm / 100, 2)).toFixed(1)) : null),
    }));

  return {
    summary: {
      latest,
      previous,
      earliest,
      averageWeight:
        weights.length > 0 ? Number((weights.reduce((acc, value) => acc + value, 0) / weights.length).toFixed(1)) : null,
      averageBodyFat:
        bodyFats.length > 0 ? Number((bodyFats.reduce((acc, value) => acc + value, 0) / bodyFats.length).toFixed(1)) : null,
      averageBmi:
        bmis.length > 0 ? Number((bmis.reduce((acc, value) => acc + value, 0) / bmis.length).toFixed(1)) : null,
      trendWeight,
      trendBodyFat,
      trendBmi,
      totalChangeWeight,
      totalChangeBodyFat,
      measurementsTotal: normalized.length,
      measurements30d,
      measurements90d,
      measurementFrequencyDays,
      streakDays,
      bestWeight: weights.length > 0 ? Math.min(...weights) : null,
      worstWeight: weights.length > 0 ? Math.max(...weights) : null,
      lastUpdatedAt: latest?.measured_at ?? null,
    },
    timeline,
  } satisfies MetricsDashboard;
}
