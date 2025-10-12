'use client';

import * as React from 'react';

type Stats = {
  counts?: { clients?: number; trainers?: number; admins?: number; sessions7d?: number };
  upcoming?: { when: string; title?: string }[]; // opcional
  notifications?: { unread?: number };
};

function Card(props: React.PropsWithChildren<{ title?: string; subtitle?: string }>) {
  return (
    <div className="card" style={{ padding: 12 }}>
      {props.title && (
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{props.title}</div>
      )}
      {props.subtitle && (
        <div className="small text-muted" style={{ marginBottom: 8 }}>{props.subtitle}</div>
      )}
      {props.children}
    </div>
  );
}

export default function LiveBanners() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStats = React.useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      setStats(data || {});
    } catch (e) {
      setError('Não foi possível carregar estatísticas.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStats();
    const t = setInterval(fetchStats, 30_000);
    return () => clearInterval(t);
  }, [fetchStats]);

  const c = stats?.counts ?? {};
  const unread = stats?.notifications?.unread ?? 0;

  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 280px' }}>
      {/* KPIs + tendência */}
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
          <Card title="Clientes">
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {loading ? '—' : (c.clients ?? 0)}
            </div>
          </Card>
          <Card title="Personal Trainers">
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {loading ? '—' : (c.trainers ?? 0)}
            </div>
          </Card>
          <Card title="Admins">
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {loading ? '—' : (c.admins ?? 0)}
            </div>
          </Card>
          <Card title="Sessões (próx. 7d)">
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {loading ? '—' : (c.sessions7d ?? 0)}
            </div>
          </Card>
        </div>

        <Card title="Tendência de sessões (7 dias)" subtitle="Atualizado em tempo real">
          {/* placeholder minimalista (evita dependências de chart) */}
          <div style={{ height: 140, display: 'grid', placeItems: 'center', color: 'var(--muted-fg)' }}>
            {loading ? 'A carregar…' : (error ? error : '— gráfico —')}
          </div>
        </Card>
      </div>

      {/* Lateral: próximas sessões + notificações */}
      <div style={{ display: 'grid', gap: 12 }}>
        <Card title="Próximas sessões">
          {loading ? (
            <div className="small text-muted">A carregar…</div>
          ) : (stats?.upcoming?.length ? (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
              {stats!.upcoming!.slice(0, 6).map((s, i) => (
                <li key={i} className="small">
                  <span className="chip" style={{ marginRight: 6 }}>{new Date(s.when).toLocaleString('pt-PT')}</span>
                  {s.title || 'Sessão'}
                </li>
              ))}
            </ul>
          ) : (
            <div className="small text-muted">Sem sessões marcadas</div>
          ))}
        </Card>

        <Card title="Notificações">
          <div style={{ fontSize: 28, fontWeight: 800 }}>{loading ? '—' : unread}</div>
          <div className="small text-muted">por ler</div>
        </Card>
      </div>
    </div>
  );
}
