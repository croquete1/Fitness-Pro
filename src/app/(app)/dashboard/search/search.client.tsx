'use client';

import * as React from 'react';
import useSWR from 'swr';
import { usePathname, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SearchDashboardData, SearchResultType } from '@/lib/search/types';

const ALL_TYPES: SearchResultType[] = ['users', 'plans', 'exercises', 'sessions'];

export type SearchDashboardResponse = SearchDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

type Props = {
  initialQuery: string;
  initialTypes: SearchResultType[];
  initialOffsets: Record<SearchResultType, number>;
  initialData: SearchDashboardResponse;
  viewerName: string | null;
  viewerRole: string | null;
};

type FetchError = Error & { status?: number };

const fetcher = async (url: string): Promise<SearchDashboardResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    const error = new Error(message || 'Não foi possível carregar a pesquisa.') as FetchError;
    error.status = response.status;
    throw error;
  }
  const json = await response.json();
  if (!json?.ok) {
    throw new Error(json?.message ?? 'Não foi possível carregar a pesquisa.');
  }
  return json as SearchDashboardResponse;
};

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-PT').format(value);
}

export default function SearchClient({
  initialQuery,
  initialTypes,
  initialOffsets,
  initialData,
  viewerName,
  viewerRole,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = React.useState(initialQuery);
  const [activeTypes, setActiveTypes] = React.useState<SearchResultType[]>(
    initialTypes.length ? initialTypes : ALL_TYPES,
  );
  const [offsets, setOffsets] = React.useState<Record<SearchResultType, number>>({
    users: initialOffsets.users ?? 0,
    plans: initialOffsets.plans ?? 0,
    exercises: initialOffsets.exercises ?? 0,
    sessions: initialOffsets.sessions ?? 0,
  });

  const [debouncedQuery, setDebouncedQuery] = React.useState(initialQuery.trim());

  React.useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 320);
    return () => clearTimeout(handle);
  }, [query]);

  React.useEffect(() => {
    setOffsets((current) => {
      const next: Record<SearchResultType, number> = { ...current } as any;
      ALL_TYPES.forEach((type) => {
        if (!activeTypes.includes(type)) {
          next[type] = 0;
        }
      });
      return next;
    });
  }, [activeTypes]);

  React.useEffect(() => {
    setOffsets({ users: 0, plans: 0, exercises: 0, sessions: 0 });
  }, [debouncedQuery]);

  const typesKey = React.useMemo(() => activeTypes.slice().sort().join(','), [activeTypes]);
  const offsetsKey = React.useMemo(
    () =>
      activeTypes
        .map((type) => `${type}:${offsets[type] ?? 0}`)
        .sort()
        .join('|'),
    [activeTypes, offsets],
  );

  const swrKey = React.useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (activeTypes.length !== ALL_TYPES.length) params.set('types', activeTypes.join(','));
    activeTypes.forEach((type) => {
      const offset = offsets[type] ?? 0;
      if (offset > 0) params.set(`${type}Offset`, String(offset));
    });
    return [`/api/search?${params.toString()}`, typesKey, offsetsKey] as const;
  }, [activeTypes, debouncedQuery, offsets, typesKey, offsetsKey]);

  const {
    data: remote,
    error,
    isValidating,
  } = useSWR<SearchDashboardResponse>(swrKey, ([url]) => fetcher(url), {
    keepPreviousData: true,
    fallbackData: initialData,
  });

  const data = remote ?? initialData;

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (activeTypes.length !== ALL_TYPES.length) params.set('types', activeTypes.join(','));
    const search = params.toString();
    router.replace(`${pathname}${search ? `?${search}` : ''}`, { scroll: false });
  }, [debouncedQuery, activeTypes, pathname, router]);

  const onSelectType = React.useCallback(
    (type: SearchResultType) => {
      setActiveTypes((current) => {
        if (current.includes(type)) {
          const next = current.filter((item) => item !== type);
          return next.length ? next : current;
        }
        return [...current, type];
      });
    },
    [],
  );

  const onResetFilters = React.useCallback(() => {
    setActiveTypes(ALL_TYPES);
    setOffsets({ users: 0, plans: 0, exercises: 0, sessions: 0 });
  }, []);

  const onLoadMore = React.useCallback(
    (type: SearchResultType, next: number | null) => {
      if (next == null) return;
      setOffsets((current) => ({ ...current, [type]: next }));
    },
    [],
  );

  const statusLabel = data.source === 'supabase' ? 'Dados em tempo real (servidor)' : 'Modo offline';
  const statusState = data.source === 'supabase' ? 'ok' : 'warn';

  const timelineData = React.useMemo(
    () =>
      data.timeline.map((point) => ({
        ...point,
        label: formatDateLabel(point.iso),
      })),
    [data.timeline],
  );

  const hasTimeline = timelineData.some((point) => point.matches > 0 || point.newItems > 0);

  const noResults = data.collections.every((collection) => collection.total === 0);

  const roleLabel = viewerRole ? viewerRole.toString().toLowerCase() : 'admin';
  const headline = viewerName
    ? `Olá ${viewerName.split(' ')[0]}, a pesquisa ${roleLabel} está pronta para encontrar pessoas, planos e sessões em segundos.`
    : 'Pesquisa global com métricas em tempo real, destaques operacionais e tendências de conteúdo.';

  return (
    <div className="search-dashboard" data-loading={isValidating}>
      <PageHeader title="Pesquisa universal" subtitle={headline} sticky={false} />

      {error ? (
      <Alert tone="danger" title="Falha ao sincronizar resultados">
          {error.message || 'Verifica a ligação ou tenta novamente dentro de alguns segundos.'}
        </Alert>
      ) : null}

      <section className="neo-panel search-dashboard__panel" aria-labelledby="search-dashboard-controls">
        <header className="search-dashboard__panelHeader">
          <div>
            <span className="caps-tag">Pesquisa</span>
            <h2 id="search-dashboard-controls" className="neo-panel__title">
              Explora o catálogo
            </h2>
            <p className="neo-panel__subtitle">
              Filtra por tipo de recurso, usa sugestões e acompanha o estado da ligação.
            </p>
          </div>
          <span className="status-pill" data-state={statusState}>
            {statusLabel}
          </span>
        </header>

        <form
          className="search-dashboard__form"
          onSubmit={(event) => {
            event.preventDefault();
            setDebouncedQuery(query.trim());
          }}
        >
          <label className="neo-input-group__field search-dashboard__field">
            <span className="neo-input-group__label">Termo de pesquisa</span>
            <div className="search-dashboard__input">
              <span aria-hidden className="search-dashboard__icon">
                🔍
              </span>
              <input
                className="neo-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Utilizador, plano, exercício, sessão…"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </label>
          <div className="search-dashboard__actions">
            <Button type="submit" variant="primary">
              Procurar
            </Button>
            <Button type="button" variant="ghost" onClick={() => setQuery('')}>
              Limpar
            </Button>
          </div>
        </form>

        <div className="neo-segmented search-dashboard__types" role="group" aria-label="Filtrar resultados por tipo">
          {ALL_TYPES.map((type) => {
            const active = activeTypes.includes(type);
            const count = data.filters.types.find((entry) => entry.id === type)?.total ?? 0;
            const labels: Record<SearchResultType, string> = {
              users: 'Utilizadores',
              plans: 'Planos',
              exercises: 'Exercícios',
              sessions: 'Sessões',
            };
            return (
              <button
                key={type}
                type="button"
                className="neo-segmented__btn"
                data-active={active}
                aria-pressed={active}
                onClick={() => onSelectType(type)}
              >
                <span>{labels[type]}</span>
                <span className="neo-segmented__count">{formatNumber(count)}</span>
              </button>
            );
          })}
          <Button type="button" variant="ghost" size="sm" onClick={onResetFilters}>
            Repor filtros
          </Button>
        </div>

        {data.suggestions.length ? (
          <div className="search-dashboard__suggestions" role="list">
            {data.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="neo-chip"
                onClick={() => {
                  setQuery(suggestion);
                  setDebouncedQuery(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="neo-panel search-dashboard__panel" aria-labelledby="search-dashboard-hero">
        <header className="search-dashboard__panelHeader">
          <div>
            <span className="caps-tag">Métricas</span>
            <h2 id="search-dashboard-hero" className="neo-panel__title">
              Indicadores rápidos
            </h2>
            <p className="neo-panel__subtitle">Resumo dos resultados encontrados e actividade recente.</p>
          </div>
        </header>
        <div className="search-dashboard__hero">
          {data.hero.map((metric) => (
            <article key={metric.id} className="neo-surface search-dashboard__metric" data-variant={metric.tone}>
              <span className="neo-surface__hint">{metric.label}</span>
              <span className="neo-surface__value">{metric.value}</span>
              {metric.helper ? <span className="neo-surface__meta">{metric.helper}</span> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel search-dashboard__panel" aria-labelledby="search-dashboard-timeline">
        <header className="search-dashboard__panelHeader">
          <div>
            <span className="caps-tag">Tendência</span>
            <h2 id="search-dashboard-timeline" className="neo-panel__title">
              Actividade nos últimos 14 dias
            </h2>
            <p className="neo-panel__subtitle">
              Volume de resultados encontrados (total e novos registos) por dia.
            </p>
          </div>
        </header>
        <div className="search-dashboard__chart" role="region" aria-live="polite">
          {hasTimeline ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timelineData} margin={{ left: 0, right: 16, top: 16, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={70} />
                <Tooltip
                  formatter={(value: number, key: string) => [formatNumber(value), key === 'matches' ? 'Resultados' : 'Novos']}
                  labelFormatter={(label: string) => label}
                />
                <Area type="monotone" dataKey="matches" stroke="#2563eb" fill="var(--neo-chart-primary)" />
                <Area type="monotone" dataKey="newItems" stroke="#22c55e" fill="var(--neo-chart-positive)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="neo-empty search-dashboard__empty">
              <span className="neo-empty__icon" aria-hidden>
                📊
              </span>
              <p className="neo-empty__title">Sem histórico suficiente</p>
              <p className="neo-empty__description">
                Assim que existirem resultados ou novos registos iremos desenhar a evolução automaticamente.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="neo-panel search-dashboard__panel" aria-labelledby="search-dashboard-insights">
        <header className="search-dashboard__panelHeader">
          <div>
            <span className="caps-tag">Insights</span>
            <h2 id="search-dashboard-insights" className="neo-panel__title">
              Destaques operacionais
            </h2>
            <p className="neo-panel__subtitle">
              Ligações rápidas entre o comportamento da pesquisa, recursos mais frequentes e tendências.
            </p>
          </div>
        </header>
        <div className="search-dashboard__insights">
          <div className="search-dashboard__insightList" role="list">
            {data.insights.map((insight) => (
              <article key={insight.id} className="neo-surface search-dashboard__insight" data-variant={insight.tone}>
                <span className="neo-surface__hint">{insight.icon ?? '✨'}</span>
                <span className="neo-surface__value">{insight.title}</span>
                <p className="neo-surface__meta">{insight.description}</p>
              </article>
            ))}
          </div>
          {data.trends.length ? (
            <div className="search-dashboard__trends" aria-label="Tendências de pesquisa">
              <h3>Tendências recentes</h3>
              <ul>
                {data.trends.map((trend) => (
                  <li key={trend.term}>
                    <span>{trend.term}</span>
                    <strong>{formatNumber(trend.count)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="neo-panel search-dashboard__panel" aria-labelledby="search-dashboard-results">
        <header className="search-dashboard__panelHeader">
          <div>
            <span className="caps-tag">Resultados</span>
            <h2 id="search-dashboard-results" className="neo-panel__title">
              Catálogo encontrado
            </h2>
            <p className="neo-panel__subtitle">
              Lista agrupada por tipo com acesso rápido aos recursos mais relevantes.
            </p>
          </div>
        </header>
        <div className="search-dashboard__collections">
          {data.collections.map((collection) => (
            <section key={collection.type} className="search-dashboard__collection" aria-labelledby={`collection-${collection.type}`}>
              <header className="search-dashboard__collectionHeader">
                <div>
                  <h3 id={`collection-${collection.type}`}>{collection.label}</h3>
                  <span className="search-dashboard__collectionMeta">
                    {formatNumber(collection.total)} resultado{collection.total === 1 ? '' : 's'}
                  </span>
                </div>
              </header>
              {collection.items.length ? (
                <ul className="search-dashboard__list">
                  {collection.items.map((item) => (
                    <li key={`${collection.type}-${item.id}`} className="search-dashboard__item">
                      <div className="search-dashboard__itemBody">
                        <div className="search-dashboard__itemTitle">
                          <a href={item.href} className="search-dashboard__itemLink">
                            {item.title}
                          </a>
                          {item.subtitle ? <p>{item.subtitle}</p> : null}
                        </div>
                        <div className="search-dashboard__itemMeta">
                          {item.badge ? (
                            <span className="search-dashboard__badge" data-tone={item.badge.tone ?? 'neutral'}>
                              {item.badge.label}
                            </span>
                          ) : null}
                          {item.activityLabel ? <span>{item.activityLabel}</span> : null}
                          {item.meta ? <span>{item.meta}</span> : null}
                        </div>
                      </div>
                      <div className="search-dashboard__itemActions">
                        <a href={item.href} className="neo-link">
                          Abrir
                        </a>
                        <span className="search-dashboard__score">{item.relevance ?? ''}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="neo-empty search-dashboard__empty">
                  <span className="neo-empty__icon" aria-hidden>
                    🔎
                  </span>
                  <p className="neo-empty__title">Sem resultados nesta secção</p>
                  <p className="neo-empty__description">
                    Ajusta os filtros ou experimenta outro termo de pesquisa para ver mais opções.
                  </p>
                </div>
              )}
              {collection.nextOffset != null ? (
                <div className="search-dashboard__more">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onLoadMore(collection.type, collection.nextOffset)}
                  >
                    Ver mais {collection.label.toLowerCase()}
                  </Button>
                </div>
              ) : null}
            </section>
          ))}
        </div>
        {noResults ? (
          <div className="neo-empty search-dashboard__empty">
            <span className="neo-empty__icon" aria-hidden>
              🧭
            </span>
            <p className="neo-empty__title">Nenhum resultado encontrado</p>
            <p className="neo-empty__description">
              Verifica se existem erros de digitação ou combina diferentes filtros. A pesquisa suporta resultados em tempo real.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
