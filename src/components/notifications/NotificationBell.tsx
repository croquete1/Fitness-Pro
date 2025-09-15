'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Row = {
  id: string;
  title: string | null;
  body: string | null;
  read: boolean | null;
  created_at: string | null;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyAll, setBusyAll] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const unread = useMemo(() => items.filter(i => !i.read).length, [items]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/list', { cache: 'no-store' });
      const json = await res.json();
      if (json?.ok && Array.isArray(json.items)) setItems(json.items);
    } finally {
      setLoading(false);
    }
  }

  async function markAll() {
    setBusyAll(true);
    try {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      const json = await res.json();
      if (json?.ok) {
        setItems(prev => prev.map(i => ({ ...i, read: true })));
      }
    } finally {
      setBusyAll(false);
    }
  }

  async function markOne(id: string) {
    // otimista
    setItems(prev => prev.map(i => (i.id === id ? { ...i, read: true } : i)));
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {
      // ignore best-effort
    }
  }

  // abre/fecha
  useEffect(() => {
    if (open) load();
  }, [open]);

  // pequeno polling (30s) se o dropdown estiver fechado, só para o “dot”
  useEffect(() => {
    let t: any;
    let active = true;

    async function poll() {
      try {
        const res = await fetch('/api/notifications/list', { cache: 'no-store' });
        const json = await res.json();
        if (active && json?.ok && Array.isArray(json.items)) setItems(json.items);
      } catch {}
      t = setTimeout(poll, 30000);
    }
    poll();
    return () => {
      active = false;
      if (t) clearTimeout(t);
    };
  }, []);

  // fechar ao clicar fora
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      if (!btnRef.current) return;
      const target = e.target as Node;
      const panel = document.getElementById('notif-panel');
      if (target && panel && !panel.contains(target) && !btnRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="relative rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10 transition"
        aria-label="Notificações"
      >
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center
                           h-4 min-w-[16px] rounded-full bg-rose-500 text-[10px] font-bold text-white px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notif-panel"
          className="absolute right-0 mt-2 w-[320px] max-h-[60vh] overflow-auto rounded-xl border border-black/10 dark:border-white/10
                     bg-white dark:bg-slate-900 shadow-xl p-2 z-50"
        >
          <div className="flex items-center justify-between px-1 py-1">
            <div className="text-sm font-semibold">Notificações</div>
            <button
              className="text-xs rounded-md border px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-60"
              onClick={markAll}
              disabled={busyAll || unread === 0}
            >
              {busyAll ? 'A marcar…' : 'Marcar todas como lidas'}
            </button>
          </div>

          {loading ? (
            <div className="p-3 text-sm opacity-70">A carregar…</div>
          ) : items.length === 0 ? (
            <div className="p-3 text-sm opacity-70">Sem notificações.</div>
          ) : (
            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {items.map((n) => (
                <li key={n.id} className="py-2 px-1 flex gap-2 items-start">
                  <div className={`mt-1 text-xs ${n.read ? 'opacity-40' : 'text-emerald-600'}`}>
                    {n.read ? '•' : '●'}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm ${n.read ? 'opacity-70' : 'font-semibold'}`}>
                      {n.title ?? 'Notificação'}
                    </div>
                    {n.body && <div className="text-xs opacity-80">{n.body}</div>}
                    <div className="text-[11px] opacity-60 mt-0.5">
                      {n.created_at ? new Date(n.created_at).toLocaleString('pt-PT') : ''}
                    </div>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markOne(n.id)}
                      className="text-[11px] rounded-md border px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      Lida
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
