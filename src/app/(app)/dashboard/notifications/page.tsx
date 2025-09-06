export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

'use client';
import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';

type N = { id:string; title:string; body?:string; link?:string; read:boolean; created_at:string };

export default function NotificationsCenter() {
  const [items, setItems] = React.useState<N[]>([]);
  const [filter, setFilter] = React.useState<'all'|'unread'>('all');
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/notifications?filter=${filter}`, { cache: 'no-store' });
    const json = await res.json().catch(() => ({ items: [] as N[] }));
    setItems(json.items ?? []);
    setLoading(false);
  }, [filter]);

  React.useEffect(() => { load(); }, [load]);

  const markAll = async () => {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    load();
  };
  const markOne = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setItems((prev) => prev.map(i => i.id === id ? { ...i, read: true } : i));
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Centro de notificações</h1>

      <div className="card" style={{ padding: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <select value={filter} onChange={(e)=>setFilter(e.target.value as any)}>
          <option value="all">Todas</option>
          <option value="unread">Por ler</option>
        </select>
        <button className="btn chip" onClick={load} disabled={loading}>{loading ? 'A atualizar…' : 'Atualizar'}</button>
        <button className="btn chip" onClick={markAll}>Marcar tudo como lido</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {items.length === 0 ? (
          <div style={{ padding: 16, color: 'var(--muted)' }}>
            {loading ? 'A carregar…' : 'Sem notificações.'}
          </div>
        ) : (
          <ul style={{ listStyle:'none', margin:0, padding:0 }}>
            {items.map(n => (
              <li key={n.id} style={{ borderTop:'1px solid var(--border)' }}>
                <div style={{
                  display:'grid', gridTemplateColumns:'1fr auto', gap:8, padding:12,
                  background: n.read ? 'transparent' : 'var(--sidebar-hover)'
                }}>
                  <div>
                    <div style={{ fontWeight:700 }}>{n.title}</div>
                    {!!n.body && <div className="small text-muted">{n.body}</div>}
                    <div className="small text-muted">{new Date(n.created_at).toLocaleString('pt-PT')}</div>
                  </div>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    {!!n.link && <Link className="btn chip" href={n.link as Route}>Abrir</Link>}
                    {!n.read && <button className="btn chip" onClick={()=>markOne(n.id)}>Marcar lida</button>}
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
