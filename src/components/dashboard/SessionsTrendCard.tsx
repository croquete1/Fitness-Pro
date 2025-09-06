'use client';
import * as React from 'react';

type Scope = 'client' | 'pt' | 'admin';
type Point = { date: string; count: number };

export default function SessionsTrendCard({ scope, id }: { scope: Scope; id?: string }) {
  const [days, setDays] = React.useState<Point[]>([]);
  const [hours, setHours] = React.useState<Point[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const u7 = new URL('/api/metrics/sessions-7d', base);
      u7.searchParams.set('scope', scope);
      if (id) u7.searchParams.set('id', id);

      const u24 = new URL('/api/metrics/sessions-24h', base);
      u24.searchParams.set('scope', scope);
      if (id) u24.searchParams.set('id', id);

      try {
        const [a, b] = await Promise.all([fetch(u7.toString(), { cache: 'no-store' }), fetch(u24.toString(), { cache: 'no-store' })]);
        const j7 = await a.json().catch(() => ({ days: [] as Point[] }));
        const j24 = await b.json().catch(() => ({ hours: [] as Point[] }));
        if (!alive) return;
        setDays(j7.days ?? []);
        setHours(j24.hours ?? []);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [scope, id]);

  const max = React.useMemo(() => Math.max(1, ...days.map(d => d.count)), [days]);
  const total = React.useMemo(() => days.reduce((s, x) => s + x.count, 0), [days]);

  return (
    <div className="card" style={{ padding: 12, display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ margin: 0 }}>Tendência</h3>
        {!loading && <div className="text-muted small">7 dias · Total: {total}</div>}
      </div>

      {/* sparkline 24h */}
      {loading ? (
        <div className="text-muted small">A carregar…</div>
      ) : (
        <Sparkline24h points={hours} />
      )}

      {/* barras 7 dias */}
      {!loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${days.length || 7}, minmax(0,1fr))`,
            gap: 8,
            alignItems: 'end',
            height: 120,
          }}
        >
          {days.map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateRows: '1fr auto', gap: 6 }}>
              <div
                title={`${p.count} sessões`}
                style={{
                  height: `${(p.count / max) * 100}%`,
                  background: 'var(--primary)',
                  borderRadius: 8,
                  minHeight: 4,
                }}
              />
              <div className="text-muted tiny" style={{ textAlign: 'center' }}>
                {new Date(p.date).toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', '')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Sparkline24h({ points }: { points: Point[] }) {
  const width = 320, height = 60, pad = 4;
  const maxY = Math.max(1, ...points.map(p => p.count));
  const stepX = points.length > 1 ? (width - pad * 2) / (points.length - 1) : (width - pad * 2);

  const d = points.map((p, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - p.count / maxY) * (height - pad * 2);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="60" role="img" aria-label="Sessões nas últimas 24 horas">
      <path d={d || `M ${pad} ${height - pad} L ${width - pad} ${height - pad}`} fill="none" stroke="currentColor" opacity={0.6} />
    </svg>
  );
}
