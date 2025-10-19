'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LandingSummary } from '@/lib/public/landing/types';
import { getFallbackLandingSummary } from '@/lib/fallback/auth-landing';

const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });

type TooltipPayload = {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: any }>;
};

function TimelineTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="neo-auth__chartTooltip" role="status">
      <p className="neo-auth__chartTooltipTitle">{point.label}</p>
      <dl className="neo-auth__chartTooltipList">
        <div>
          <dt>Clientes</dt>
          <dd>{numberFormatter.format(point.clients)}</dd>
        </div>
        <div>
          <dt>Sessões concluídas</dt>
          <dd>{numberFormatter.format(point.sessions)}</dd>
        </div>
        <div>
          <dt>Faturação</dt>
          <dd>{currencyFormatter.format(point.revenue)}</dd>
        </div>
      </dl>
    </div>
  );
}

type AuthNeoInsightsProps = {
  summary?: LandingSummary | null;
  loading?: boolean;
};

export function AuthNeoInsights({ summary, loading }: AuthNeoInsightsProps) {
  const fallback = React.useMemo(() => getFallbackLandingSummary(), []);
  const dataset = summary ?? fallback;
  const chartData = React.useMemo(
    () =>
      dataset.timeline.map((point) => ({
        ...point,
        revenue: Math.round(point.revenue),
      })),
    [dataset.timeline],
  );

  return (
    <section
      className="neo-auth-insights"
      data-fallback={dataset.source !== 'live'}
      aria-busy={loading}
      aria-live="polite"
    >
      <header className="neo-auth-insights__header">
        <p className="neo-auth-insights__eyebrow">Neo insights em tempo real</p>
        <h2 className="neo-auth-insights__title">Impacto da plataforma</h2>
        <p className="neo-auth-insights__meta">
          Atualizado em {new Date(dataset.generatedAt).toLocaleString('pt-PT')}
        </p>
      </header>

      <div className="neo-auth-insights__metrics" role="list">
        {dataset.metrics.map((metric) => (
          <article key={metric.id} className="neo-auth-insights__metric" data-tone={metric.tone ?? 'neutral'}>
            <span className="neo-auth-insights__metricLabel">{metric.label}</span>
            <strong className="neo-auth-insights__metricValue">{metric.value}</strong>
            {metric.hint ? <span className="neo-auth-insights__metricHint">{metric.hint}</span> : null}
            {metric.trend ? <span className="neo-auth-insights__metricTrend">{metric.trend}</span> : null}
          </article>
        ))}
      </div>

      <div className="neo-auth-insights__chart" role="figure" aria-label="Tendência semanal de clientes, sessões e faturação">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="neoAuthSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--neo-auth-chart-sessions)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--neo-auth-chart-sessions)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="neoAuthRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--neo-auth-chart-revenue)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--neo-auth-chart-revenue)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-auth-chart-grid)" />
            <XAxis dataKey="bucket" tickFormatter={(value: string) => value.slice(5)} tickLine={false} stroke="var(--neo-auth-chart-axis)" />
            <YAxis yAxisId="sessions" orientation="left" stroke="var(--neo-auth-chart-axis)" tickFormatter={(value: number) => numberFormatter.format(value)} />
            <YAxis yAxisId="revenue" orientation="right" stroke="var(--neo-auth-chart-axis)" tickFormatter={(value: number) => currencyFormatter.format(value)} />
            <Tooltip content={<TimelineTooltip />} cursor={{ strokeDasharray: '4 4', stroke: 'var(--neo-auth-chart-grid)' }} />
            <Area
              yAxisId="sessions"
              type="monotone"
              dataKey="sessions"
              stroke="var(--neo-auth-chart-sessions)"
              fill="url(#neoAuthSessions)"
              strokeWidth={2}
            />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="var(--neo-auth-chart-revenue)"
              fill="url(#neoAuthRevenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="neo-auth-insights__grid">
        <section className="neo-auth-insights__panel" aria-labelledby="neo-auth-highlights">
          <header className="neo-auth-insights__panelHeader">
            <h3 id="neo-auth-highlights">Highlights operacionais</h3>
            <p>Indicadores chave para entrar todos alinhados.</p>
          </header>
          <ul className="neo-auth-insights__highlightList" role="list">
            {dataset.highlights.map((highlight) => (
              <li key={highlight.id} className="neo-auth-insights__highlight" data-tone={highlight.tone ?? 'informative'}>
                <div>
                  <p className="neo-auth-insights__highlightTitle">{highlight.title}</p>
                  <p className="neo-auth-insights__highlightDescription">{highlight.description}</p>
                </div>
                {highlight.meta ? <span className="neo-auth-insights__highlightMeta">{highlight.meta}</span> : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="neo-auth-insights__panel" aria-labelledby="neo-auth-activity">
          <header className="neo-auth-insights__panelHeader">
            <h3 id="neo-auth-activity">Atividade em destaque</h3>
            <p>Últimos movimentos que mostram a plataforma em ação.</p>
          </header>
          <ol className="neo-auth-insights__activity" role="list">
            {dataset.activities.map((activity) => (
              <li key={activity.id} className="neo-auth-insights__activityItem" data-tone={activity.tone ?? 'neutral'}>
                <div className="neo-auth-insights__activityMeta">
                  <span className="neo-auth-insights__activityDot" aria-hidden />
                  <span className="neo-auth-insights__activityTime">{activity.relativeTime}</span>
                </div>
                <div className="neo-auth-insights__activityContent">
                  <p className="neo-auth-insights__activityTitle">{activity.title}</p>
                  <p className="neo-auth-insights__activityDescription">{activity.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </section>
  );
}
