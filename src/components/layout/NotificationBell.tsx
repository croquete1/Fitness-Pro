// src/components/layout/HeaderNotifications.tsx
'use client';
import { useEffect, useState } from 'react';

type Row = { id: string; title: string|null; body: string|null; link: string|null; created_at: string|null; read: boolean|null };

export default function HeaderNotifications(){
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Row[]|null>(null);

  useEffect(() => {
    if (!open || items) return;
    fetch('/api/notifications/recent').then(r => r.json()).then(d => setItems(d.items as Row[]));
  }, [open, items]);

  return (
    <div className="relative">
      <button className="btn icon" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(v => !v)} title="Notificações">
        <span className="sr-only">Notificações</span>
        🔔
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-[320px] rounded-xl border bg-white dark:bg-slate-900 shadow-2xl p-2 z-[100]">
          {!items && <div className="p-3 text-sm opacity-70">A carregar…</div>}
          {items?.length === 0 && <div className="p-3 text-sm opacity-70">Sem notificações recentes.</div>}
          {items?.map(n => (
            <a key={n.id} href={n.link ?? '#'} className="block rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800">
              <div className="text-sm font-medium">{n.title ?? 'Notificação'}</div>
              {!!n.body && <div className="text-xs opacity-80">{n.body}</div>}
              <div className="text-[11px] opacity-60 mt-1">{n.created_at ? new Date(n.created_at).toLocaleString('pt-PT') : '—'}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
