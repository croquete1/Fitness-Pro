'use client';

import * as React from 'react';
import useSWR from 'swr';
import { usePathname, useRouter } from 'next/navigation';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Line,
  Legend,
} from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import type {
  SystemActivityRow,
  SystemDashboardData,
  SystemDistributionSegment,
  SystemHighlight,
  SystemHeroMetric,
  SystemTimelinePoint,
} from '@/lib/system/types';

type DashboardResponse = SystemDashboardData & { ok: true; source: 'supabase' | 'fallback' };

type Props = {
  initialData: DashboardResponse;
  initialRange: number;
};

const RANGE_OPTIONS = [
  { value: 7, label: '7 dias' },
  { value: 14, label: '14 dias' },
  { value: 30, label: '30 dias' },
  { value: 60, label: '60 dias' },
];

const numberFormatter = new Intl.NumberFormat('pt-PT');
const percentFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const currencyDetailedFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });

type ChartDatum = {
  iso: string;
  label: string;
  signups: number;
  sessions: number;
  completedSessions: number;
  notifications: number;
  revenue: number;
};

const chartFetcher = async ([, range]: [string, number]): Promise<DashboardResponse> => {
  const response = await fetch(`/api/system/metrics?range=${range}`, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => 'Não foi possível sincronizar as métricas.');
    throw new Error(message || 'Não foi possível sincronizar as métricas.');
  }
  const payload = (await response.json()) as DashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    throw new Error((payload as any)?.message ?? 'Não foi possível sincronizar as métricas.');
  }
  return payload as DashboardResponse;
};

function formatNumber(value: number): string {
  return numberFormatter.format(Math.round(value));
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%';
  return `${percentFormatter.format(value)}%`;
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return currencyFormatter.format(value);
}

function formatCurrencyDetailed(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return currencyDetailedFormatter.format(value);
}

function formatAxisCurrency(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0€';
  if (Math.abs(value) >= 1000) {
    const kilo = value / 1000;
    return `${percentFormatter.format(kilo)}k€`;
  }
  return `${currencyFormatter.format(value)}`;
}

type TooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{ value: number; dataKey: keyof ChartDatum; color: string; payload: ChartDatum }>;
};

function TimelineTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0]?.payload;
  return (
    <div className="system-metrics__tooltip">
      <p className="system-metrics__tooltipTitle">{label}</p>
      <dl className="system-metrics__tooltipList">
        <div>
          <dt>Utilizadores novos</dt>
          <dd>{formatNumber(datum?.signups ?? 0)}</dd>
        </div>
        <div>
          <dt>Sessões</dt>
          <dd>{formatNumber(datum?.sessions ?? 0)}</dd>
        </div>
        <div>
          <dt>Sessões concluídas</dt>
          <dd>{formatNumber(datum?.completedSessions ?? 0)}</dd>
        </div>
        <div>
          <dt>Notificações</dt>
          <dd>{formatNumber(datum?.notifications ?? 0)}</dd>
        </div>
        <div>
          <dt>Receita emitida</dt>
          <dd>{formatCurrencyDetailed(datum?.revenue ?? 0)}</dd>
        </div>
      </dl>
    </div>
  );
}

function HeroMetricCard({ metric }: { metric: SystemHeroMetric }) {
  return (
    <article className="neo-surface neo-surface--interactive system-metrics__hero" data-tone={metric.tone ?? 'neutral'}>
      <span className="system-metrics__heroLabel">{metric.label}</span>
      <span className="system-metrics__heroValue">{metric.value}</span>
      {metric.hint && <span className="system-metrics__heroHint">{metric.hint}</span>}
      {metric.trend && <span className="system-metrics__heroTrend">{metric.trend}</span>}
    </article>
  );
}

function DistributionList({ distribution }: { distribution: SystemDistributionSegment[] }) {
  if (!distribution.length || (distribution.length === 1 && distribution[0]?.key === 'empty')) {
    return (
      <div className="neo-surface neo-surface--padded system-metrics__empty" role="status">
        <span className="neo-text--sm neo-text--muted">Ainda não existem dados suficientes para calcular a distribuição.</span>
      </div>
    );
  }
  return (
    <ul className="system-metrics__distribution" role="list">
      {distribution.map((segment) => (
        <li key={segment.key} className="system-metrics__distributionItem" data-tone={segment.tone ?? 'neutral'}>
          <div className="system-metrics__distributionMeta">
            <span className="system-metrics__distributionLabel">{segment.label}</span>
            <span className="system-metrics__distributionValue">{formatNumber(segment.value)}</span>
          </div>
          <div className="system-metrics__distributionGauge">
            <div className="system-metrics__distributionBar" style={{ width: `${Math.min(100, Math.max(0, segment.percentage))}%` }} />
            <span className="system-metrics__distributionPercent">{formatPercent(segment.percentage)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function HighlightsList({ highlights }: { highlights: SystemHighlight[] }) {
  if (!highlights.length) {
    return (
      <div className="neo-surface neo-surface--padded system-metrics__empty" role="status">
        <span className="neo-text--sm neo-text--muted">Sem destaques gerados para o período seleccionado.</span>
      </div>
    );
  }
  return (
    <ul className="system-metrics__highlights" role="list">
      {highlights.map((highlight) => (
        <li key={highlight.id} className="neo-surface neo-surface--interactive system-metrics__highlight" data-tone={highlight.tone}>
          <div className="system-metrics__highlightHeader">
            <span className="system-metrics__highlightTitle">{highlight.title}</span>
            <span className="system-metrics__highlightValue">{highlight.value}</span>
          </div>
          <p className="system-metrics__highlightDescription">{highlight.description}</p>
          {highlight.meta && <span className="system-metrics__highlightMeta">{highlight.meta}</span>}
        </li>
      ))}
    </ul>
  );
}

function ActivityTable({ activity }: { activity: SystemActivityRow[] }) {
  if (!activity.length) {
    return (
      <div className="neo-surface neo-surface--padded system-metrics__empty" role="status">
        <span className="neo-text--sm neo-text--muted">Sem eventos registados nesta janela temporal.</span>
      </div>
    );
  }
  return (
    <div className="system-metrics__activity">
      <div className="table-responsive">
        <table className="table table--dense">
          <thead>
            <tr>
              <th scope="col">Evento</th>
              <th scope="col">Detalhes</th>
              <th scope="col">Quando</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((row) => (
              <tr key={row.id} data-tone={row.tone}>
                <td className="system-metrics__activityTitle">{row.title}</td>
                <td className="system-metrics__activityDetail">{row.detail ?? '—'}</td>
                <td className="system-metrics__activityTime">
                  {row.relative ?? (row.when ? dateFormatter.format(new Date(row.when)) : '—')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SystemMetricsClient({ initialData, initialRange }: Props) {
  const [range, setRange] = React.useState(initialRange);
  const router = useRouter();
  const pathname = usePathname();

  const { data, error, isValidating, mutate } = useSWR<DashboardResponse>(
    ['system-metrics', range],
    chartFetcher,
    {
      fallbackData: initialData,
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  const dashboard = data ?? initialData;
  const isFallback = dashboard.source === 'fallback';

  const hero = dashboard.hero ?? [];
  const distribution = dashboard.distribution ?? [];
  const highlights = dashboard.highlights ?? [];
  const activity = dashboard.activity ?? [];

  const timeline = React.useMemo<ChartDatum[]>(
    () =>
      (dashboard.timeline ?? []).map((point: SystemTimelinePoint) => ({
        iso: point.iso,
        label: point.label,
        signups: point.signups,
        sessions: point.sessions,
        completedSessions: point.completedSessions,
        notifications: point.notifications,
        revenue: point.revenue,
      })),
    [dashboard.timeline],
  );

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (range !== 14) {
      params.set('range', String(range));
    }
    const search = params.toString();
    router.replace(`${pathname}${search ? `?${search}` : ''}`, { scroll: false });
  }, [range, pathname, router]);

  const actions = (
    <div className="system-metrics__actions">
      <div className="neo-segmented system-metrics__segmented" role="group" aria-label="Intervalo temporal">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`neo-segmented__btn${range === option.value ? ' is-active' : ''}`}
            onClick={() => setRange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Button type="button" variant="ghost" onClick={() => mutate()} disabled={isValidating}>
        {isValidating ? 'A actualizar…' : 'Actualizar'}
      </Button>
    </div>
  );

  return (
    <div className="system-metrics neo-stack neo-stack--xl">
      <PageHeader
        title="Pulso operacional"
        subtitle="Acompanha adopção da plataforma, carga operacional e impacto nas receitas em tempo real."
        actions={actions}
      />

      {error && (
        <Alert tone="danger" title="Sincronização falhou">
          {error.message || 'Não foi possível carregar as métricas. Tenta novamente mais tarde.'}
        </Alert>
      )}

      <section className="system-metrics__overview" aria-labelledby="system-metrics-hero">
        <div className="system-metrics__overviewHeader">
          <div>
            <h2 id="system-metrics-hero" className="neo-panel__title">
              Indicadores de topo
            </h2>
            <p className="neo-panel__subtitle">Resumo imediato da utilização e estado financeiro.</p>
          </div>
          <span className="system-metrics__source" data-source={dashboard.source}>
            {isFallback ? 'Dados de demonstração' : 'Sincronizado via Supabase'}
          </span>
        </div>
        <div className="system-metrics__heroGrid">
          {hero.map((metric: SystemHeroMetric) => (
            <HeroMetricCard key={metric.key} metric={metric} />
          ))}
        </div>
      </section>

      <section className="neo-panel neo-stack neo-stack--lg system-metrics__panel" aria-labelledby="system-metrics-timeline">
        <div className="system-metrics__panelHeader">
          <div>
            <h2 id="system-metrics-timeline" className="neo-panel__title">
              Evolução diária
            </h2>
            <p className="neo-panel__subtitle">Comparação entre novos utilizadores, sessões confirmadas, notificações e receita.</p>
          </div>
          <span className="system-metrics__rangeLabel">{dashboard.range.label}</span>
        </div>
        {timeline.length === 0 ? (
          <div className="neo-surface neo-surface--padded system-metrics__empty" role="status">
            <span className="neo-text--sm neo-text--muted">Sem registos suficientes para gerar a linha temporal.</span>
          </div>
        ) : (
          <div className="system-metrics__chart">
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={timeline} margin={{ top: 10, right: 24, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--neo-chart-grid)" />
                <XAxis dataKey="label" tickLine={false} stroke="var(--neo-chart-axis)" />
                <YAxis
                  yAxisId="left"
                  allowDecimals={false}
                  tickLine={false}
                  stroke="var(--neo-chart-axis)"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={formatAxisCurrency}
                  tickLine={false}
                  stroke="var(--neo-chart-axis)"
                />
                <Tooltip content={<TimelineTooltip />} cursor={{ fill: 'var(--neo-chart-cursor)' }} />
                <Legend wrapperStyle={{ color: 'var(--neo-chart-axis)' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="sessions"
                  name="Sessões"
                  stroke="var(--neo-chart-primary)"
                  fill="var(--neo-chart-primary)"
                  strokeWidth={2}
                  fillOpacity={0.15}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="completedSessions"
                  name="Sessões concluídas"
                  stroke="var(--neo-chart-success)"
                  fill="var(--neo-chart-success)"
                  strokeWidth={2}
                  fillOpacity={0.1}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="signups"
                  name="Novos utilizadores"
                  stroke="var(--neo-chart-info)"
                  fill="var(--neo-chart-info)"
                  strokeWidth={2}
                  fillOpacity={0.1}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="notifications"
                  name="Notificações"
                  stroke="var(--neo-chart-warning)"
                  fill="var(--neo-chart-warning)"
                  strokeWidth={2}
                  fillOpacity={0.08}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Receita"
                  stroke="var(--neo-chart-pink)"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="system-metrics__layout">
        <section className="neo-panel neo-stack neo-stack--lg system-metrics__panel" aria-labelledby="system-metrics-distribution">
          <div className="system-metrics__panelHeader">
            <div>
              <h2 id="system-metrics-distribution" className="neo-panel__title">Distribuição de utilizadores</h2>
              <p className="neo-panel__subtitle">Repartição da base activa por perfil de acesso.</p>
            </div>
            <span className="system-metrics__total">{formatNumber(dashboard.totals.users)} utilizadores</span>
          </div>
          <DistributionList distribution={distribution} />
        </section>

        <section className="neo-panel neo-stack neo-stack--lg system-metrics__panel" aria-labelledby="system-metrics-highlights">
          <div className="system-metrics__panelHeader">
            <div>
              <h2 id="system-metrics-highlights" className="neo-panel__title">Destaques accionáveis</h2>
              <p className="neo-panel__subtitle">Toma decisões com base nas taxas de conclusão, entregabilidade e faturação.</p>
            </div>
          </div>
          <HighlightsList highlights={highlights} />
        </section>
      </div>

      <section className="neo-panel neo-stack neo-stack--lg system-metrics__panel" aria-labelledby="system-metrics-activity">
        <div className="system-metrics__panelHeader">
          <div>
            <h2 id="system-metrics-activity" className="neo-panel__title">Linha temporal de eventos</h2>
            <p className="neo-panel__subtitle">Eventos mais recentes que impactam clientes, treinadores e equipas administrativas.</p>
          </div>
          <span className="system-metrics__total">{formatNumber(activity.length)} registos</span>
        </div>
        <ActivityTable activity={activity} />
      </section>
    </div>
  );
}
