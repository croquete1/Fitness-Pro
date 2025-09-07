'use client';

import { useEffect, useState } from 'react';

export default function useUnreadNotifications() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const r = await fetch('/api/notifications/unread-count', { cache: 'no-store' });
        if (!r.ok) return;
        const j = (await r.json()) as { count?: number };
        if (active) setCount(Math.max(0, j?.count ?? 0));
      } catch {}
    };

    load();
    const iv = setInterval(load, 30_000);
    const onVis = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVis);

    return () => {
      active = false;
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return count;
}
