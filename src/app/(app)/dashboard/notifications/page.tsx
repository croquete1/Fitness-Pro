'use client';
import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';

type Notif = {
  id: string;
  title?: string;
  body?: string | null;
  link?: string | null;
  created_at?: string;
  read?: boolean;
  type?: string | null;
};

export default function NotificationsCenterPage() {
  const [items, setItems] = React.useState<Notif[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/notifications/list', { cache: 'no-store' });
    const json = await res.json().catch(() => ({ items: [] as Notif[] }));
    setItems(json.items ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const visible = items.filter(n => filter === 'all' ? true : !n.read);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Notificações</h1>

      <div className="card" style={{ padding: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} aria-label="Filtro">
          <option value="all">Todas</option>
          <option value="unread">Por ler</option>
        </select>
        <button className="btn chip" onClick={load}>Atualizar</button>
        <button
          className="btn chip"
          onClick={async () => {
            await fetch('/api/notifications/mark-read', { method: 'POST' });
            load();
          }}
        >
          Marcar tudo como lido
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 12 }} className="text-muted small">A carregar…</div>
        ) : visible.length === 0 ? (
          <div style={{ padding: 12 }} className="text-muted small">Sem notificações.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {visible.map(n => (
              <li key={n.id} style={{ borderTop: '1px solid var(--border)' }}>
                <div style={{ padding: 10, display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{n.title ?? 'Notificação'}</div>
                    {!!n.body && <div className="text-muted small">{n.body}</div>}
                    {!!n.link && (
                      <div style={{ marginTop: 6 }}>
                        <Link href={(n.link as Route) ?? ('/dashboard' as Route)} className="btn chip">Abrir</Link>
                      </div>
                    )}
                  </div>
                  <div className="text-muted tiny" style={{ whiteSpace: 'nowrap' }}>
                    {n.created_at ? new Date(n.created_at).toLocaleString('pt-PT') : '—'}
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
