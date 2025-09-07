// src/app/(app)/dashboard/notifications/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

type Item = {
  id: string;
  title?: string;
  body?: string | null;
  link?: string | null;
  created_at?: string | null;
  read?: boolean | null;
};

function timeLabel(iso?: string | null) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString('pt-PT'); } catch { return iso || ''; }
}

export default function NotificationsCenter() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [onlyUnread, setOnlyUnread] = React.useState(false);
  const router = useRouter();

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/notifications/list', { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    setItems(Array.isArray(data.items) ? data.items : []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const markAll = async () => {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    await load();
  };

  const view = onlyUnread ? items.filter(i => !i.read) : items;

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Centro de notificações</h1>

      <div className="card" style={{ padding: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} />
          Mostrar apenas por ler
        </label>
        <button className="btn chip" onClick={markAll}>Marcar tudo como lido</button>
        <button className="btn chip" onClick={load}>Atualizar</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 16, color: 'var(--muted)' }}>A carregar…</div>
        ) : view.length === 0 ? (
          <div style={{ padding: 16, color: 'var(--muted)' }}>Sem notificações.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {view.map((n) => (
              <li key={n.id} style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => { if (n.link) router.push(n.link as any); }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 8,
                    width: '100%',
                    textAlign: 'left',
                    padding: 12,
                    background: n.read ? 'transparent' : 'var(--hover)',
                    border: 0,
                    cursor: n.link ? 'pointer' : 'default'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{n.title || 'Notificação'}</div>
                    {!!n.body && <div className="small text-muted">{n.body}</div>}
                  </div>
                  <div className="small text-muted" style={{ whiteSpace: 'nowrap' }}>{timeLabel(n.created_at)}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
