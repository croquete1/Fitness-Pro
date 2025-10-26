'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Search } from 'lucide-react';

type SearchItem = {
  id: string;
  title: string;
  subtitle: string | null;
  href: string | null;
};

type SearchGroup = {
  id: string;
  label: string;
  items: SearchItem[];
};

type Source = 'supabase' | 'fallback' | null;

const GROUP_LABELS: Record<string, string> = {
  users: 'Utilizadores',
  plans: 'Planos',
  exercises: 'Exercícios',
  sessions: 'Sessões',
  messages: 'Mensagens',
};

function normaliseGroups(payload: any): SearchGroup[] {
  if (!payload) return [];

  if (Array.isArray(payload.collections)) {
    return payload.collections
      .map((collection: any) => {
        const type = collection.type ?? collection.id ?? 'outros';
        const items: SearchItem[] = (collection.items ?? [])
          .slice(0, 6)
          .map((item: any, index: number) => ({
            id: String(item.id ?? `${type}-${index}`),
            title: String(item.title ?? item.name ?? item.label ?? 'Resultado'),
            subtitle: item.subtitle ?? item.meta ?? item.relevance ?? null,
            href: typeof item.href === 'string' ? item.href : item.link ?? null,
          }));

        return {
          id: String(collection.id ?? type),
          label: collection.label ?? GROUP_LABELS[type] ?? GROUP_LABELS[collection.type as string] ?? 'Outros',
          items,
        } satisfies SearchGroup;
      })
      .filter((group: SearchGroup) => group.items.length > 0);
  }

  if (Array.isArray(payload.results)) {
    return payload.results
      .map((group: any) => {
        const type = group.type ?? group.id ?? 'outros';
        const items: SearchItem[] = (group.items ?? [])
          .map((item: any, index: number) => ({
            id: String(item.id ?? `${type}-${index}`),
            title: String(item.title ?? item.name ?? item.label ?? 'Resultado'),
            subtitle: item.subtitle ?? item.detail ?? null,
            href: typeof item.href === 'string' ? item.href : item.link ?? null,
          }));

        return {
          id: String(group.id ?? type),
          label: group.label ?? GROUP_LABELS[type] ?? 'Outros',
          items,
        } satisfies SearchGroup;
      })
      .filter((group: SearchGroup) => group.items.length > 0);
  }

  return [];
}

export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [groups, setGroups] = React.useState<SearchGroup[]>([]);
  const [source, setSource] = React.useState<Source>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [popoverWidth, setPopoverWidth] = React.useState<number | null>(null);
  const debounceRef = React.useRef<number | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const trimmed = query.trim();

  const goToSearch = React.useCallback(
    (value: string) => {
      const term = value.trim();
      if (!term) return;
      setOpen(false);
      router.push(`/dashboard/search?q=${encodeURIComponent(term)}`);
    },
    [router],
  );

  React.useEffect(() => {
    if (!containerRef.current) return undefined;
    const node = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setPopoverWidth(entry.contentRect.width);
    });
    observer.observe(node);
    setPopoverWidth(node.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  React.useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    const term = query.trim();
    if (!term) {
      setGroups([]);
      setSource(null);
      setError(null);
      setLoading(false);
      setOpen(false);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          cache: 'no-store',
          credentials: 'include',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error((await response.text()) || 'Não foi possível carregar resultados.');
        }
        const payload = await response.json().catch(() => ({}));
        if (controller.signal.aborted) return;
        setGroups(normaliseGroups(payload));
        setSource(payload?.source === 'supabase' ? 'supabase' : payload?.source === 'fallback' ? 'fallback' : null);
        setError(null);
        setOpen(true);
      } catch (fetchError: any) {
        if (fetchError?.name === 'AbortError') return;
        setGroups([]);
        setError(fetchError?.message || 'Não foi possível carregar resultados.');
        setSource(null);
        setOpen(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 220) as unknown as number;
  }, [query]);

  React.useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const onResult = React.useCallback(
    (item: SearchItem, currentQuery: string) => {
      const search = currentQuery.trim();
      const href = item.href || `/dashboard/search?q=${encodeURIComponent(search || item.title)}`;
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <div className="neo-header-search" ref={containerRef}>
      <div
        className="neo-header__search"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="neo-header__search-icon" aria-hidden="true">
          <Search className="neo-icon neo-icon--sm" />
        </span>
        <input
          type="search"
          placeholder="Pesquisar…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (groups.length || error) {
              setOpen(true);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              goToSearch(event.currentTarget.value);
            }
          }}
          autoCorrect="off"
          spellCheck={false}
          aria-autocomplete="list"
        />
        <button
          type="button"
          className="neo-header__search-button"
          onClick={() => goToSearch(query)}
          disabled={!trimmed}
        >
          Procurar
        </button>
      </div>

      {open && (
        <div
          className="neo-header-search__popover"
          role="dialog"
          aria-label="Resultados rápidos"
          style={{ width: popoverWidth ?? undefined }}
        >
          <header className="neo-header-search__popoverHeader">
            <span className="neo-text--sm neo-text--semibold">Resultados rápidos</span>
            {source && (
              <span className="neo-tag" data-tone={source === 'supabase' ? 'success' : 'neutral'}>
                {source === 'supabase' ? 'Servidor · tempo real' : 'Modo offline'}
              </span>
            )}
          </header>
          <div className="neo-header-search__popoverBody" role="listbox">
            {loading && (
              <div className="neo-header-search__loading" role="status">
                <Loader2 className="neo-icon neo-icon--sm neo-spin" aria-hidden="true" />
                <span>A sincronizar resultados…</span>
              </div>
            )}

            {error && !loading && <p className="neo-header-search__error">{error}</p>}

            {!error &&
              groups.map((group) => (
                <section key={group.id} className="neo-header-search__group">
                  <header className="neo-header-search__groupHeader">{group.label}</header>
                  <ul className="neo-header-search__groupList">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className="neo-header-search__result"
                          onClick={() => onResult(item, query)}
                        >
                          <span className="neo-header-search__resultTitle">{item.title}</span>
                          {item.subtitle && (
                            <span className="neo-header-search__resultSubtitle">{item.subtitle}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

            {!error && !loading && groups.length === 0 && (
              <p className="neo-header-search__empty">
                Sem resultados — procura por nomes de clientes, planos activos ou sessões específicas.
              </p>
            )}
          </div>
          <footer className="neo-header-search__footer">
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              onClick={() => goToSearch(query)}
              disabled={!trimmed}
            >
              <span className="btn__label">Ver todos os resultados</span>
              <span className="btn__icon">
                <ArrowRight className="neo-icon neo-icon--sm" aria-hidden="true" />
              </span>
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}
