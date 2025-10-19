'use client';

import * as React from 'react';
import useSWR from 'swr';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import {
  type AuditLogActivityRow,
  type AuditLogDashboardResponse,
  type AuditLogDistributionSegment,
  type AuditLogHighlight,
  type AuditLogHeroMetric,
  type AuditLogTimelinePoint,
} from '@/lib/system/logs/types';

const RANGE_OPTIONS = [
  { value: 7, label: '7 dias' },
  { value: 14, label: '14 dias' },
  { value: 30, label: '30 dias' },
  { value: 60, label: '60 dias' },
  { value: 90, label: '90 dias' },
] as const;

type FetchKey = [string, number];

type Props = {
  initialData: AuditLogDashboardResponse;
  initialRange: number;
};

const numberFormatter = new Intl.NumberFormat('pt-PT');
const percentFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return numberFormatter.format(Math.round(value));
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0%';
  return `${percentFormatter.format(value * 100)}%`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateTimeFormatter.format(date);
}

function formatRelative(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const thresholds: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit; size: number }> = [
    { limit: 60_000, unit: 'second', size: 1_000 },
    { limit: 3_600_000, unit: 'minute', size: 60_000 },
    { limit: 86_400_000, unit: 'hour', size: 3_600_000 },
    { limit: 604_800_000, unit: 'day', size: 86_400_000 },
    { limit: 2_629_746_000, unit: 'week', size: 604_800_000 },
    { limit: 31_556_952_000, unit: 'month', size: 2_629_746_000 },
    { limit: Infinity, unit: 'year', size: 31_556_952_000 },
  ];
  const bucket = thresholds.find((item) => absMs < item.limit) ?? thresholds[thresholds.length - 1];
  const valueRounded = Math.round(diffMs / bucket.size);
  return relativeFormatter.format(valueRounded, bucket.unit);
}

const fetcher = async ([, range]: FetchKey): Promise<AuditLogDashboardResponse> => {
  const response = await fetch(`/api/system/logs/dashboard?range=${range}`, { credentials: 'include' });
  if (!response.ok) {
    const text = await response.text().catch(() => 'Não foi possível sincronizar os registos.');
    throw new Error(text || 'Não foi possível sincronizar os registos.');
  }
  const payload = (await response.json()) as AuditLogDashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    throw new Error((payload as any)?.message ?? 'Não foi possível sincronizar os registos.');
  }
  return payload as AuditLogDashboardResponse;
};

type TimelineTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{ payload: AuditLogTimelinePoint; value: number; dataKey: keyof AuditLogTimelinePoint; color: string }>;
};

function TimelineTooltip({ active, label, payload }: TimelineTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0]?.payload;
  return (
    <div className="system-logs-dashboard__tooltip">
      <p className="system-logs-dashboard__tooltipTitle">{label}</p>
      <dl className="system-logs-dashboard__tooltipList">
        <div>
          <dt>Eventos de segurança</dt>
          <dd>{formatNumber(datum?.security ?? 0)}</dd>
        </div>
        <div>
          <dt>Alterações operacionais</dt>
          <dd>{formatNumber(datum?.operations ?? 0)}</dd>
        </div>
        <div>
          <dt>Conteúdo/comunicações</dt>
          <dd>{formatNumber(datum?.content ?? 0)}</dd>
        </div>
        <div>
          <dt>Logins</dt>
          <dd>{formatNumber(datum?.logins ?? 0)}</dd>
        </div>
        <div>
          <dt>Falhas</dt>
          <dd>{formatNumber(datum?.failures ?? 0)}</dd>
        </div>
      </dl>
    </div>
  );
}

function HeroMetrics({ metrics }: { metrics: AuditLogHeroMetric[] }) {
  return (
    <div className="system-logs-dashboard__hero" role="list">
      {metrics.map((metric) => (
        <article
          key={metric.key}
          className="system-logs-dashboard__heroCard"
          data-tone={metric.tone ?? 'neutral'}
        >
          <span className="system-logs-dashboard__heroLabel">{metric.label}</span>
          <strong className="system-logs-dashboard__heroValue">{metric.value}</strong>
          {metric.hint ? <span className="system-logs-dashboard__heroHint">{metric.hint}</span> : null}
          {metric.trend ? <span className="system-logs-dashboard__heroTrend">{metric.trend}</span> : null}
        </article>
      ))}
    </div>
  );
}

function DistributionList({ distribution }: { distribution: AuditLogDistributionSegment[] }) {
  if (!distribution.length || (distribution.length === 1 && distribution[0]?.key === 'empty')) {
    return (
      <div className="system-logs-dashboard__empty" role="status">
        <span className="neo-text--sm neo-text--muted">Sem dados suficientes para apresentar a distribuição.</span>
      </div>
    );
  }
  return (
    <ul className="system-logs-dashboard__distribution" role="list">
      {distribution.map((segment) => (
        <li
          key={segment.key}
          className="system-logs-dashboard__distributionItem"
          data-tone={segment.tone ?? 'neutral'}
        >
          <div className="system-logs-dashboard__distributionHeader">
            <span className="system-logs-dashboard__distributionLabel">{segment.label}</span>
            <span className="system-logs-dashboard__distributionValue">{formatNumber(segment.value)}</span>
          </div>
          <div className="system-logs-dashboard__distributionBar" role="presentation">
            <div
              className="system-logs-dashboard__distributionFill"
              style={{ width: `${Math.min(100, Math.max(0, segment.percentage * 100))}%` }}
            />
            <span className="system-logs-dashboard__distributionPercent">{formatPercent(segment.percentage)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function HighlightsList({ highlights }: { highlights: AuditLogHighlight[] }) {
  if (!highlights.length) {
    return (
      <div className="system-logs-dashboard__empty" role="status">
        <span className="neo-text--sm neo-text--muted">Sem destaques para o intervalo seleccionado.</span>
      </div>
    );
  }
  return (
    <ul className="system-logs-dashboard__highlights" role="list">
      {highlights.map((highlight) => (
        <li key={highlight.id} className="system-logs-dashboard__highlight" data-tone={highlight.tone}>
          <div className="system-logs-dashboard__highlightHeader">
            <span className="system-logs-dashboard__highlightTitle">{highlight.title}</span>
            <span className="system-logs-dashboard__highlightValue">{highlight.value}</span>
          </div>
          <p className="system-logs-dashboard__highlightDescription">{highlight.description}</p>
          {highlight.meta ? <span className="system-logs-dashboard__highlightMeta">{highlight.meta}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function ActivityTable({ activity }: { activity: AuditLogActivityRow[] }) {
  if (!activity.length) {
    return (
      <div className="system-logs-dashboard__empty" role="status">
        <span className="neo-text--sm neo-text--muted">Sem eventos registados para apresentar.</span>
      </div>
    );
  }
  return (
    <div className="system-logs-dashboard__tableWrapper">
      <table className="system-logs-dashboard__table">
        <thead>
          <tr>
            <th>Quando</th>
            <th>Categoria</th>
            <th>Ação</th>
            <th>Actor</th>
            <th>Alvo</th>
            <th>Detalhes</th>
            <th>Origem</th>
          </tr>
        </thead>
        <tbody>
          {activity.map((row) => (
            <tr key={row.id}>
              <td>
                <div className="system-logs-dashboard__tableTime">{formatDateTime(row.createdAt)}</div>
                <span className="system-logs-dashboard__tableRelative">{formatRelative(row.createdAt)}</span>
              </td>
              <td>{row.category ?? '—'}</td>
              <td>{row.action ?? '—'}</td>
              <td>{row.actor ?? '—'}</td>
              <td>{row.target ?? '—'}</td>
              <td>{row.description ?? '—'}</td>
              <td>{row.ip ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AuditLogsClient({ initialData, initialRange }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [range, setRange] = React.useState(initialRange);

  React.useEffect(() => {
    setRange(initialRange);
  }, [initialRange]);

  const { data, error, mutate, isValidating } = useSWR<AuditLogDashboardResponse>(
    ['system-logs-dashboard', range],
    fetcher,
    { fallbackData: initialData, keepPreviousData: true },
  );

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (range === 14) {
      params.delete('range');
    } else {
      params.set('range', String(range));
    }
    const nextSearch = params.toString();
    router.replace(`${pathname}${nextSearch ? `?${nextSearch}` : ''}`, { scroll: false });
  }, [range, pathname, router, searchParams]);

  const dashboard = data ?? initialData;
  const isFallback = dashboard.source === 'fallback';

  const timeline = dashboard.timeline;
  const distribution = dashboard.distribution;
  const highlights = dashboard.highlights;
  const activity = dashboard.activity;

  const actions = (
    <div className="system-logs-dashboard__actions">
      <div className="neo-segmented system-logs-dashboard__segmented" role="group" aria-label="Intervalo temporal">
        {RANGE_OPTIONS.map((option) => {
          const active = range === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className="neo-segmented__btn"
              data-active={active}
              aria-pressed={active}
              onClick={() => setRange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <Button type="button" variant="ghost" onClick={() => mutate()} disabled={isValidating}>
        {isValidating ? 'A actualizar…' : 'Actualizar'}
      </Button>
    </div>
  );

  return (
    <div className="system-logs-dashboard neo-stack neo-stack--xl">
      <PageHeader
        title="Auditoria do sistema"
        subtitle="Acompanha logins, alterações privilegiadas e alertas de segurança num só painel."
        actions={actions}
      />

      {error && (
        <Alert tone="danger" title="Sincronização falhou">
          {error.message || 'Não foi possível carregar os registos de auditoria. Tenta novamente mais tarde.'}
        </Alert>
      )}

      <section className="system-logs-dashboard__section" aria-labelledby="system-logs-hero">
        <div className="system-logs-dashboard__sectionHeader">
          <div>
            <h2 id="system-logs-hero" className="neo-panel__title">Indicadores principais</h2>
            <p className="neo-panel__subtitle">
              Volume de eventos, actores envolvidos e alertas de segurança no período seleccionado.
            </p>
          </div>
          <span className="system-logs-dashboard__source" data-source={dashboard.source}>
            {isFallback ? 'Dados de demonstração' : 'Sincronizado via Supabase'}
          </span>
        </div>
        <HeroMetrics metrics={dashboard.hero as AuditLogHeroMetric[]} />
      </section>

      <section className="neo-panel neo-stack neo-stack--lg system-logs-dashboard__panel" aria-labelledby="system-logs-timeline">
        <div className="system-logs-dashboard__panelHeader">
          <div>
            <h2 id="system-logs-timeline" className="neo-panel__title">Linha temporal de eventos</h2>
            <p className="neo-panel__subtitle">
              Evolução diária das operações críticas, logins e falhas de autenticação.
            </p>
          </div>
        </div>
        {timeline.length === 0 ? (
          <div className="system-logs-dashboard__empty" role="status">
            <span className="neo-text--sm neo-text--muted">Sem registos suficientes para gerar a linha temporal.</span>
          </div>
        ) : (
          <div className="system-logs-dashboard__chart">
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={timeline} margin={{ top: 10, right: 24, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--neo-chart-grid)" />
                <XAxis dataKey="label" tickLine={false} stroke="var(--neo-chart-axis)" />
                <YAxis allowDecimals={false} tickLine={false} stroke="var(--neo-chart-axis)" />
                <Tooltip content={<TimelineTooltip />} cursor={{ fill: 'var(--neo-chart-cursor)' }} />
                <Legend wrapperStyle={{ color: 'var(--neo-chart-axis)' }} />
                <Area
                  type="monotone"
                  dataKey="security"
                  name="Segurança"
                  stroke="var(--neo-chart-danger)"
                  fill="var(--neo-chart-danger)"
                  strokeWidth={2}
                  fillOpacity={0.14}
                />
                <Area
                  type="monotone"
                  dataKey="operations"
                  name="Operações"
                  stroke="var(--neo-chart-primary)"
                  fill="var(--neo-chart-primary)"
                  strokeWidth={2}
                  fillOpacity={0.12}
                />
                <Area
                  type="monotone"
                  dataKey="content"
                  name="Conteúdo"
                  stroke="var(--neo-chart-info)"
                  fill="var(--neo-chart-info)"
                  strokeWidth={2}
                  fillOpacity={0.1}
                />
                <Line
                  type="monotone"
                  dataKey="logins"
                  name="Logins"
                  stroke="var(--neo-chart-success)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="failures"
                  name="Falhas"
                  stroke="var(--neo-chart-warning)"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="system-logs-dashboard__grid">
        <section
          className="neo-panel neo-stack neo-stack--lg system-logs-dashboard__panel"
          aria-labelledby="system-logs-distribution"
        >
          <div className="system-logs-dashboard__panelHeader">
            <div>
              <h2 id="system-logs-distribution" className="neo-panel__title">Distribuição por categoria</h2>
              <p className="neo-panel__subtitle">
                Principais famílias de eventos registadas durante o intervalo.
              </p>
            </div>
            <span className="system-logs-dashboard__total">
              {formatNumber(dashboard.summary.totalEvents)} eventos
            </span>
          </div>
          <DistributionList distribution={distribution} />
        </section>

        <section
          className="neo-panel neo-stack neo-stack--lg system-logs-dashboard__panel"
          aria-labelledby="system-logs-highlights"
        >
          <div className="system-logs-dashboard__panelHeader">
            <div>
              <h2 id="system-logs-highlights" className="neo-panel__title">Destaques accionáveis</h2>
              <p className="neo-panel__subtitle">Alertas rápidos sobre autenticação, actividade e recursos tocados.</p>
            </div>
          </div>
          <HighlightsList highlights={highlights} />
        </section>
      </div>

      <section
        className="neo-panel neo-stack neo-stack--lg system-logs-dashboard__panel"
        aria-labelledby="system-logs-activity"
      >
        <div className="system-logs-dashboard__panelHeader">
          <div>
            <h2 id="system-logs-activity" className="neo-panel__title">Eventos recentes</h2>
            <p className="neo-panel__subtitle">
              Linha temporal detalhada com as últimas acções registadas na plataforma.
            </p>
          </div>
          <span className="system-logs-dashboard__total">{formatNumber(activity.length)} registos</span>
        </div>
        <ActivityTable activity={activity} />
      </section>
    </div>
  );
}
