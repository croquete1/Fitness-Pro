'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';

type Row = { id: string; title?: string; body?: string | null; created_at?: string; read?: boolean; link?: string | null };

// simples fetch (ajusta para a tua rota real)
async function load() {
  const res = await fetch('/api/notifications/list', { cache: 'no-store' });
  if (!res.ok) return [] as Row[];
  return (await res.json()) as Row[];
}

export default function NotificationsClient() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    load().then(setRows).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Notificações</h1>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn chip" onClick={() => { setLoading(true); load().then(setRows).finally(() => setLoading(false)); }}>
            Atualizar
          </button>
          <Link className="btn chip" href={'/dashboard' as Route}>Voltar à dashboard</Link>
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        {loading ? (
          <div className="text-muted small">A carregar…</div>
        ) : rows.length === 0 ? (
          <div className="text-muted small">Sem notificações.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {rows.map((n) => (
              <li key={n.id} style={{ borderTop: '1px solid var(--border)' }}>
                <div style={{ padding: 10, display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{n.title || 'Notificação'}</div>
                    {n.body && <div className="text-muted small">{n.body}</div>}
                  </div>
                  <div className="text-muted small" style={{ whiteSpace: 'nowrap' }}>
                    {n.created_at ? new Date(n.created_at).toLocaleString('pt-PT') : ''}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
