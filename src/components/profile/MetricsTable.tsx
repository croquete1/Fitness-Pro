'use client';

import * as React from 'react';

type MetricPoint = {
  date: string;
  weight?: number | null;
  bodyfat_pct?: number | null;
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function MetricsTable({ points }: { points: MetricPoint[] }) {
  const rows = React.useMemo(() => [...points].reverse().slice(0, 30), [points]);

  return (
    <section className="neo-panel profile-metrics__table" aria-label="Registos antropométricos">
      <header className="neo-panel__header">
        <div>
          <h3 className="neo-panel__title">Registos recentes</h3>
          <p className="neo-panel__subtitle">
            Histórico das últimas medições sincronizadas.
          </p>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="neo-empty">
          <span className="neo-empty__icon" aria-hidden="true">
            📭
          </span>
          <p className="neo-empty__title">Sem registos</p>
          <p className="neo-empty__description">As medições serão apresentadas aqui após a primeira sincronização.</p>
        </div>
      ) : (
        <div className="neo-table-wrapper">
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Peso (kg)</th>
                <th scope="col">% Gordura</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.date}-${index}`}>
                  <td>{formatDate(row.date)}</td>
                  <td>{row.weight == null ? '—' : row.weight.toLocaleString('pt-PT', { maximumFractionDigits: 1 })}</td>
                  <td>{row.bodyfat_pct == null ? '—' : `${row.bodyfat_pct.toFixed(1)}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
