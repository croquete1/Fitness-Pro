// src/components/notifications/NotificationMenu.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

type Row = {
  id: string;
  title: string | null;
  body: string | null;
  link: string | null;
  created_at: string | null;
  read: boolean | null;
};

export default function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      const pop = document.getElementById('notif-popover');
      if (btnRef.current?.contains(t) || pop?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener('mousedown', onOutside);
    return () => window.removeEventListener('mousedown', onOutside);
  }, [open]);

  async function load() {
    try {
      setBusy(true);
      setErr(null);
      const res = await fetch('/api/notifications/recent', { cache: 'no-store' });
      const json = await res.json().catch(() => ({ items: [] }));
      setItems(Array.isArray(json?.items) ? json.items : []);
    } catch (e: any) {
      setErr(e?.message || 'Falha a carregar.');
    } finally {
      setBusy(false);
    }
  }

  async function toggle() {
    const n = !open;
    setOpen(n);
    if (n) await load();
  }

  const unread = items.filter(i => !i.read).length;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        className="btn icon"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        title="Notificações"
      >
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2m6-6v-5a6 6 0 0 0-12 0v5l-2 2v1h16v-1z"/></svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-bold bg-rose-600 text-white rounded-full w-5 h-5">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div id="notif-popover" className="absolute right-0 mt-2 w-[360px] max-w-[92vw] card p-2" role="dialog" aria-label="Notificações" style={{ zIndex: 1000 }}>
          <div className="px-2 py-1 font-semibold text-sm">Notificações</div>
          <div className="border-t my-1" />
          {busy && <div className="px-2 py-4 text-sm"><span className="spinner" /> A carregar…</div>}
          {err && <div className="px-2 py-2 text-sm text-rose-600">Erro: {err}</div>}
          {!busy && !err && items.length === 0 && (
            <div className="px-2 py-3 text-sm text-slate-500">Sem notificações recentes.</div>
          )}
          <ul className="max-h-[60vh] overflow-auto">
            {items.map(n => (
              <li key={n.id} className="p-2 rounded-lg hover:bg-[var(--hover)]">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{n.title ?? 'Notificação'}</div>
                  <div className="text-xs opacity-70">
                    {n.created_at ? new Date(n.created_at).toLocaleString('pt-PT') : '—'}
                  </div>
                </div>
                {n.body && <div className="text-sm opacity-90">{n.body}</div>}
                {n.link && <a className="btn chip mt-2" href={n.link}>Abrir</a>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
