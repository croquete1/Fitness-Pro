// src/components/layout/AppHeader.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import SignOutConfirmButton from '@/components/auth/SignOutConfirmButton';

type HeaderNotif = {
  id: string;
  title?: string;
  body?: string | null;
  link?: string | null;
  createdAt?: string; // ISO
  read?: boolean;
};

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

function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<HeaderNotif[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Usa o teu endpoint existente de stats — devolve notificações por role/sessão
      const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: HeaderNotif[] = (data?.notifications ?? []).slice(0, 10);
      setItems(list);
    } catch (e: any) {
      setError('Não foi possível carregar as notificações.');
    } finally {
      setLoading(false);
    }
  }, []);

  // abre -> carrega; também faz refresh de 60 em 60s enquanto aberto
  useEffect(() => {
    let t: any;
    if (open) {
      fetchLatest();
      t = setInterval(fetchLatest, 60_000);
    }
    return () => t && clearInterval(t);
  }, [open, fetchLatest]);

  const close = useCallback(() => setOpen(false), []);
  const menuRef = useOutsideClick<HTMLDivElement>(open, close);

  const unreadCount = items.filter((n) => !n.read).length;

  function go(link?: string | null) {
    if (!link) return;
    close();
    router.push(link);
  }

  return (
    <div className="notif-wrap" style={{ position: 'relative' }}>
      <button
        className="btn icon"
        aria-label="Notificações"
        title="Notificações"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        🔔
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
            color: 'var(--text)',
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

          {loading && (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--muted)' }}>A carregar…</div>
          )}

          {error && !loading && (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--danger)' }}>{error}</div>
          )}

          {!loading && !error && items.length === 0 && (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--muted)' }}>
              Sem novas notificações.
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                maxHeight: 360,
                overflow: 'auto',
              }}
            >
              {items.map((n) => (
                <li
                  key={n.id}
                  style={{
                    borderTop: '1px solid var(--border)',
                    background: n.read ? 'transparent' : 'var(--hover)',
                  }}
                >
                  <button
                    onClick={() => go(n.link)}
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
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {n.title ?? 'Notificação'}
                      </div>
                      {!!n.body && (
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{n.body}</div>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {timeLabel(n.createdAt)}
                    </div>
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
              justifyContent: 'flex-end',
            }}
          >
            <button className="btn chip" onClick={fetchLatest} aria-label="Atualizar">
              Atualizar
            </button>
            <button className="btn chip" onClick={close} aria-label="Fechar painel">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppHeader() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // tema inicial (dataset do <html> ou media-query)
  useEffect(() => {
    const current =
      (document.documentElement.dataset.theme as 'light' | 'dark' | undefined) ||
      (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(current);
  }, []);

  // aplica + persiste
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    router.push(`/dashboard/search?q=${encodeURIComponent(v)}`);
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Pesquisa (ocupa o espaço à esquerda/centro) */}
        <form className="search" onSubmit={onSearch} role="search" aria-label="Pesquisar">
          <input
            id="global-search"
            className="search-input"
            type="search"
            placeholder="Pesquisar…"
            aria-label="Pesquisar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        {/* Ações encostadas à direita */}
        <div className="actions" style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8 }}>
          <button
            className="btn icon"
            aria-label="Alternar tema"
            title="Alternar tema"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'light' ? '🌞' : '🌙'}
          </button>

          <NotificationsBell />

          {/* Sair com confirmação (modal centrado) */}
          <SignOutConfirmButton />
        </div>
      </div>
    </header>
  );
}
