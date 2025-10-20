'use client';

import * as React from 'react';

type Point = {
  date: string;
  weight?: number | null;
};

type SeriesPoint = {
  date: string;
  weight: number;
};

function normalize(points: Point[]): SeriesPoint[] {
  return points
    .filter((point): point is { date: string; weight: number } => typeof point.weight === 'number')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function buildPath(series: SeriesPoint[], width: number, height: number, padding: number) {
  if (series.length < 2) return '';
  const min = Math.min(...series.map((point) => point.weight));
  const max = Math.max(...series.map((point) => point.weight));
  const range = max - min || 1;

  return series
    .map((point, index) => {
      const x = padding + (index * (width - padding * 2)) / (series.length - 1);
      const y = padding + (height - padding * 2) * (1 - (point.weight - min) / range);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function summarise(series: SeriesPoint[]) {
  if (!series.length) {
    return {
      start: null,
      end: null,
      delta: null,
    } as const;
  }
  const start = series[0];
  const end = series[series.length - 1];
  const delta = Number((end.weight - start.weight).toFixed(1));
  return { start, end, delta } as const;
}

export default function MetricsChart({ points }: { points: Point[] }) {
  const series = React.useMemo(() => normalize(points), [points]);
  const summary = React.useMemo(() => summarise(series), [series]);

  const width = 540;
  const height = 180;
  const padding = 16;
  const path = React.useMemo(() => buildPath(series, width, height, padding), [series]);

  return (
    <section className="neo-panel profile-metrics__chart" aria-label="Histórico de peso">
      <header className="neo-panel__header">
        <div>
          <h3 className="neo-panel__title">Histórico de peso</h3>
          <p className="neo-panel__subtitle">
            Evolução das medições confirmadas pelo cliente.
          </p>
        </div>
        {summary.delta != null && (
          <span
            className="profile-metrics__delta"
            data-tone={summary.delta === 0 ? 'neutral' : summary.delta < 0 ? 'positive' : 'warning'}
          >
            {summary.delta > 0 ? '+' : ''}
            {summary.delta} kg
          </span>
        )}
      </header>

      {series.length < 2 ? (
        <div className="neo-empty">
          <span className="neo-empty__icon" aria-hidden="true">
            📉
          </span>
          <p className="neo-empty__title">Dados insuficientes</p>
          <p className="neo-empty__description">
            Adiciona pelo menos duas medições para visualizar a tendência de peso.
          </p>
        </div>
      ) : (
        <figure className="profile-metrics__spark">
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfico da evolução de peso">
            <defs>
              <linearGradient id="profileWeightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--neo-chart-primary-strong)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--neo-chart-primary-light)" stopOpacity="0.04" />
              </linearGradient>
            </defs>
            <path
              d={`${path} L${width - padding},${height - padding} L${padding},${height - padding} Z`}
              fill="url(#profileWeightGradient)"
              opacity="0.6"
            />
            <path d={path} fill="none" stroke="var(--neo-chart-primary-strong)" strokeWidth="3" strokeLinecap="round" />
            {(() => {
              const minWeight = Math.min(...series.map((p) => p.weight));
              const maxWeight = Math.max(...series.map((p) => p.weight));
              const range = maxWeight - minWeight || 1;
              return series.map((point, index) => {
                const x = padding + (index * (width - padding * 2)) / (series.length - 1);
                const y = padding + (height - padding * 2) * (1 - (point.weight - minWeight) / range);
                return <circle key={point.date} cx={x} cy={y} r={4} className="profile-metrics__dot" />;
              });
            })()}
          </svg>
          <figcaption>
            {summary.start?.date ? (
              <>
                {new Intl.DateTimeFormat('pt-PT').format(new Date(summary.start.date))} ·{' '}
                {summary.start.weight.toFixed(1)} kg →{' '}
                {summary.end ? summary.end.weight.toFixed(1) : '—'} kg
              </>
            ) : (
              'Aguardando medições.'
            )}
          </figcaption>
        </figure>
      )}
    </section>
  );
}
