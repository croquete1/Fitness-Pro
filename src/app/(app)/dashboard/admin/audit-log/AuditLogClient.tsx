'use client';

import * as React from 'react';
import useSWR from 'swr';
import clsx from 'clsx';
import { AlertTriangle, Download, Filter, History, RefreshCcw, Search } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import DataSourceBadge, { describeDataSourceRelative } from '@/components/ui/DataSourceBadge';
import Spinner from '@/components/ui/Spinner';
import type { AuditDashboardResponse } from '@/app/api/admin/audit-log/dashboard/route';
import type { AuditLogMeta, AuditLogRow } from '@/lib/admin/audit-log/types';
import {
  ADMIN_AUDIT_DASHBOARD_FALLBACK,
  ADMIN_AUDIT_FALLBACK_ROWS,
  ADMIN_AUDIT_META_FALLBACK,
} from '@/lib/fallback/admin-audit-log';

const PAGE_SIZE_OPTIONS = [20, 50, 100];

const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const tooltipDateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
});

const fallbackDashboard: AuditDashboardResponse = {
  ...ADMIN_AUDIT_DASHBOARD_FALLBACK,
  ok: true,
  source: 'fallback',
  missingTable: false,
};

type AuditListResponse = {
  items: AuditLogRow[];
  count: number;
  page: number;
  pageSize: number;
  meta?: AuditLogMeta;
  missingTable?: boolean;
  source: 'supabase' | 'fallback';
};

const fallbackList: AuditListResponse = {
  items: ADMIN_AUDIT_FALLBACK_ROWS.slice(0, PAGE_SIZE_OPTIONS[0]),
  count: ADMIN_AUDIT_FALLBACK_ROWS.length,
  page: 1,
  pageSize: PAGE_SIZE_OPTIONS[0],
  meta: ADMIN_AUDIT_META_FALLBACK,
  missingTable: false,
  source: 'fallback' as const,
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  if (!res.ok) {
    const message = await res.text().catch(() => '');
    throw new Error(message || 'Não foi possível sincronizar os dados.');
  }
  return (await res.json()) as T;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return dateTimeFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function describeDetails(row: AuditLogRow): string | null {
  if (row.note?.trim()) return row.note.trim();
  if (row.details && Object.keys(row.details).length) {
    return Object.keys(row.details)
      .slice(0, 3)
      .join(', ');
  }
  if (row.payload && Object.keys(row.payload).length) {
    return Object.keys(row.payload)
      .slice(0, 3)
      .join(', ');
  }
  if (row.meta && Object.keys(row.meta).length) {
    return Object.keys(row.meta)
      .slice(0, 3)
      .join(', ');
  }
  return null;
}

export default function AuditLogClient() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[0]);
  const [kindFilter, setKindFilter] = React.useState('');
  const [targetFilter, setTargetFilter] = React.useState('');
  const [actorFilter, setActorFilter] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [meta, setMeta] = React.useState<AuditLogMeta | null>(fallbackList.meta ?? null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    setPage(1);
  }, [kindFilter, targetFilter, actorFilter, debouncedSearch, pageSize]);

  const listUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (kindFilter) params.set('kind', kindFilter);
    if (targetFilter) params.set('targetType', targetFilter);
    if (actorFilter) params.set('actorId', actorFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (!meta) params.set('meta', '1');
    return `/api/admin/audit-log?${params.toString()}`;
  }, [page, pageSize, kindFilter, targetFilter, actorFilter, debouncedSearch, meta]);

  const {
    data: listData,
    error: listError,
    isLoading: listLoading,
    mutate: mutateList,
  } = useSWR<AuditListResponse>(listUrl, fetcher, {
    keepPreviousData: true,
    fallbackData: fallbackList,
  });

  const {
    data: dashboardData,
    error: dashboardError,
    mutate: mutateDashboard,
  } = useSWR<AuditDashboardResponse>('/api/admin/audit-log/dashboard', fetcher, {
    revalidateOnFocus: false,
    fallbackData: fallbackDashboard,
  });

  React.useEffect(() => {
    if (listData?.meta) {
      setMeta(listData.meta);
    }
  }, [listData?.meta]);

  const totalPages = React.useMemo(() => {
    const count = listData?.count ?? 0;
    return Math.max(1, Math.ceil(count / pageSize));
  }, [listData?.count, pageSize]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const refreshAll = React.useCallback(() => {
    void Promise.all([mutateDashboard(), mutateList()]);
  }, [mutateDashboard, mutateList]);

  const handleExport = React.useCallback(() => {
    const url = new URL('/api/admin/audit-log', window.location.origin);
    url.searchParams.set('format', 'csv');
    if (kindFilter) url.searchParams.set('kind', kindFilter);
    if (targetFilter) url.searchParams.set('targetType', targetFilter);
    if (actorFilter) url.searchParams.set('actorId', actorFilter);
    if (debouncedSearch) url.searchParams.set('search', debouncedSearch);
    window.location.assign(url.toString());
  }, [actorFilter, debouncedSearch, kindFilter, targetFilter]);

  const timelineData = dashboardData?.timeline ?? [];
  const heroMetrics = dashboardData?.heroMetrics ?? [];
  const kindShares = dashboardData?.kindShares ?? [];
  const actorShares = dashboardData?.actorShares ?? [];
  const highlights = dashboardData?.highlights ?? [];

  const usingFallback =
    (dashboardData?.source ?? 'fallback') === 'fallback' || (listData?.source ?? 'fallback') === 'fallback';
  const missingTable = Boolean(dashboardData?.missingTable || listData?.missingTable);

  const dataSource = (dashboardData?.source === 'supabase' || listData?.source === 'supabase')
    ? 'supabase'
    : 'fallback';
  const generatedAt = dashboardData?.generatedAt ?? listData?.items?.[0]?.created_at ?? null;

  return (
    <div className="audit-log-dashboard">
      <PageHeader
        title="Logs de auditoria"
        subtitle="Monitoriza as ações críticas de administradores, treinadores e clientes em tempo real."
        actions={(
          <div className="audit-log-dashboard__headerActions">
            <Button variant="secondary" onClick={refreshAll} leftIcon={<RefreshCcw size={16} />}>Atualizar</Button>
            <Button variant="ghost" onClick={handleExport} leftIcon={<Download size={16} />}>Exportar CSV</Button>
          </div>
        )}
      />

      <div className="audit-log-dashboard__metaBar">
        <DataSourceBadge source={dataSource} generatedAt={generatedAt} />
        <div className="audit-log-dashboard__metaInfo" role="status">
          Última atualização {describeDataSourceRelative(generatedAt) ?? 'agora mesmo'}
        </div>
      </div>

      {usingFallback && (
        <Alert tone="warning" className="audit-log-dashboard__alert" title="A mostrar dados determinísticos">
          Não foi possível sincronizar com o Supabase. Estás a ver uma amostra consistente para continuar a análise.
        </Alert>
      )}

      {missingTable && (
        <Alert tone="danger" className="audit-log-dashboard__alert" title="Tabela de auditoria em falta">
          Garante que a extensão de auditoria está ativa na tua instância do Supabase e volta a sincronizar.
        </Alert>
      )}

      {dashboardError && (
        <Alert tone="danger" className="audit-log-dashboard__alert" title="Não foi possível sincronizar as métricas">
          Estamos a apresentar os últimos dados disponíveis. Tenta atualizar novamente dentro de alguns minutos.
        </Alert>
      )}

      <section className="audit-log-dashboard__hero" aria-label="Métricas principais">
        {heroMetrics.map((metric) => (
          <article key={metric.id} className="audit-log-dashboard__heroCard" data-tone={metric.tone}>
            <span className="audit-log-dashboard__heroLabel">{metric.label}</span>
            <span className="audit-log-dashboard__heroValue">{metric.value}</span>
            <span className="audit-log-dashboard__heroHelper">{metric.helper}</span>
          </article>
        ))}
      </section>

      <div className="audit-log-dashboard__grid">
        <article className="audit-log-dashboard__panel audit-log-dashboard__panel--chart">
          <header className="audit-log-dashboard__panelHeader">
            <h2>Histórico das últimas 2 semanas</h2>
            <p>Acompanha o volume diário de eventos por categoria crítica.</p>
          </header>
          <div className="audit-log-dashboard__chart">
            {timelineData.length === 0 ? (
              <div className="audit-log-dashboard__empty" role="status">
                <span className="audit-log-dashboard__emptyIcon" aria-hidden>
                  <History size={18} />
                </span>
                <p className="audit-log-dashboard__emptyTitle">Sem registos suficientes</p>
                <p className="audit-log-dashboard__emptyDescription">
                  Assim que novos eventos forem registados mostramos aqui a evolução diária.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={timelineData} margin={{ left: 8, right: 8, top: 16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--neo-border-subtle)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => tooltipDateFormatter.format(new Date(value))}
                    stroke="var(--muted-fg)"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="var(--muted-fg)"
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <Tooltip
                    labelFormatter={(value) => tooltipDateFormatter.format(new Date(value))}
                    contentStyle={{
                      background: 'var(--neo-surface-raised)',
                      borderRadius: 8,
                      border: '1px solid var(--neo-border-subtle)',
                    }}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--neo-primary)" fill="rgba(73, 99, 230, 0.16)" />
                  <Area type="monotone" dataKey="security" stroke="var(--neo-warning)" fill="rgba(235, 164, 54, 0.18)" />
                  <Area type="monotone" dataKey="plans" stroke="var(--neo-teal)" fill="rgba(16, 180, 156, 0.18)" />
                  <Area type="monotone" dataKey="users" stroke="var(--danger)" fill="rgba(229, 72, 77, 0.16)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="audit-log-dashboard__panel">
          <header className="audit-log-dashboard__panelHeader">
            <h2>Eventos mais frequentes</h2>
            <p>Tipos de ação com maior incidência nos últimos 45 dias.</p>
          </header>
          <ul className="audit-log-dashboard__list" role="list">
            {kindShares.length === 0 ? (
              <li className="audit-log-dashboard__listEmpty">Sem dados suficientes para calcular a distribuição.</li>
            ) : (
              kindShares.map((entry) => (
                <li key={entry.kind}>
                  <span className="audit-log-dashboard__listLabel">{entry.kind}</span>
                  <span className="audit-log-dashboard__listValue">{entry.count}</span>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="audit-log-dashboard__panel">
          <header className="audit-log-dashboard__panelHeader">
            <h2>Actores mais ativos</h2>
            <p>Utilizadores com mais eventos auditados no período.</p>
          </header>
          <ul className="audit-log-dashboard__list" role="list">
            {actorShares.length === 0 ? (
              <li className="audit-log-dashboard__listEmpty">Sem eventos com actor identificado.</li>
            ) : (
              actorShares.map((entry) => (
                <li key={entry.id ?? entry.label}>
                  <span className="audit-log-dashboard__listLabel">{entry.label}</span>
                  <span className="audit-log-dashboard__listValue">{entry.count}</span>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="audit-log-dashboard__panel audit-log-dashboard__panel--highlights">
          <header className="audit-log-dashboard__panelHeader">
            <h2>Destaques recentes</h2>
            <p>Últimos eventos com impacto operacional imediato.</p>
          </header>
          <ul className="audit-log-dashboard__highlights" role="list">
            {highlights.length === 0 ? (
              <li className="audit-log-dashboard__listEmpty">Sem destaques para mostrar.</li>
            ) : (
              highlights.map((item) => (
                <li key={item.id} data-tone={item.tone}>
                  <span className="audit-log-dashboard__highlightTitle">{item.label}</span>
                  <span className="audit-log-dashboard__highlightDescription">{item.description}</span>
                  <span className="audit-log-dashboard__highlightMeta">{item.createdAt}</span>
                </li>
              ))
            )}
          </ul>
        </article>
      </div>

      <section className="audit-log-dashboard__tableSection" aria-labelledby="audit-log-table-heading">
        <header className="audit-log-dashboard__tableHeader">
          <div>
            <h2 id="audit-log-table-heading">Eventos individuais</h2>
            <p>Filtra, pesquisa e exporta cada ação registada.</p>
          </div>
          <div className="audit-log-dashboard__filters">
            <label className="audit-log-dashboard__search">
              <Search size={16} aria-hidden className="audit-log-dashboard__searchIcon" />
              <span className="sr-only">Pesquisar por notas, alvo ou IP</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nota, alvo, IP, agente…"
                className="neo-input"
              />
            </label>
            <select
              value={kindFilter}
              onChange={(event) => setKindFilter(event.target.value)}
              className="neo-input"
              aria-label="Filtrar por tipo de evento"
            >
              <option value="">Todos os tipos</option>
              {meta?.kinds?.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
            <select
              value={targetFilter}
              onChange={(event) => setTargetFilter(event.target.value)}
              className="neo-input"
              aria-label="Filtrar por tipo de alvo"
            >
              <option value="">Todos os alvos</option>
              {meta?.targetTypes?.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={actorFilter}
              onChange={(event) => setActorFilter(event.target.value)}
              className="neo-input"
              aria-label="Filtrar por actor"
            >
              <option value="">Todos os actores</option>
              {meta?.actors?.map((actorOption) => (
                <option key={actorOption.id ?? actorOption.label ?? 'anon'} value={actorOption.id ?? ''}>
                  {actorOption.label ?? '—'}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className={clsx('neo-table-wrapper', listLoading && 'is-loading')} role="region" aria-live="polite">
          {listLoading && (
            <div className="neo-table__loading" role="status">
              <Spinner size={16} /> A carregar eventos…
            </div>
          )}

          {listError ? (
            <div className="audit-log-dashboard__empty" role="status">
              <span className="audit-log-dashboard__emptyIcon" aria-hidden>
                <AlertTriangle size={18} />
              </span>
              <p className="audit-log-dashboard__emptyTitle">Não foi possível carregar os eventos</p>
              <p className="audit-log-dashboard__emptyDescription">
                Tenta novamente. Se o erro persistir confirma as permissões do Supabase.
              </p>
              <Button variant="ghost" onClick={() => mutateList()}>
                Tentar novamente
              </Button>
            </div>
          ) : null}

          {!listError && (listData?.items?.length ?? 0) === 0 && !listLoading ? (
            <div className="audit-log-dashboard__empty" role="status">
              <span className="audit-log-dashboard__emptyIcon" aria-hidden>
                <Filter size={18} />
              </span>
              <p className="audit-log-dashboard__emptyTitle">Sem eventos a apresentar</p>
              <p className="audit-log-dashboard__emptyDescription">
                Ajusta os filtros ou espera por novas ações para monitorizar a atividade aqui.
              </p>
              {(kindFilter || targetFilter || actorFilter || debouncedSearch) && (
                <Button variant="ghost" onClick={() => {
                  setKindFilter('');
                  setTargetFilter('');
                  setActorFilter('');
                  setSearch('');
                }}>
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : null}

          {(listData?.items?.length ?? 0) > 0 && !listError && (
            <table className="neo-table audit-log-dashboard__table">
              <thead>
                <tr>
                  <th scope="col">Quando</th>
                  <th scope="col">Evento</th>
                  <th scope="col">Alvo</th>
                  <th scope="col">Actor</th>
                  <th scope="col">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {listData?.items?.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.created_at)}</td>
                    <td>
                      <div className="audit-log-dashboard__cellPrimary">
                        <strong>{row.kind ?? '—'}</strong>
                        <span>{row.action ?? row.category ?? '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="audit-log-dashboard__cellPrimary">
                        <strong>{row.target ?? '—'}</strong>
                        <span>{row.target_type ?? row.target_id ?? '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="audit-log-dashboard__cellPrimary">
                        <strong>{row.actor ?? '—'}</strong>
                        <span>{row.actor_id ?? '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="audit-log-dashboard__cellPrimary">
                        <strong>{describeDetails(row) ?? 'Sem nota'}</strong>
                        <span>{row.ip ?? row.user_agent ?? '—'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <footer className="audit-log-dashboard__pagination" aria-label="Paginação de eventos">
          <div className="audit-log-dashboard__paginationInfo">
            <span>
              Página {page} de {totalPages}
            </span>
            <span>
              {listData?.count ?? 0} evento{(listData?.count ?? 0) === 1 ? '' : 's'} registado{(listData?.count ?? 0) === 1 ? '' : 's'}
            </span>
          </div>
          <div className="audit-log-dashboard__paginationControls">
            <label className="audit-log-dashboard__pageSize">
              <span>Por página</span>
              <select
                value={String(pageSize)}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="neo-input"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={String(option)}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <div className="audit-log-dashboard__paginationButtons">
              <button
                type="button"
                className="btn"
                data-variant="ghost"
                onClick={() => canPrev && setPage((prev) => Math.max(1, prev - 1))}
                disabled={!canPrev}
              >
                Anterior
              </button>
              <button
                type="button"
                className="btn"
                data-variant="ghost"
                onClick={() => canNext && setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={!canNext}
              >
                Seguinte
              </button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
