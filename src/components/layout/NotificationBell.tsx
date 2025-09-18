// src/components/NotificationsBell.tsx
'use client';

import * as React from 'react';

export default function NotificationsBell({
  unread = 0,
}: {
  unread?: number;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="rounded-md border border-slate-300 dark:border-slate-700 px-2.5 py-1.5"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Notificações"
      >
        🔔{unread > 0 ? <span className="ml-1 text-xs font-semibold">{unread}</span> : null}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-2"
        >
          <div className="text-sm text-slate-600 dark:text-slate-300 px-2 pb-2">
            Notificações recentes
          </div>
          <ul className="max-h-64 overflow-auto text-sm">
            <li className="px-2 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/70">
              Sem novas notificações.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
