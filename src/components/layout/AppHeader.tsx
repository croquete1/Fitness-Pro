// src/components/layout/AppHeader.tsx
'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import SignOutConfirmButton from '@/components/auth/SignOutConfirmButton';

// --- tipos para notificações do dropdown
type HeaderNotif = {
  id: string;
  title?: string;
  body?: string | null;
  link?: string | null;
  createdAt?: string;
  read?: boolean;
};

function timeLabel(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  try {
    return d.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
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
    const esc = (ev: KeyboardEvent) => { if (ev.key === 'Escape') onClose(); };
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
    router.push(link as Route);
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
              position: 'absolute', top: 2, right: 2, width: 8, height: 8,
              borderRadius: 999, background: 'var(--danger)', border: '1px solid var(--sidebar-bg)'
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
            position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 360, maxWidth: 'min(92vw, 360px)',
            background: 'var(--card-bg)', color: 'var(--text)', border: '1px solid var(--border)',
            borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,.18)', overflow: 'hidden', zIndex: 1000
          }}
        >
          <div style={{ padding: 10, borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Notificações</div>

          {loading && <div style={{ padding: 16, fontSize: 13, color: 'var(--muted)' }}>A carregar…</div>}
          {error && !loading && <div style={{ padding: 16, fontSize: 13, color: 'var(--danger)' }}>{error}</div>}
          {!loading && !error && items.length === 0 && (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--muted)' }}>Sem novas notificações.</div>
          )}

          {!loading && !error && items.length > 0 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 360, overflow: 'auto' }}>
              {items.map((n) => (
                <li key={n.id} style={{ borderTop: '1px solid var(--border)', background: n.read ? 'transparent' : 'var(--hover)' }}>
                  <button
                    onClick={() => go(n.link ?? undefined)}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, width: '100%',
                      textAlign: 'left', padding: 10, background: 'transparent', border: 0,
                      cursor: n.link ? 'pointer' : 'default', color: 'inherit'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{n.title ?? 'Notificação'}</div>
                      {!!n.body && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{n.body}</div>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{timeLabel(n.createdAt)}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div style={{ display: 'flex', gap: 8, padding: 8, borderTop: '1px solid var(--border)', justifyContent: 'flex-end' }}>
            <button className="btn chip" onClick={fetchLatest}>Atualizar</button>
            <button className="btn chip" onClick={close}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== Saved Views (localStorage) ====== */
type SavedView = { id: string; name: string; qs: string };

const VIEWS_KEY = 'fp.search.views';
const safeId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

function useSavedViews() {
  const [views, setViews] = useState<SavedView[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(VIEWS_KEY);
      if (raw) setViews(JSON.parse(raw));
    } catch {}
  }, []);
  const save = useCallback((next: SavedView[]) => {
    setViews(next);
    try { localStorage.setItem(VIEWS_KEY, JSON.stringify(next)); } catch {}
  }, []);
  const addView = useCallback((v: SavedView) => {
    const next = [v, ...views.filter(x => x.qs !== v.qs)].slice(0, 12);
    save(next);
  }, [views, save]);
  const removeView = useCallback((id: string) => {
    save(views.filter(v => v.id !== id));
  }, [views, save]);
  return { views, addView, removeView };
}

/* ====== QuickFilters dropdown ====== */
function QuickFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) sp.set(key, value); else sp.delete(key);
    const qs = sp.toString();
    router.push((`/dashboard/search${qs ? `?${qs}` : ''}` as Route));
  };

  const role = searchParams.get('role') ?? 'all';
  const ustatus = searchParams.get('ustatus') ?? 'all';
  const created = searchParams.get('created') ?? 'any';

  return (
    <div className="card" style={{ padding: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
      <span className="small text-muted" style={{ marginInlineEnd: 4 }}>Filtros rápidos:</span>

      <select
        aria-label="Role"
        value={role}
        onChange={(e) => setParam('role', e.target.value === 'all' ? null : e.target.value)}
      >
        <option value="all">Role: Todos</option>
        <option value="CLIENT">Cliente</option>
        <option value="PT">PT</option>
        <option value="ADMIN">Admin</option>
      </select>

      <select
        aria-label="Estado"
        value={ustatus}
        onChange={(e) => setParam('ustatus', e.target.value === 'all' ? null : e.target.value)}
      >
        <option value="all">Estado: Todos</option>
        <option value="ACTIVE">Ativos</option>
        <option value="PENDING">Pendentes</option>
        <option value="SUSPENDED">Suspensos</option>
      </select>

      <select
        aria-label="Criados"
        value={created}
        onChange={(e) => setParam('created', e.target.value === 'any' ? null : e.target.value)}
      >
        <option value="any">Criados: Qualquer</option>
        <option value="7d">Últimos 7 dias</option>
        <option value="30d">Últimos 30 dias</option>
        <option value="90d">Últimos 90 dias</option>
        <option value="365d">Último ano</option>
      </select>
    </div>
  );
}

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState('');

  // tema
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    const current =
      (document.documentElement.dataset.theme as 'light' | 'dark' | undefined) ||
      (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(current);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  // ✅ sincronizar query no input quando estamos em /dashboard/search
  useEffect(() => {
    if (pathname?.startsWith('/dashboard/search')) {
      setQ(searchParams.get('q') ?? '');
    }
  }, [pathname, searchParams]);

  const onSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const value = q.trim();
    if (!value) return;
    router.push((`/dashboard/search?q=${encodeURIComponent(value)}` as Route));
  }, [router, q]);

  // ===== Resumo dos filtros ativos na página de pesquisa
  const filterSummary = useMemo(() => {
    if (!pathname?.startsWith('/dashboard/search')) return [] as { key: string; label: string }[];

    const role = searchParams.get('role') ?? 'all';
    const ustatus = searchParams.get('ustatus') ?? 'all';
    const created = searchParams.get('created') ?? 'any';

    const els: { key: 'role' | 'ustatus' | 'created'; label: string }[] = [];
    if (role !== 'all') {
      const roleLabel = role === 'PT' ? 'PT' : role === 'CLIENT' ? 'Cliente' : 'Admin';
      els.push({ key: 'role', label: roleLabel });
    }
    if (ustatus !== 'all') {
      const map: Record<string, string> = { ACTIVE: 'Ativos', PENDING: 'Pendentes', SUSPENDED: 'Suspensos' };
      els.push({ key: 'ustatus', label: map[ustatus] ?? ustatus });
    }
    if (created !== 'any') {
      const map: Record<string, string> = { '7d': 'Últimos 7d', '30d': 'Últimos 30d', '90d': 'Últimos 90d', '365d': 'Último ano' };
      els.push({ key: 'created', label: map[created] ?? created });
    }
    return els;
  }, [pathname, searchParams]);

  const makeSearchUrl = useCallback((patch: Record<string, string | null>) => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(patch).forEach(([k, v]) => (v ? sp.set(k, v) : sp.delete(k)));
    const qs = sp.toString();
    return (`/dashboard/search${qs ? `?${qs}` : ''}` as Route);
  }, [searchParams]);

  // ====== Guardar / aplicar vistas
  const { views, addView, removeView } = useSavedViews();
  const saveCurrentView = useCallback(() => {
    const qs = searchParams.toString();
    const name =
      typeof window !== 'undefined'
        ? (prompt('Nome da vista:', 'Minha vista') || '').trim()
        : '';
    if (!name) return;
    addView({ id: safeId(), name, qs });
  }, [searchParams, addView]);

  const applyView = useCallback((id: string) => {
    const v = views.find(x => x.id === id);
    if (!v) return;
    const url = (`/dashboard/search${v.qs ? `?${v.qs}` : ''}` as Route);
    router.push(url);
  }, [views, router]);

  return (
    <header className="app-header">
      <div className="header-inner" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'grid', gap: 8 }}>
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

          {/* Chips-resumo + QuickFilters + Saved Views (apenas na página de pesquisa) */}
          {pathname?.startsWith('/dashboard/search') && (
            <>
              {filterSummary.length > 0 && (
                <div aria-label="Filtros ativos" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {filterSummary.map((f) => (
                    <Link
                      key={f.key}
                      className="btn chip"
                      title="Limpar este filtro"
                      href={makeSearchUrl({ [f.key]: null })}
                      prefetch
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>{f.label}</span>
                      <span aria-hidden>✕</span>
                    </Link>
                  ))}
                  <Link
                    className="btn chip"
                    title="Limpar todos os filtros"
                    href={makeSearchUrl({ role: null, ustatus: null, created: null, pstatus: null, pupdated: null, pkgstatus: null, pkgperiod: null })}
                    prefetch
                  >
                    Limpar filtros
                  </Link>
                </div>
              )}

              <div style={{ display: 'grid', gap: 8 }}>
                <QuickFilters />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="btn chip" type="button" onClick={saveCurrentView}>💾 Guardar vista</button>

                  {views.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="small text-muted">Vistas:</span>
                      <select
                        aria-label="Aplicar vista"
                        defaultValue=""
                        onChange={(e) => { const v = e.target.value; if (v) applyView(v); }}
                      >
                        <option value="">— escolher —</option>
                        {views.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>

                      {/* apagar vista selecionada */}
                      <button
                        type="button"
                        className="btn chip"
                        onClick={() => {
                          const id = prompt('ID da vista a apagar (escolhe-a primeiro e copia o ID do value)?');
                          if (!id) return;
                          removeView(id);
                        }}
                        title="Apagar vista (avançado)"
                      >
                        🗑️ Apagar vista
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

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
          <SignOutConfirmButton />
        </div>
      </div>
    </header>
  );
}
