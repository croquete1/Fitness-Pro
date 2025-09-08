'use client';

import type { Route } from 'next';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import SignOutConfirmButton from '@/components/auth/SignOutConfirmButton';
import { registerPush, unregisterPush } from '@/lib/push-client';

/* =================== Utils =================== */
function timeLabel(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  try {
    return d.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso.replace('T', ' ').slice(0, 16);
  }
}

function useOutsideClick<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (ev: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(ev.target as Node)) onClose();
    };
    const esc = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [open, onClose]);
  return ref;
}

/* =================== Notificações =================== */
type HeaderNotif = {
  id: string;
  title?: string;
  body?: string | null;
  link?: string | null;
  createdAt?: string;
  read?: boolean;
};

function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<HeaderNotif[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Estado push
  const [pushReady, setPushReady] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window && Notification.permission === 'granted';
  });

  const fetchLatest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems((data?.notifications ?? []).slice(0, 10));
    } catch {
      setError('Não foi possível carregar as notificações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setInterval> | null = null;
    if (open) {
      fetchLatest();
      t = setInterval(fetchLatest, 60_000);
    }
    return () => { if (t) clearInterval(t); };
  }, [open, fetchLatest]);

  const close = useCallback(() => setOpen(false), []);
  const menuRef = useOutsideClick<HTMLDivElement>(open, close);
  const unreadCount = items.filter((n) => !n.read).length;

  function go(link?: string | null) {
    if (!link) return;
    close();
    router.push(link as Route);
  }

  async function onEnablePush() {
    try {
      const res = await registerPush();
      setPushReady(res.ok);
    } catch {
      setPushReady(false);
    }
  }
  async function onDisablePush() {
    try {
      await unregisterPush();
    } finally {
      setPushReady(false);
    }
  }

  return (
    <div className="notif-wrap" style={{ position: 'relative' }}>
      <button
        className="btn icon"
        aria-label="Notificações"
        title={pushReady ? 'Notificações ativas' : 'Ativar notificações'}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {pushReady ? '🔔' : '🔕'}
        {!!unreadCount && (
          <span
            aria-label={`${unreadCount} notificações por ler`}
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: 999,
              background: 'var(--danger)',
              border: '1px solid var(--sidebar-bg)',
            }}
          />
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Últimas notificações"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: 360,
            maxWidth: 'min(92vw, 360px)',
            background: 'var(--card-bg)',
            color: 'var(--fg)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: '0 12px 40px rgba(0,0,0,.18)',
            overflow: 'hidden',
            zIndex: 1000,
          }}
        >
          <div style={{ padding: 10, borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
            Notificações
          </div>

          {loading && <div style={{ padding: 16, fontSize: 13, color: 'var(--muted-fg)' }}>A carregar…</div>}
          {error && !loading && <div style={{ padding: 16, fontSize: 13, color: 'var(--danger)' }}>{error}</div>}
          {!loading && !error && items.length === 0 && (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--muted-fg)' }}>Sem novas notificações.</div>
          )}

          {!loading && !error && items.length > 0 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 360, overflow: 'auto' }}>
              {items.map((n) => (
                <li
                  key={n.id}
                  style={{
                    borderTop: '1px solid var(--border)',
                    background: n.read ? 'transparent' : 'var(--hover)',
                  }}
                >
                  <button
                    onClick={() => go(n.link ?? undefined)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 8,
                      width: '100%',
                      textAlign: 'left',
                      padding: 10,
                      background: 'transparent',
                      border: 0,
                      cursor: n.link ? 'pointer' : 'default',
                      color: 'inherit',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{n.title ?? 'Notificação'}</div>
                      {!!n.body && <div style={{ fontSize: 13, opacity: 0.9 }}>{n.body}</div>}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8, whiteSpace: 'nowrap' }}>{timeLabel(n.createdAt)}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: 8,
              borderTop: '1px solid var(--border)',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div className="small text-muted" style={{ opacity: 0.9 }}>
              Push: {pushReady ? 'ativo' : 'desligado'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!pushReady ? (
                <button className="btn chip" onClick={onEnablePush}>Ativar push</button>
              ) : (
                <button className="btn chip" onClick={onDisablePush}>Desativar push</button>
              )}
              <button className="btn chip" onClick={fetchLatest}>Atualizar</button>
              <button className="btn chip" onClick={() => setOpen(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =================== AppHeader =================== */

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Pesquisa
  const [q, setQ] = useState('');
  useEffect(() => {
    if (pathname?.startsWith('/dashboard/search')) {
      setQ(searchParams.get('q') ?? '');
    }
  }, [pathname, searchParams]);

  const onSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const value = q.trim();
      if (!value) return;
      router.push((`/dashboard/search?q=${encodeURIComponent(value)}` as Route));
    },
    [router, q]
  );

  // Tema
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  return (
    <header className="app-header">
      <div
        className="header-inner"
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'center', gap: 8 }}
      >
        {/* Pesquisa */}
        <form className="search" onSubmit={onSearch} role="search" aria-label="Pesquisar" style={{ display: 'flex', gap: 8 }}>
          <input
            id="global-search"
            className="search-input"
            type="search"
            placeholder="Pesquisar…"
            aria-label="Pesquisar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width: '100%' }}
          />
        </form>

        {/* Ações */}
        <div className="actions" style={{ display: 'inline-flex', gap: 8 }}>
          <button
            className="btn icon"
            aria-label="Alternar tema"
            title="Alternar tema"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'light' ? '🌞' : '🌙'}
          </button>

          <NotificationsBell />
          <SignOutConfirmButton />
        </div>
      </div>
    </header>
  );
}
