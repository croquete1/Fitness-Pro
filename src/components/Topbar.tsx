// src/components/Topbar.tsx
'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

type Target = '/dashboard/admin/users' | '/dashboard/pt/clients';

const HISTORY_KEY = 'fp.quicksearch.history';

type Shortcut = { label: string; href: Route; emoji?: string };
type Suggestion = { label: string; href: Route; emoji?: string };

type Props = {
  /** Página alvo da pesquisa rápida (admin ou PT). */
  targetUrl: Target;
  placeholder?: string;
  /** Atalhos rápidos fixos (opcional) */
  shortcuts?: Shortcut[];
  /** Sugestões “inteligentes” vindas do pai (ex.: últimos perfis/plans já carregados) */
  suggestions?: Suggestion[];
};

function useHistory() {
  const [items, setItems] = React.useState<string[]>([]);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  const save = React.useCallback((arr: string[]) => {
    setItems(arr);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
    } catch {}
  }, []);
  const push = React.useCallback(
    (q: string) => {
      const term = q.trim();
      if (!term) return;
      const next = [term, ...items.filter((i) => i !== term)].slice(0, 10);
      save(next);
    },
    [items, save]
  );
  const clear = React.useCallback(() => save([]), [save]);
  const remove = React.useCallback((q: string) => save(items.filter((i) => i !== q)), [items, save]);
  return { items, push, clear, remove };
}

export default function Topbar({
  targetUrl,
  placeholder = 'Pesquisar…',
  shortcuts = [
    { label: 'Aprovações', href: '/dashboard/admin/approvals' as Route, emoji: '✅' },
    { label: 'Utilizadores', href: '/dashboard/admin/users' as Route, emoji: '🧑‍🤝‍🧑' },
    { label: 'Exercícios', href: '/dashboard/admin/exercises' as Route, emoji: '🏋️' },
    { label: 'Planos', href: '/dashboard/admin/plans' as Route, emoji: '📝' },
    { label: 'Pesquisar', href: '/dashboard/search' as Route, emoji: '🔎' },
  ],
  suggestions = [], // podes passar sugestões reais do pai
}: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [kbdHint, setKbdHint] = React.useState<'meta' | 'ctrl'>('meta');
  const { items: history, push: pushHist, clear: clearHist, remove: removeHist } = useHistory();

  // Keyboard shortcut ⌘K / Ctrl+K
  React.useEffect(() => {
    const isMac = navigator.platform.toLowerCase().includes('mac');
    setKbdHint(isMac ? 'meta' : 'ctrl');
    const onKey = (e: KeyboardEvent) => {
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const runSearch = React.useCallback(
    (term: string) => {
      const t = term.trim();
      if (!t) return;

      if (targetUrl === '/dashboard/admin/users') {
        router.push((`/dashboard/admin/users?q=${encodeURIComponent(t)}` as Route));
      } else {
        router.push((`/dashboard/pt/clients?q=${encodeURIComponent(t)}` as Route));
      }

      pushHist(t);
      setOpen(false);
    },
    [router, targetUrl, pushHist]
  );

  const onSubmit = React.useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      runSearch(q);
    },
    [q, runSearch]
  );

  // Close popover ao clicar fora
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (ev: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  // UI
  return (
    <div className="topbar" style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }} ref={ref}>
      <button
        type="button"
        className="btn icon"
        aria-label="Abrir pesquisa"
        title={`Abrir pesquisa (${kbdHint === 'meta' ? '⌘' : 'Ctrl'}+K)`}
        onClick={() => setOpen((v) => !v)}
      >
        🔎
      </button>

      {/* Popover */}
      {open && (
        <div
          role="dialog"
          aria-label="Pesquisa rápida"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: 520,
            maxWidth: 'min(92vw, 520px)',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            boxShadow: '0 14px 50px rgba(0,0,0,.18)',
            padding: 10,
            zIndex: 1000,
          }}
        >
          {/* Campo de pesquisa */}
          <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
            <input
              autoFocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              aria-label="Pesquisa rápida"
              className="search-input"
            />
            <button type="submit" className="btn primary" disabled={!q.trim()}>
              Pesquisar
            </button>
          </form>

          {/* Sugestões dinâmicas (do pai) */}
          {suggestions.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div className="nav-section" style={{ margin: '0 0 6px' }}>Sugestões</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {suggestions.map((s) => (
                  <Link key={s.href} className="btn chip" href={s.href}>
                    <span aria-hidden>{s.emoji ?? '✨'}</span> {s.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Histórico */}
          <div style={{ marginTop: 10 }}>
            <div className="nav-section" style={{ margin: '0 0 6px' }}>
              Histórico
              {history.length > 0 && (
                <button className="btn chip" style={{ marginLeft: 8 }} type="button" onClick={clearHist}>
                  Limpar
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="text-muted small">Sem histórico ainda.</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                {history.map((h) => (
                  <li key={h} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      className="btn chip"
                      onClick={() => runSearch(h)}
                      title={`Pesquisar "${h}"`}
                    >
                      {h}
                    </button>
                    <button
                      type="button"
                      className="btn icon"
                      aria-label="Remover do histórico"
                      title="Remover do histórico"
                      onClick={() => removeHist(h)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Atalhos fixos */}
          {shortcuts.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="nav-section" style={{ margin: '0 0 6px' }}>Atalhos</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {shortcuts.map((s) => (
                  <Link key={s.href} className="btn chip" href={s.href}>
                    <span aria-hidden>{s.emoji ?? '➡️'}</span> {s.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
