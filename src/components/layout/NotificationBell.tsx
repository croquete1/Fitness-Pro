'use client';

import React from 'react';

export default function NotificationBell() {
  const [count, setCount] = React.useState<number>(0);

  async function refresh() {
    try {
      const res = await fetch('/api/notifications/unread-count', { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      setCount(Number(json?.count ?? 0));
    } catch {
      // noop
    }
  }

  React.useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <button
      type="button"
      onClick={() => (window.location.href = '/dashboard/notifications')}
      className="relative inline-flex items-center justify-center rounded-full h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      aria-label="Notificações"
      title="Notificações"
    >
      <span className="text-lg">🔔</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 text-[10px] min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-600 text-white shadow">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
