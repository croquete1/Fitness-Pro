"use client";

import * as React from 'react';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { describeType } from '@/lib/notifications/dashboard';
import type { NotificationDashboardData, NotificationRow } from '@/lib/notifications/types';

type StatusFilter = 'all' | 'unread' | 'read';
type MarkEndpoint = 'mark-read' | 'mark-unread' | 'mark-all-read';

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'Por ler' },
  { value: 'read', label: 'Lidas' },
];

function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('pt-PT', options).format(value);
}

function formatPercentage(value: number) {
  return `${formatNumber(value, { maximumFractionDigits: 1, minimumFractionDigits: value % 1 === 0 ? 0 : 1 })}%`;
}

function formatDateTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelative(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const rtf = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });
  const minutes = Math.round(diffMs / 60000);
  const hours = Math.round(diffMs / 3600000);
  const days = Math.round(diffMs / 86400000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  if (Math.abs(hours) < 48) return rtf.format(hours, 'hour');
  return rtf.format(days, 'day');
}

function formatDayLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}

function computeMetricCards(metrics: NotificationDashboardData['metrics']) {
  const unreadShare = metrics.total > 0 ? Math.round((metrics.unread / metrics.total) * 100) : 0;
  return [
    {
      key: 'total',
      label: 'Total entregues',
      value: formatNumber(metrics.total),
      hint: metrics.lastDeliveryAt ? `Última: ${formatRelative(metrics.lastDeliveryAt)}` : 'Sem envios',
      variant: 'neutral' as const,
    },
    {
      key: 'unread',
      label: 'Por ler',
      value: formatNumber(metrics.unread),
      hint: `${unreadShare}% do total`,
      variant: metrics.unread > 0 ? ('warning' as const) : ('success' as const),
    },
    {
      key: 'delivered7d',
      label: 'Envios (7d)',
      value: formatNumber(metrics.delivered7d),
      hint:
        metrics.delivered7d > 0
          ? `Leitura: ${formatPercentage(metrics.readRate7d)}`
          : 'Sem envios nos últimos 7 dias',
      delta: metrics.delivered7dDelta ?? null,
      variant: 'primary' as const,
    },
    {
      key: 'average',
      label: 'Média diária (14d)',
      value: formatNumber(metrics.averagePerDay14d, { maximumFractionDigits: 1 }),
      hint: metrics.busiestHourLabel ? `Hora de pico: ${metrics.busiestHourLabel}` : 'Sem dados suficientes',
      variant: 'teal' as const,
    },
  ];
}

type Props = NotificationDashboardData;

export default function NotificationsClient({ initialRows, initialTotal, metrics }: Props) {
  const [data, setData] = React.useState<NotificationRow[]>(initialRows);
  const [total, setTotal] = React.useState<number>(initialTotal);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');
  const deferredSearch = React.useDeferredValue(search);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(25);
  const [selection, setSelection] = React.useState<Set<string>>(new Set());
  const [current, setCurrent] = React.useState<NotificationRow | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    setData(initialRows);
    setTotal(initialTotal);
  }, [initialRows, initialTotal]);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    (async () => {
      try {
        const url = new URL('/api/notifications/list', window.location.origin);
        url.searchParams.set('status', status);
        url.searchParams.set('page', String(page));
        url.searchParams.set('pageSize', String(pageSize));
        if (typeFilter && typeFilter !== 'all') url.searchParams.set('type', typeFilter);
        if (deferredSearch) url.searchParams.set('q', deferredSearch);
        const response = await fetch(url.toString(), { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const json = (await response.json()) as { items: NotificationRow[]; total: number };
        if (controller.signal.aborted) return;
        setData(json.items ?? []);
        setTotal(json.total ?? 0);
        setSelection(new Set());
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('[notifications] erro a carregar lista', error);
        setData([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      controller.abort();
    };
  }, [status, page, pageSize, typeFilter, deferredSearch]);

  React.useEffect(() => {
    setPage(0);
  }, [status, deferredSearch, pageSize, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  React.useEffect(() => {
    const nextTotalPages = Math.max(1, Math.ceil(total / pageSize));
    if (page > nextTotalPages - 1) {
      setPage(nextTotalPages - 1);
    }
  }, [total, page, pageSize]);

  const selectedIds = React.useMemo(() => Array.from(selection), [selection]);

  const mark = React.useCallback(
    async (endpoint: MarkEndpoint, ids?: string[]) => {
      if (endpoint !== 'mark-all-read' && (!ids || ids.length === 0)) {
        return;
      }
      try {
        await fetch(`/api/notifications/${endpoint}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ids }),
        });
        setData((prev) => {
          if (endpoint === 'mark-all-read') {
            return prev.map((row) => ({ ...row, read: true }));
          }
          return prev.map((row) => {
            if (!ids?.includes(row.id)) return row;
            if (endpoint === 'mark-read') return { ...row, read: true };
            if (endpoint === 'mark-unread') return { ...row, read: false };
            return row;
          });
        });
        setSelection(new Set());
        setCurrent((prev) => {
          if (!prev) return prev;
          if (endpoint === 'mark-all-read') return { ...prev, read: true };
          if (ids?.includes(prev.id)) {
            return { ...prev, read: endpoint === 'mark-read' };
          }
          return prev;
        });
      } catch (error) {
        console.error('[notifications] erro a actualizar estado', error);
      }
    },
    [],
  );

  const openRow = React.useCallback(
    (row: NotificationRow) => {
      setCurrent(row);
      setModalOpen(true);
      if (!row.read) {
        void mark('mark-read', [row.id]);
      }
    },
    [mark],
  );

  const toggleSelection = React.useCallback((id: string, checked: boolean) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const metricsCards = React.useMemo(() => computeMetricCards(metrics), [metrics]);

  const typeOptions = React.useMemo(() => {
    const options = metrics.categories.map((category) => ({
      key: category.type,
      label: category.label,
      count: category.total,
    }));
    options.unshift({ key: 'all', label: 'Todos os tipos', count: metrics.total });
    return options;
  }, [metrics]);

  const maxTimelineValue = React.useMemo(
    () => metrics.timeline.reduce((acc, point) => Math.max(acc, point.sent, point.read), 0),
    [metrics.timeline],
  );

  return (
    <div className="notifications-dashboard">
      <section className="neo-panel notifications-dashboard__panel" aria-labelledby="notifications-heading">
        <header className="notifications-dashboard__header">
          <div className="notifications-dashboard__heading">
            <h1 id="notifications-heading" className="notifications-dashboard__title">
              Centro de notificações
            </h1>
            <p className="notifications-dashboard__subtitle">
              Revê alertas operacionais, acompanha métricas de leitura e mantém o histórico organizado.
            </p>
          </div>
          <div className="notifications-dashboard__headerMeta">
            <span
              className="neo-tag"
              data-tone={metrics.supabase ? 'success' : 'warning'}
              aria-live="polite"
            >
              {metrics.supabase ? 'Sincronizado com o servidor' : 'Modo demonstração'}
            </span>
            <span className="notifications-dashboard__lastDelivery">
              Última entrega: {formatRelative(metrics.lastDeliveryAt)}
            </span>
          </div>
        </header>

        <div className="notifications-dashboard__metrics neo-grid neo-grid--metricsSm">
          {metricsCards.map((metric) => (
            <article
              key={metric.key}
              className="neo-surface neo-surface--padded notifications-dashboard__metric"
              data-variant={metric.variant}
            >
              <header className="notifications-dashboard__metricHeader">
                <span className="notifications-dashboard__metricLabel">{metric.label}</span>
                {metric.key === 'delivered7d' && typeof metric.delta === 'number' && metric.delta !== 0 ? (
                  <span
                    className="notifications-dashboard__metricDelta"
                    data-positive={metric.delta > 0 || undefined}
                    data-negative={metric.delta < 0 || undefined}
                  >
                    {metric.delta > 0 ? `+${metric.delta}` : metric.delta}
                  </span>
                ) : null}
              </header>
              <div className="notifications-dashboard__metricValue">{metric.value}</div>
              {metric.hint ? (
                <p className="notifications-dashboard__metricHint">{metric.hint}</p>
              ) : null}
            </article>
          ))}
        </div>

        <div className="notifications-dashboard__insights">
          <section className="neo-surface neo-surface--padded notifications-dashboard__timelineSection" aria-label="Envios dos últimos 14 dias">
            <header className="notifications-dashboard__sectionHeader">
              <h2 className="notifications-dashboard__sectionTitle">Actividade recente</h2>
              <div className="notifications-dashboard__timelineLegend" aria-hidden="true">
                <span data-tone="sent">Enviadas</span>
                <span data-tone="read">Lidas</span>
              </div>
            </header>
            <div className="notifications-dashboard__timeline" role="list">
              {metrics.timeline.map((point) => {
                const sentHeight = maxTimelineValue > 0 ? Math.round((point.sent / maxTimelineValue) * 100) : 0;
                const readHeight = maxTimelineValue > 0 ? Math.round((point.read / maxTimelineValue) * 100) : 0;
                return (
                  <div
                    key={point.date}
                    className="notifications-dashboard__timelineItem"
                    role="listitem"
                    aria-label={`${formatDayLabel(point.date)} · ${point.sent} enviadas · ${point.read} lidas`}
                    title={`${formatDayLabel(point.date)} · ${point.sent} enviadas · ${point.read} lidas`}
                  >
                    <div className="notifications-dashboard__timelineBars" aria-hidden="true">
                      <span className="notifications-dashboard__timelineBar" data-tone="sent" style={{ height: `${sentHeight}%` }} />
                      <span className="notifications-dashboard__timelineBar" data-tone="read" style={{ height: `${readHeight}%` }} />
                    </div>
                    <span className="notifications-dashboard__timelineLabel">{formatDayLabel(point.date)}</span>
                    <span className="notifications-dashboard__timelineValue">{formatNumber(point.sent)}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="neo-surface neo-surface--padded notifications-dashboard__categoriesSection" aria-label="Distribuição por tipo">
            <header className="notifications-dashboard__sectionHeader">
              <h2 className="notifications-dashboard__sectionTitle">Tipos mais enviados</h2>
            </header>
            <ul className="notifications-dashboard__categories">
              {metrics.categories.length === 0 ? (
                <li className="notifications-dashboard__empty">Sem dados suficientes</li>
              ) : (
                metrics.categories.map((category) => (
                  <li key={category.type} className="notifications-dashboard__category">
                    <div className="notifications-dashboard__categoryHeader">
                      <span className="neo-tag" data-tone={category.tone}>
                        {category.label}
                      </span>
                      <span className="notifications-dashboard__categoryCount">{formatNumber(category.total)}</span>
                    </div>
                    <div className="notifications-dashboard__categoryBar" role="presentation">
                      <span
                        className="notifications-dashboard__categoryFill"
                        style={{ width: `${Math.min(100, category.percentage)}%` }}
                      />
                    </div>
                    <div className="notifications-dashboard__categoryMeta">
                      <span>{formatPercentage(category.readRate)} lidas</span>
                      <span>{formatNumber(category.unread)} por ler</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <div className="notifications-dashboard__controls" role="region" aria-label="Controlos de filtragem">
          <div className="notifications-dashboard__status" role="group" aria-label="Filtrar por estado">
            {STATUS_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                variant={status === filter.value ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatus(filter.value)}
                aria-pressed={status === filter.value}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <div className="notifications-dashboard__search">
            <label className="neo-input-group__field">
              <span className="neo-input-group__label">Pesquisar</span>
              <input
                type="search"
                className="neo-input"
                placeholder="Título ou conteúdo..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>
          <div className="notifications-dashboard__types" role="radiogroup" aria-label="Filtrar por tipo">
            <div className="neo-segmented notifications-dashboard__typesSegment">
              {typeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className="neo-segmented__btn"
                  data-active={typeFilter === option.key}
                  onClick={() => setTypeFilter(option.key)}
                  role="radio"
                  aria-checked={typeFilter === option.key}
                  tabIndex={typeFilter === option.key ? 0 : -1}
                >
                  <span className="notifications-dashboard__typesLabel">{option.label}</span>
                  <span className="neo-segmented__count">{formatNumber(option.count)}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="notifications-dashboard__actions">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => mark('mark-read', selectedIds)}
              disabled={!selectedIds.length}
            >
              Marcar selecionadas como lidas
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => mark('mark-unread', selectedIds)}
              disabled={!selectedIds.length}
            >
              Marcar selecionadas como por ler
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => mark('mark-all-read')}>
              Marcar tudo como lido
            </Button>
          </div>
        </div>

        <div className="notifications-dashboard__table" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th className="notifications-dashboard__cellSelect">
                  <span className="sr-only">Selecionar</span>
                </th>
                <th>Notificação</th>
                <th>Tipo</th>
                <th>Data</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5}>
                    <div className="notifications-dashboard__loading" aria-live="assertive">
                      <Spinner size={16} /> A carregar notificações…
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !data.length && (
                <tr>
                  <td colSpan={5}>
                    <div className="neo-empty">
                      <span className="neo-empty__icon" aria-hidden>
                        🔕
                      </span>
                      <p className="neo-empty__title">Sem notificações</p>
                      <p className="neo-empty__description">
                        Quando receberes novos alertas, eles aparecem aqui automaticamente.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                data.map((row) => {
                  const formattedDate = formatDateTime(row.created_at);
                  const typeMeta = describeType(row.type ?? null);
                  return (
                    <tr
                      key={row.id}
                      className="notifications-dashboard__row"
                      data-read={row.read || undefined}
                      onClick={() => openRow(row)}
                    >
                      <td
                        className="notifications-dashboard__cellSelect"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="neo-checkbox"
                          checked={selection.has(row.id)}
                          onChange={(event) => toggleSelection(row.id, event.target.checked)}
                          aria-label="Selecionar notificação"
                        />
                      </td>
                      <td>
                        <div className="notifications-dashboard__message">
                          <span className="notifications-dashboard__messageTitle">{row.title || '(sem título)'}</span>
                          {row.body && (
                            <span className="notifications-dashboard__messageExcerpt">{row.body}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="neo-tag" data-tone={typeMeta.tone}>
                          {typeMeta.label}
                        </span>
                      </td>
                      <td className="notifications-dashboard__timestamp">{formattedDate}</td>
                      <td>
                        <span className="neo-tag" data-tone={row.read ? 'success' : 'warning'}>
                          {row.read ? 'Lida' : 'Por ler'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <footer className="notifications-dashboard__footer" aria-label="Paginação">
          <div className="notifications-dashboard__paginationSummary">
            Página {page + 1} de {totalPages} · {formatNumber(total)} registo(s)
          </div>
          <div className="notifications-dashboard__paginationControls">
            <Button type="button" variant="ghost" size="sm" onClick={() => setPage(0)} disabled={page === 0}>
              «
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
            >
              Seguinte
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
            >
              »
            </Button>
            <label className="neo-input-group__field notifications-dashboard__pageSize">
              <span className="neo-input-group__label">Por página</span>
              <select
                className="neo-input"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </footer>
      </section>

      <Modal
        open={modalOpen && !!current}
        onClose={() => setModalOpen(false)}
        title={current?.title || 'Notificação'}
        size="md"
      >
        <div className="notifications-dashboard__modal">
          <div className="notifications-dashboard__modalTimestamp">
            {current?.created_at ? formatDateTime(current.created_at) : '—'}
          </div>
          <div className="notifications-dashboard__modalBody">{current?.body || '—'}</div>
          {current?.href && (
            <Link href={current.href} className="btn" prefetch={false}>
              Abrir destino
            </Link>
          )}
          <div className="notifications-dashboard__modalActions">
            {!current?.read ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => current && mark('mark-read', [current.id])}
              >
                Marcar como lida
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => current && mark('mark-unread', [current.id])}
              >
                Marcar por ler
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
