// src/app/(app)/dashboard/notifications/ui/NotificationsClient.tsx
'use client';

import type { Route } from 'next';
import Link from 'next/link';
import React from 'react';

type Item = { id: string; title: string; body?: string|null; href?: string|null; createdAt: string; read: boolean };

export default function NotificationsClient({
  initialItems, total, page, pageSize, status,
}: {
  initialItems: Item[];
  total: number;
  page: number;
  pageSize: number;
  status: 'all'|'unread'|'read';
}) {
  const [items, setItems] = React.useState<Item[]>(initialItems);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [busy, setBusy] = React.useState<'mark'|'clear'|null>(null);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  async function markRead(ids: string[]) {
    if (!ids.length) return;
    setBusy('mark');
    const res = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    setBusy(null);
    if (!res.ok) return; // opcional: toast
    setItems((list) => list.map((i) => (ids.includes(i.id) ? { ...i, read: true } : i)));
    setSelected(new Set());
  }

  async function markAll() {
    setBusy('clear');
    const res = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ all: true, status }),
    });
    setBusy(null);
    if (!res.ok) return;
    setItems((list) => list.map((i) => ({ ...i, read: true })));
    setSelected(new Set());
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageHref = (p: number) => (`/dashboard/notifications?status=${status}&page=${p}` as Route);

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn chip" disabled={selected.size === 0 || !!busy} onClick={() => markRead([...selected])}>
          {busy === 'mark' ? 'A marcar…' : `Marcar lidas (${selected.size})`}
        </button>
        <button className="btn chip" disabled={!!busy} onClick={markAll}>
          {busy === 'clear' ? 'A limpar…' : 'Marcar todas como lidas'}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-muted small">Sem notificações para mostrar.</div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
          {items.map((n) => (
            <li key={n.id} className="card" style={{ padding: 10, borderRadius: 12, border: '1px solid var(--border)', background: n.read ? 'var(--card)' : 'var(--sidebar-active)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  aria-label="Selecionar"
                  checked={selected.has(n.id)}
                  onChange={() => toggle(n.id)}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>{n.title}</div>
                  {!!n.body && <div className="small text-muted">{n.body}</div>}
                  <div className="small text-muted">{new Date(n.createdAt).toLocaleString('pt-PT')}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {n.href && (
                    <Link className="btn chip" href={n.href as Route} prefetch>
                      Abrir
                    </Link>
                  )}
                  {!n.read && (
                    <button className="btn chip" onClick={() => markRead([n.id])}>
                      Marcar lida
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* paginação simples */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link className="btn chip" href={pageHref(Math.max(1, page - 1))} prefetch>←</Link>
          <div className="small text-muted">Página {page} de {totalPages}</div>
          <Link className="btn chip" href={pageHref(Math.min(totalPages, page + 1))} prefetch>→</Link>
        </div>
      )}
    </div>
  );
}
