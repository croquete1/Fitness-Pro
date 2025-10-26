'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import {
  type ClientMetricRow,
  type MetricsSummary,
  type MetricsTimelinePoint,
} from '@/lib/metrics/dashboard';

type Props = {
  initialRows: ClientMetricRow[];
  initialSummary: MetricsSummary;
  initialTimeline: MetricsTimelinePoint[];
  fallback?: boolean;
};

type RangeValue = '30d' | '90d' | '180d' | 'all';
type SeriesValue = 'weight' | 'bodyFat' | 'bmi';

type MetricsApiSuccess = {
  ok: true;
  rows: ClientMetricRow[];
  dataset?: ClientMetricRow[];
  summary: MetricsSummary;
  timeline: MetricsTimelinePoint[];
  source: 'supabase' | 'fallback';
  updatedAt: string;
};

type MetricsApiResponse = MetricsApiSuccess & { message?: string };

const rangeOptions: Array<{ label: string; value: RangeValue }> = [
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
  { label: '180 dias', value: '180d' },
  { label: 'Todo o histórico', value: 'all' },
];

const seriesOptions: Array<{ label: string; value: SeriesValue; hint: string }> = [
  { label: 'Peso', value: 'weight', hint: 'kg' },
  { label: '% Massa gorda', value: 'bodyFat', hint: '%' },
  { label: 'IMC', value: 'bmi', hint: 'indice' },
];

const fetcher = async (url: string): Promise<MetricsApiSuccess> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Não foi possível carregar as métricas.');
  }
  const json = (await response.json()) as MetricsApiResponse;
  if (!json?.ok) {
    throw new Error(json?.message ?? 'Não foi possível carregar as métricas.');
  }
  return json;
};

function parseNumberLike(value: string): number | null {
  if (!value) return null;
  const normalized = value.replace(',', '.').trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function calcBMI(weight: number | null | undefined, height: number | null | undefined): number | null {
  if (!weight || !height) return null;
  const meters = height / 100;
  if (!meters) return null;
  const bmi = weight / (meters * meters);
  return Number.isFinite(bmi) ? Number(bmi.toFixed(1)) : null;
}

function formatDate(iso: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-PT', options ?? {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatNumber(value: number | null | undefined, fraction = 1) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: value % 1 === 0 ? 0 : fraction,
    maximumFractionDigits: fraction,
  }).format(value);
}

function formatKg(value: number | null | undefined) {
  const formatted = formatNumber(value);
  return formatted === '—' ? formatted : `${formatted} kg`;
}

function formatPercent(value: number | null | undefined) {
  const formatted = formatNumber(value);
  return formatted === '—' ? formatted : `${formatted} %`;
}

function formatBmi(value: number | null | undefined) {
  return formatNumber(value);
}

function formatDelta(value: number | null | undefined, unit: string) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  const sign = value > 0 ? '+' : '';
  const formatted = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: Math.abs(value) % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value);
  return `${sign}${formatted}${unit}`;
}

function formatDays(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  const rounded = Math.round(value);
  return `${rounded} ${rounded === 1 ? 'dia' : 'dias'}`;
}

function describeTone(delta: number | null | undefined, invert = false) {
  if (typeof delta !== 'number' || Number.isNaN(delta) || delta === 0) return undefined;
  const negative = delta < 0;
  if (invert) {
    return negative ? 'positive' : 'warning';
  }
  return negative ? 'warning' : 'positive';
}

export default function MetricsClient({ initialRows, initialSummary, initialTimeline, fallback = false }: Props) {
  const [rows, setRows] = React.useState<ClientMetricRow[]>(initialRows);
  const [summary, setSummary] = React.useState<MetricsSummary>(initialSummary);
  const [timeline, setTimeline] = React.useState<MetricsTimelinePoint[]>(initialTimeline);
  const [range, setRange] = React.useState<RangeValue>('90d');
  const [series, setSeries] = React.useState<SeriesValue>('weight');
  const [query, setQuery] = React.useState('');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [fallbackActive, setFallbackActive] = React.useState(fallback);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [form, setForm] = React.useState({
    date: new Date().toISOString().substring(0, 10),
    weight: '',
    height: '',
    fat: '',
    notes: '',
  });

  const {
    data: remote,
    error: remoteError,
    isLoading: remoteLoading,
    mutate: refresh,
  } = useSWR<MetricsApiSuccess>('/api/client/metrics', fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });

  React.useEffect(() => {
    if (!remote) return;
    const dataset = remote.dataset ?? remote.rows;
    setRows(dataset);
    setSummary(remote.summary);
    setTimeline(remote.timeline);
    setFallbackActive(remote.source === 'fallback');
  }, [remote]);

  const filteredTimeline = React.useMemo(() => {
    if (range === 'all') return timeline;
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 180;
    const reference = summary.lastUpdatedAt ? new Date(summary.lastUpdatedAt).getTime() : Date.now();
    return timeline.filter((point) => {
      const pointTime = new Date(point.iso).getTime();
      return reference - pointTime <= days * 86_400_000;
    });
  }, [range, summary.lastUpdatedAt, timeline]);

  const chartData = React.useMemo(
    () =>
      filteredTimeline.map((point) => ({
        iso: point.iso,
        label: new Date(point.iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
        value:
          series === 'weight'
            ? point.weight
            : series === 'bodyFat'
            ? point.bodyFat
            : point.bmi ?? calcBMI(point.weight ?? null, summary.latest?.height_cm ?? null),
      })),
    [filteredTimeline, series, summary.latest?.height_cm],
  );

  const hasChartData = chartData.some((item) => typeof item.value === 'number' && !Number.isNaN(item.value));

  const filteredRows = React.useMemo(() => {
    if (!query.trim()) return rows;
    const search = query.trim().toLowerCase();
    return rows.filter((row) => {
      const note = row.notes?.toLowerCase() ?? '';
      const weight = row.weight_kg != null ? row.weight_kg.toFixed(1) : '';
      const fat = row.body_fat_pct != null ? row.body_fat_pct.toFixed(1) : '';
      const dateLabel = row.measured_at ? formatDate(row.measured_at).toLowerCase() : '';
      return note.includes(search) || weight.includes(search) || fat.includes(search) || dateLabel.includes(search);
    });
  }, [query, rows]);

  const summaryCards = React.useMemo(() => {
    const bmiValue = summary.latest?.bmi ?? calcBMI(summary.latest?.weight_kg ?? null, summary.latest?.height_cm ?? null);
    return [
      {
        key: 'weight',
        label: 'Peso actual',
        value: formatKg(summary.latest?.weight_kg),
        delta: summary.trendWeight,
        unit: ' kg',
        hint: summary.latest?.measured_at ? `Actualizado a ${formatDate(summary.latest.measured_at, { day: '2-digit', month: 'short' })}` : 'Sem avaliações registadas',
        tone: describeTone(summary.trendWeight, true),
      },
      {
        key: 'bodyFat',
        label: '% Massa gorda',
        value: formatPercent(summary.latest?.body_fat_pct),
        delta: summary.trendBodyFat,
        unit: ' pp',
        hint: summary.previous?.body_fat_pct != null ? `Comparado com ${formatPercent(summary.previous.body_fat_pct)}` : 'Sem histórico para comparação',
        tone: describeTone(summary.trendBodyFat, true),
      },
      {
        key: 'bmi',
        label: 'IMC',
        value: formatBmi(bmiValue),
        delta: summary.trendBmi,
        unit: '',
        hint: summary.averageBmi != null ? `Média geral: ${formatBmi(summary.averageBmi)}` : 'Sem média calculada',
        tone: describeTone(summary.trendBmi, true),
      },
      {
        key: 'records',
        label: 'Registos totais',
        value: new Intl.NumberFormat('pt-PT').format(summary.measurementsTotal),
        delta: null,
        unit: '',
        hint:
          summary.measurements30d > 0
            ? `${summary.measurements30d} nos últimos 30 dias`
            : 'Sem avaliações nos últimos 30 dias',
        tone: undefined,
      },
    ];
  }, [summary]);

  const insightCards = React.useMemo(() => {
    const cards: Array<{
      key: string;
      label: string;
      value: string;
      hint?: string | null;
      tone?: 'positive' | 'warning';
    }> = [
      {
        key: 'cadence',
        label: 'Cadência média',
        value: summary.measurementFrequencyDays != null ? formatDays(summary.measurementFrequencyDays) : 'Sem dados',
        hint: summary.measurementFrequencyDays != null ? 'Intervalo médio entre avaliações' : 'Adiciona mais registos para calcular a cadência',
      },
      {
        key: 'streak',
        label: 'Dias sem avaliar',
        value: formatDays(summary.streakDays),
        hint:
          summary.latest?.measured_at
            ? `Última avaliação em ${formatDate(summary.latest.measured_at, { day: '2-digit', month: 'short' })}`
            : 'Ainda sem avaliações',
        tone:
          summary.measurementFrequencyDays && summary.streakDays
            ? summary.streakDays > summary.measurementFrequencyDays * 2
              ? 'warning'
              : undefined
            : undefined,
      },
      {
        key: 'total-change',
        label: 'Variação acumulada',
        value: summary.totalChangeWeight != null ? `${formatDelta(summary.totalChangeWeight, ' kg') ?? '—'}` : '—',
        hint:
          summary.earliest?.measured_at
            ? `Desde ${formatDate(summary.earliest.measured_at, { day: '2-digit', month: 'short', year: 'numeric' })}`
            : 'Ainda sem histórico completo',
        tone:
          summary.totalChangeWeight != null
            ? summary.totalChangeWeight < 0
              ? 'positive'
              : summary.totalChangeWeight > 0
              ? 'warning'
              : undefined
            : undefined,
      },
    ];

    if (summary.totalChangeBodyFat != null) {
      cards.push({
        key: 'fat-change',
        label: 'Δ % Gordura',
        value: formatDelta(summary.totalChangeBodyFat, ' pp') ?? '—',
        hint: summary.earliest?.measured_at ? `Do primeiro registo (${formatPercent(summary.earliest.body_fat_pct)})` : null,
        tone: summary.totalChangeBodyFat < 0 ? 'positive' : summary.totalChangeBodyFat > 0 ? 'warning' : undefined,
      });
    }

    return cards;
  }, [summary]);

  async function addMeasurement() {
    setFormError(null);
    const weight = parseNumberLike(form.weight);
    const height = parseNumberLike(form.height);
    const fat = parseNumberLike(form.fat);

    if (!weight && !height && !fat && !form.notes.trim()) {
      setFormError('Preenche pelo menos uma métrica ou uma nota antes de guardar.');
      return;
    }

    const payload = {
      measured_at: form.date,
      weight_kg: weight,
      height_cm: height,
      body_fat_pct: fat,
      bmi: calcBMI(weight, height),
      notes: form.notes || null,
    };

    setSaving(true);
    try {
      const response = await fetch('/api/client/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await response.json().catch(() => null)) as MetricsApiResponse | null;
      if (!response.ok || !json?.ok) {
        throw new Error(json?.message ?? 'Não foi possível guardar as métricas.');
      }
      const dataset = json.dataset ?? json.rows;
      setRows(dataset);
      setSummary(json.summary);
      setTimeline(json.timeline);
      setFallbackActive(json.source === 'fallback');
      setForm({
        date: new Date().toISOString().substring(0, 10),
        weight: '',
        height: '',
        fat: '',
        notes: '',
      });
      await refresh();
    } catch (error) {
      console.error(error);
      setFormError(error instanceof Error ? error.message : 'Não foi possível guardar as métricas.');
    } finally {
      setSaving(false);
    }
  }

  async function generateReport() {
    if (!rows.length) {
      window.alert('Adiciona pelo menos uma avaliação antes de exportar.');
      return;
    }

    setGenerating(true);
    try {
      const [{ jsPDF }, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const autoTable = (autoTableModule as { default?: (doc: any, options: any) => void }).default ??
        (autoTableModule as unknown as (doc: any, options: any) => void);
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const latest = rows[0];
      const createdAt = latest.measured_at ? new Date(latest.measured_at) : new Date();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Análise de composição corporal', 105, 18, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Emitido em: ${new Date().toLocaleString('pt-PT')}`, 20, 28);
      doc.text(`Última avaliação: ${formatDate(latest.measured_at)}`, 20, 34);

      const summaryY = 42;
      doc.text('Resumo da última avaliação', 20, summaryY, { baseline: 'top' });
      const bmiValue = latest.bmi ?? calcBMI(latest.weight_kg, latest.height_cm);
      const lines = [
        `Peso: ${formatKg(latest.weight_kg)}`,
        `Altura: ${latest.height_cm ?? '—'} cm`,
        `% Massa gorda: ${formatPercent(latest.body_fat_pct)}`,
        `IMC: ${formatBmi(bmiValue)}`,
      ];
      lines.forEach((line, index) => doc.text(line, 20, summaryY + 6 + index * 6));

      const trendText = summary.totalChangeWeight != null
        ? `Variação acumulada: ${formatDelta(summary.totalChangeWeight, ' kg') ?? '—'}`
        : 'Sem histórico suficiente para calcular a variação.';
      doc.text(trendText, 120, summaryY);
      if (summary.measurementFrequencyDays != null) {
        doc.text(`Cadência média: ${formatDays(summary.measurementFrequencyDays)}`, 120, summaryY + 6);
      }

      autoTable(doc, {
        startY: summaryY + 32,
        head: [['Data', 'Peso (kg)', 'Altura (cm)', '% Gordura', 'IMC', 'Notas']],
        body: rows.slice(0, 24).map((row) => [
          formatDate(row.measured_at),
          row.weight_kg != null ? row.weight_kg.toFixed(1) : '—',
          row.height_cm != null ? row.height_cm.toFixed(1) : '—',
          row.body_fat_pct != null ? row.body_fat_pct.toFixed(1) : '—',
          row.bmi != null ? row.bmi.toFixed(1) : calcBMI(row.weight_kg, row.height_cm) ?? '—',
          row.notes ?? '',
        ]),
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [38, 132, 255], textColor: 255 },
      });

      doc.save(`avaliacao-${createdAt.toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error(error);
      window.alert('Não foi possível gerar o relatório. Tenta novamente.');
    } finally {
      setGenerating(false);
    }
  }

  async function onImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const Papa = (await import('papaparse')).default;
      const text = await file.text();
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase(),
      }) as unknown as {
        data: Array<Record<string, unknown>>;
        errors: Array<{ message: string }>;
      };

      if (parsed.errors.length) {
        throw new Error(parsed.errors[0].message);
      }

      const mapped = (parsed.data || [])
        .map((row) => {
          const measured_at = (row['data'] ?? row['date'] ?? row['measured_at']) as string | undefined;
          const weight_kg = parseNumberLike(String(row['peso'] ?? row['weight'] ?? row['weight_kg'] ?? ''));
          const height_cm = parseNumberLike(String(row['altura'] ?? row['height'] ?? row['height_cm'] ?? ''));
          const body_fat_pct = parseNumberLike(
            String(row['percentual_gordura'] ?? row['bodyfat'] ?? row['body_fat_pct'] ?? row['%gordura'] ?? ''),
          );
          const bmi = parseNumberLike(String(row['imc'] ?? row['bmi'] ?? '')) ?? calcBMI(weight_kg, height_cm);
          const notes = typeof row['notas'] === 'string' ? row['notas'] : typeof row['notes'] === 'string' ? row['notes'] : null;

          if (!measured_at && weight_kg == null && height_cm == null && body_fat_pct == null && bmi == null && !notes) {
            return null;
          }

          return {
            measured_at,
            weight_kg,
            height_cm,
            body_fat_pct,
            bmi,
            notes,
          };
        })
        .filter((row): row is {
          measured_at: string | null;
          weight_kg: number | null;
          height_cm: number | null;
          body_fat_pct: number | null;
          bmi: number | null;
          notes: string | null;
        } => Boolean(row));

      if (!mapped.length) {
        window.alert('Não foram encontrados registos válidos no ficheiro.');
        return;
      }

      const response = await fetch('/api/client/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: mapped }),
      });
      const json = (await response.json().catch(() => null)) as MetricsApiResponse | null;
      if (!response.ok || !json?.ok) {
        throw new Error(json?.message ?? 'Não foi possível importar os dados.');
      }

      const dataset = json.dataset ?? json.rows;
      setRows(dataset);
      setSummary(json.summary);
      setTimeline(json.timeline);
      setFallbackActive(json.source === 'fallback');
      await refresh();
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : 'Erro ao processar o ficheiro da balança.');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  }

  const measurementCountLabel = React.useMemo(() => {
    const count = filteredRows.length;
    return `${count} ${count === 1 ? 'registo' : 'registos'}`;
  }, [filteredRows.length]);

  const chartUnit = React.useMemo(() => {
    switch (series) {
      case 'bodyFat':
        return '%';
      case 'bmi':
        return 'IMC';
      default:
        return 'kg';
    }
  }, [series]);

  return (
    <div className="client-metrics">
      <section className="neo-panel client-metrics__panel client-metrics__hero" aria-labelledby="client-metrics-hero-heading">
        <div className="client-metrics__heroHeader">
          <div>
            <span className="neo-surface__hint">Monitorização corporal</span>
            <h1 id="client-metrics-hero-heading" className="client-metrics__heroTitle">
              Evolução física
            </h1>
            <p className="client-metrics__heroSubtitle">
              Acompanha o progresso com dados reais provenientes do servidor e ajusta planos de treino e nutrição em tempo real.
            </p>
          </div>
          <div className="client-metrics__heroMeta">
            <span className="client-metrics__updatedAt">
              Última actualização: {formatDate(summary.lastUpdatedAt, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
            <Button variant="ghost" onClick={() => refresh()} loading={remoteLoading}>
              Actualizar
            </Button>
          </div>
        </div>
        {fallbackActive && (
          <Alert tone="warning" title="A mostrar dados de referência">
            Não foi possível ligar ao servidor. O painel apresenta um conjunto de exemplo até a ligação ser restabelecida.
          </Alert>
        )}
        {remoteError && (
          <Alert tone="danger" title="Erro ao sincronizar métricas">
            {remoteError.message}
          </Alert>
        )}
        <div className="client-metrics__heroGrid">
          {summaryCards.map((card) => (
            <div key={card.key} className="neo-surface client-metrics__heroCard" data-tone={card.tone}>
              <span className="neo-surface__hint">{card.label}</span>
              <span className="client-metrics__heroValue">{card.value}</span>
              {card.delta != null && (
                <span
                  className="client-metrics__heroDelta"
                  data-positive={card.tone === 'positive' ? 'true' : undefined}
                  data-warning={card.tone === 'warning' ? 'true' : undefined}
                >
                  {formatDelta(card.delta, card.unit)} vs. última
                </span>
              )}
              {card.hint && <span className="client-metrics__heroHint">{card.hint}</span>}
            </div>
          ))}
        </div>
      </section>

      <div className="client-metrics__layout">
        <section className="neo-panel client-metrics__panel client-metrics__chartPanel" aria-labelledby="client-metrics-chart-heading">
          <header className="client-metrics__sectionHeader">
            <div>
              <h2 id="client-metrics-chart-heading" className="client-metrics__sectionTitle">
                Progresso temporal
              </h2>
              <p className="client-metrics__sectionSubtitle">Selecciona a métrica e o período para analisar tendências e variações.</p>
            </div>
            <div className="client-metrics__toolbar">
              <div className="neo-segmented client-metrics__segmented" role="group" aria-label="Métrica representada no gráfico">
                {seriesOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="neo-segmented__btn"
                    data-active={series === option.value}
                    onClick={() => setSeries(option.value)}
                  >
                    {option.label}
                    <span className="neo-segmented__count">{option.hint}</span>
                  </button>
                ))}
              </div>
              <div className="neo-segmented client-metrics__segmented" role="group" aria-label="Intervalo temporal">
                {rangeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="neo-segmented__btn"
                    data-active={range === option.value}
                    onClick={() => setRange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </header>
          <div className="client-metrics__chart">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis
                    width={36}
                    tickFormatter={(value: number) => new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 }).format(value)}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--primary)', strokeDasharray: '4 2' }}
                    contentStyle={{
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value: number | null) => [
                      series === 'weight'
                        ? formatKg(value)
                        : series === 'bodyFat'
                        ? formatPercent(value)
                        : formatBmi(value),
                      optionLabel(series),
                    ]}
                    labelFormatter={(label) => label as string}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    fill="var(--primary-soft)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="neo-empty">
                <span className="neo-empty__icon" aria-hidden>
                  📈
                </span>
                <p className="neo-empty__title">Sem dados suficientes</p>
                <p className="neo-empty__description">Adiciona avaliações com peso ou % de gordura para activar o gráfico.</p>
              </div>
            )}
          </div>
          <span className="client-metrics__chartHint">Valores em {chartUnit}. Os dados são actualizados automaticamente a cada minuto.</span>
        </section>

        <section className="neo-panel client-metrics__panel client-metrics__formPanel" aria-labelledby="client-metrics-form-heading">
          <header className="client-metrics__sectionHeader">
            <div>
              <h2 id="client-metrics-form-heading" className="client-metrics__sectionTitle">
                Registar avaliação
              </h2>
              <p className="client-metrics__sectionSubtitle">Adiciona medições manuais ou importa a partir do ficheiro da balança.</p>
            </div>
          </header>
          {formError && (
            <Alert tone="danger" title="Não foi possível guardar">
              {formError}
            </Alert>
          )}
          <div className="client-metrics__formGrid" role="group" aria-labelledby="client-metrics-form-heading">
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Data</span>
              <input
                type="date"
                className="neo-input"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
            </label>
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Peso (kg)</span>
              <input
                type="number"
                inputMode="decimal"
                className="neo-input"
                value={form.weight}
                onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))}
              />
            </label>
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Altura (cm)</span>
              <input
                type="number"
                inputMode="decimal"
                className="neo-input"
                value={form.height}
                onChange={(event) => setForm((current) => ({ ...current, height: event.target.value }))}
              />
            </label>
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">% Massa gorda</span>
              <input
                type="number"
                inputMode="decimal"
                className="neo-input"
                value={form.fat}
                onChange={(event) => setForm((current) => ({ ...current, fat: event.target.value }))}
              />
            </label>
            <label className="neo-input-group__field client-metrics__notesField">
              <span className="neo-input-group__label">Notas</span>
              <textarea
                className="neo-input neo-input--textarea"
                rows={3}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>
          </div>
          <div className="client-metrics__formActions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              loading={importing}
            >
              Importar CSV
            </Button>
            <Button type="button" variant="ghost" onClick={generateReport} loading={generating} disabled={!rows.length}>
              Exportar PDF
            </Button>
            <Button type="button" onClick={addMeasurement} loading={saving}>
              Guardar avaliação
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onImportFile}
            className="sr-only"
          />
        </section>
      </div>

      <section className="neo-panel client-metrics__panel client-metrics__insights" aria-labelledby="client-metrics-insights-heading">
        <header className="client-metrics__sectionHeader">
          <div>
            <h2 id="client-metrics-insights-heading" className="client-metrics__sectionTitle">
              Insights rápidos
            </h2>
            <p className="client-metrics__sectionSubtitle">Identifica padrões de consistência, cadência e evolução acumulada.</p>
          </div>
        </header>
        <div className="client-metrics__insightGrid">
          {insightCards.map((card) => (
            <div key={card.key} className="neo-surface client-metrics__insightCard" data-tone={card.tone}>
              <span className="neo-surface__hint">{card.label}</span>
              <span className="client-metrics__insightValue">{card.value}</span>
              {card.hint && <span className="client-metrics__insightHint">{card.hint}</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="neo-panel client-metrics__panel client-metrics__history" aria-labelledby="client-metrics-history-heading">
        <header className="client-metrics__sectionHeader client-metrics__historyHeader">
          <div>
            <h2 id="client-metrics-history-heading" className="client-metrics__sectionTitle">
              Histórico de avaliações
            </h2>
            <p className="client-metrics__sectionSubtitle">Ordenado da mais recente para a mais antiga.</p>
          </div>
          <div className="client-metrics__historyControls">
            <label className="neo-input-group__field client-metrics__search">
              <span className="neo-input-group__label sr-only">Pesquisar histórico</span>
              <input
                type="search"
                className="neo-input"
                placeholder="Pesquisar por data, peso ou nota"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <span className="client-metrics__count">{measurementCountLabel}</span>
          </div>
        </header>
        <div className="neo-table-wrapper">
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Peso</th>
                <th scope="col">Altura</th>
                <th scope="col">% Gordura</th>
                <th scope="col">IMC</th>
                <th scope="col">Notas</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const bmiValue = row.bmi ?? calcBMI(row.weight_kg, row.height_cm);
                return (
                  <tr key={row.id}>
                    <td>{formatDate(row.measured_at)}</td>
                    <td>{formatKg(row.weight_kg)}</td>
                    <td>{row.height_cm != null ? `${row.height_cm.toFixed(1)} cm` : '—'}</td>
                    <td>{formatPercent(row.body_fat_pct)}</td>
                    <td>{formatBmi(bmiValue)}</td>
                    <td className="client-metrics__note">{row.notes ?? ''}</td>
                  </tr>
                );
              })}
              {!filteredRows.length && (
                <tr>
                  <td colSpan={6}>
                    <div className="neo-empty">
                      <span className="neo-empty__icon" aria-hidden>
                        📉
                      </span>
                      <p className="neo-empty__title">Sem registos correspondentes</p>
                      <p className="neo-empty__description">
                        Ajusta a pesquisa ou adiciona novas avaliações para acompanhar a evolução com detalhe.
                      </p>
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

function optionLabel(series: SeriesValue) {
  switch (series) {
    case 'bodyFat':
      return '% Massa gorda';
    case 'bmi':
      return 'IMC';
    default:
      return 'Peso';
  }
}
