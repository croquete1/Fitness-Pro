'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  Download,
  MailCheck,
  Printer,
  RefreshCcw,
  Trash2,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import OpenInNewToggle from '@/components/ui/OpenInNewToggle';
import { useToast } from '@/components/ui/ToastProvider';
import { navigate } from '@/lib/nav';

type Row = {
  id: string;
  user_id?: string | null;
  title?: string | null;
  body?: string | null;
  type?: string | null;
  read?: boolean | null;
  created_at?: string | null;
};

type Banner = { message: string; severity: 'info' | 'success' | 'warning' | 'error' };

type UndoState = { row: Row; timer?: number } | null;

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function toneForType(type?: string | null) {
  if (!type) return 'neutral';
  const normalized = type.toLowerCase();
  if (normalized.includes('alert') || normalized.includes('erro')) return 'danger';
  if (normalized.includes('reminder') || normalized.includes('check')) return 'warning';
  if (normalized.includes('info') || normalized.includes('update')) return 'info';
  if (normalized.includes('success') || normalized.includes('ok')) return 'success';
  return 'primary';
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return value ?? '—';
  }
}

function toneForBanner(severity: Banner['severity']) {
  switch (severity) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'danger';
    default:
      return 'info';
  }
}

export default function NotificationsClient({ pageSize = 20 }: { pageSize?: number }) {
  const toast = useToast();
  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState('');
  const [onlyUnread, setOnlyUnread] = React.useState(false);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [pageSizeState, setPageSizeState] = React.useState(pageSize);
  const [loading, setLoading] = React.useState(false);
  const [banner, setBanner] = React.useState<Banner | null>(null);
  const [openInNew, setOpenInNew] = React.useState(false);
  const undoRef = React.useRef<UndoState>(null);
  const [, forceUpdate] = React.useReducer((n) => n + 1, 0);

  const totalPages = React.useMemo(() => {
    const size = pageSizeState > 0 ? pageSizeState : pageSize;
    const pages = Math.ceil((count || 0) / size);
    return pages > 0 ? pages : 1;
  }, [count, pageSizeState, pageSize]);

  const metrics = React.useMemo(() => {
    const unread = rows.filter((row) => !row.read).length;
    const filterLabel = [
      type ? `Tipo: ${type}` : null,
      onlyUnread ? 'Só por ler' : null,
      q.trim() ? `Pesquisa activa` : null,
    ]
      .filter(Boolean)
      .join(' · ') || 'Sem filtros adicionais';
    return [
      { id: 'unread', label: 'Por ler (página)', value: unread, tone: 'warning' as const },
      { id: 'listed', label: 'Notificações listadas', value: rows.length, tone: 'primary' as const },
      { id: 'filters', label: 'Filtro activo', value: filterLabel, tone: 'info' as const },
    ];
  }, [rows, type, onlyUnread, q]);

  const fetchRows = React.useCallback(async () => {
    const search = q.trim();
    setLoading(true);
    setBanner(null);
    try {
      const u = new URL('/api/admin/notifications', window.location.origin);
      u.searchParams.set('page', String(page));
      u.searchParams.set('pageSize', String(pageSizeState));
      if (search) u.searchParams.set('q', search);
      if (type) u.searchParams.set('type', type);
      if (onlyUnread) u.searchParams.set('unread', 'true');

      const response = await fetch(u.toString(), { cache: 'no-store', credentials: 'same-origin' });
      if (response.status === 401 || response.status === 403) {
        setRows([]);
        setCount(0);
        setBanner({ severity: 'warning', message: 'Sessão expirada — inicia sessão novamente para ver notificações reais.' });
        return;
      }
      if (!response.ok) {
        throw new Error((await response.text()) || 'Falha ao carregar notificações.');
      }

      const payload = await response.json();
      setRows(
        (payload.rows ?? []).map((n: any) => ({
          id: String(n.id),
          user_id: n.user_id ?? n.uid ?? null,
          title: n.title ?? n.subject ?? '',
          body: n.body ?? n.message ?? '',
          type: n.type ?? n.kind ?? '',
          read: Boolean(n.read ?? n.is_read ?? false),
          created_at: n.created_at ?? null,
        })),
      );
      setCount(payload.count ?? 0);
    } catch (error: any) {
      setRows([]);
      setCount(0);
      setBanner({ severity: 'error', message: error?.message || 'Falha ao carregar notificações.' });
    } finally {
      setLoading(false);
    }
  }, [q, type, onlyUnread, page, pageSizeState]);

  React.useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  React.useEffect(() => {
    const size = pageSizeState > 0 ? pageSizeState : pageSize;
    const pages = Math.ceil((count || 0) / size);
    if (page >= pages && pages > 0) {
      setPage(Math.max(0, pages - 1));
    }
  }, [count, page, pageSizeState, pageSize]);

  React.useEffect(() => () => {
    if (undoRef.current?.timer) window.clearTimeout(undoRef.current.timer);
  }, []);

  const scheduleUndoClear = React.useCallback(() => {
    if (undoRef.current?.timer) window.clearTimeout(undoRef.current.timer);
    if (undoRef.current) {
      undoRef.current.timer = window.setTimeout(() => {
        undoRef.current = null;
        forceUpdate();
      }, 6000);
    }
  }, []);

  const exportCSV = React.useCallback(() => {
    if (!rows.length) {
      toast.info('Não há notificações para exportar.');
      return;
    }
    const header = ['id', 'title', 'type', 'read', 'created_at', 'body'];
    const lines = [
      header.join(','),
      ...rows.map((row) => [
        row.id,
        row.title ?? '',
        row.type ?? '',
        row.read ? 'true' : 'false',
        row.created_at ?? '',
        (row.body ?? '').replace(/\r?\n/g, ' '),
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications${type ? `-${type}` : ''}${onlyUnread ? '-unread' : ''}${q ? `-q-${q}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exportação iniciada.');
  }, [rows, type, onlyUnread, q, toast]);

  const printList = React.useCallback(() => {
    if (!rows.length) {
      toast.info('Não há notificações para imprimir.');
      return;
    }
    const win = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=700');
    if (!win) return;
    const body = rows.map((row) => {
      const cells = [
        row.title ?? '',
        row.type ?? '',
        row.read ? 'Sim' : 'Não',
        row.created_at ? formatDate(row.created_at) : '',
        (row.body ?? '').replace(/\r?\n/g, ' '),
      ].map((cell) => `<td>${String(cell)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const html = `<!doctype html>
<html lang="pt-PT">
<head>
<meta charSet="utf-8" />
<title>Notificações</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:16px;color:#111827;background:#f8fafc;}
 h1{font-size:18px;margin:0 0 12px;font-weight:600;}
 table{width:100%;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;}
 th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left;font-size:12px;}
 th{background:#eef2ff;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;font-size:11px;}
 td:last-child{max-width:360px;}
</style>
</head>
<body>
<h1>Notificações</h1>
<table>
<thead><tr><th>Título</th><th>Tipo</th><th>Lida</th><th>Criada</th><th>Mensagem</th></tr></thead>
<tbody>${body}</tbody>
</table>
<script>window.addEventListener('load',function(){window.print();});</script>
</body>
</html>`;
    win.document.write(html);
    win.document.close();
  }, [rows, toast]);

  const markAsRead = React.useCallback(async (row: Row) => {
    try {
      const res = await fetch(`/api/admin/notifications/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Notificação marcada como lida.');
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, read: true } : item)));
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao marcar notificação.');
    }
  }, [toast]);

  const deleteRow = React.useCallback(async (row: Row) => {
    if (!window.confirm(`Remover notificação "${row.title || row.id}"?`)) return;
    setRows((prev) => prev.filter((item) => item.id !== row.id));
    if (undoRef.current?.timer) window.clearTimeout(undoRef.current.timer);
    undoRef.current = { row };
    forceUpdate();
    scheduleUndoClear();
    try {
      const res = await fetch(`/api/admin/notifications/${row.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      toast.info('Notificação removida.');
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao remover notificação.');
      undoRef.current = null;
      forceUpdate();
      setRows((prev) => [row, ...prev]);
    }
  }, [scheduleUndoClear, toast]);

  const undoDelete = React.useCallback(async () => {
    const state = undoRef.current;
    if (!state) return;
    if (state.timer) window.clearTimeout(state.timer);
    undoRef.current = null;
    forceUpdate();
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: state.row.user_id ?? null,
          title: state.row.title ?? '',
          body: state.row.body ?? '',
          type: state.row.type ?? 'info',
          read: Boolean(state.row.read),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Notificação restaurada.');
      void fetchRows();
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao restaurar notificação.');
    }
  }, [fetchRows, toast]);

  const clearUndo = React.useCallback(() => {
    const state = undoRef.current;
    if (state?.timer) window.clearTimeout(state.timer);
    undoRef.current = null;
    forceUpdate();
  }, []);

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 lg:px-12">
      <PageHeader
        title="Centro de notificações"
        subtitle="Monitoriza alertas transaccionais, campanhas e mensagens de sistema com visual futurista."
        actions={(
          <div className="neo-quick-actions flex-wrap">
            <OpenInNewToggle checked={openInNew} onChange={setOpenInNew} label="Abrir perfis noutra aba" />
            <button
              type="button"
              className="btn ghost"
              onClick={() => { void fetchRows(); }}
              disabled={loading}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              <span>Actualizar</span>
            </button>
            <button
              type="button"
              className="btn"
              onClick={exportCSV}
              disabled={!rows.length}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Exportar CSV</span>
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={printList}
              disabled={!rows.length}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              <span>Imprimir</span>
            </button>
          </div>
        )}
      />

      {banner && (
        <div className="neo-surface p-4" data-variant={toneForBanner(banner.severity)} role="status" aria-live="polite">
          <p className="text-sm font-medium text-fg">{banner.message}</p>
        </div>
      )}

      <section className="neo-panel space-y-5" aria-label="Indicadores e filtros">
        <div className="neo-grid auto-fit min-[220px]:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <article key={metric.id} className="neo-surface neo-surface--interactive space-y-2 p-4" data-variant={metric.tone}>
              <span className="neo-surface__hint uppercase tracking-wide">{metric.label}</span>
              <span className="neo-surface__value text-2xl font-semibold text-fg">{metric.value}</span>
            </article>
          ))}
        </div>

        <div className="neo-grid auto-fit min-[260px]:grid-cols-2 xl:grid-cols-4" role="group" aria-label="Filtros de notificações">
          <label htmlFor="notifications-search" className="flex flex-col gap-2">
            <span className="neo-surface__hint uppercase tracking-wide">Pesquisar</span>
            <input
              id="notifications-search"
              type="search"
              className="neo-input"
              placeholder="Título ou conteúdo"
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                setPage(0);
              }}
            />
          </label>

          <label htmlFor="notifications-type" className="flex flex-col gap-2">
            <span className="neo-surface__hint uppercase tracking-wide">Tipo</span>
            <input
              id="notifications-type"
              type="text"
              className="neo-input"
              placeholder="ex.: alert, info, campaign"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setPage(0);
              }}
            />
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="neo-toggle"
              role="switch"
              data-state={onlyUnread ? 'on' : 'off'}
              aria-checked={onlyUnread}
              onChange={(event) => {
                setOnlyUnread(event.target.checked);
                setPage(0);
              }}
            />
            <span className="neo-surface__hint uppercase tracking-wide">Apenas por ler</span>
          </label>

          <label htmlFor="notifications-page-size" className="flex flex-col gap-2">
            <span className="neo-surface__hint uppercase tracking-wide">Linhas por página</span>
            <select
              id="notifications-page-size"
              className="neo-input"
              value={pageSizeState}
              onChange={(event) => {
                const next = Number(event.target.value) || pageSize;
                setPageSizeState(next);
                setPage(0);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="neo-panel space-y-4" aria-label="Tabela de notificações">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="neo-panel__title">Histórico de envios</h2>
            <p className="neo-panel__subtitle">Visualiza em detalhe as mensagens entregues recentemente.</p>
          </div>
          <span className="neo-tag" data-tone="primary">
            {count} {count === 1 ? 'notificação' : 'notificações'}
          </span>
        </div>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Tipo</th>
                <th scope="col">Estado</th>
                <th scope="col">Criada em</th>
                <th scope="col">Mensagem</th>
                <th scope="col" className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted">A carregar notificações…</td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted">
                    Nenhuma notificação encontrada. Ajusta os filtros ou cria uma nova campanha.
                  </td>
                </tr>
              )}

              {!loading && rows.map((row) => (
                <tr key={row.id}>
                  <td data-title="Título">
                    <div className="flex flex-col">
                      <span className="font-semibold text-fg">{row.title || '—'}</span>
                      {row.user_id && (
                        <button
                          type="button"
                          className="btn ghost mt-1 w-fit"
                          onClick={() => navigate(`/dashboard/admin/users/${row.user_id}`, openInNew)}
                        >
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" /> Ver utilizador
                        </button>
                      )}
                    </div>
                  </td>
                  <td data-title="Tipo">
                    <span className="neo-tag" data-tone={toneForType(row.type)}>{row.type || '—'}</span>
                  </td>
                  <td data-title="Estado">
                    <span className="neo-table__status" data-state={row.read ? 'success' : 'warning'}>
                      {row.read ? 'Lida' : 'Por ler'}
                    </span>
                  </td>
                  <td data-title="Criada em">{row.created_at ? formatDate(row.created_at) : '—'}</td>
                  <td data-title="Mensagem">
                    <p className="line-clamp-2 text-sm text-muted">{row.body || '—'}</p>
                  </td>
                  <td data-title="Ações" className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => { void markAsRead(row); }}
                        disabled={Boolean(row.read)}
                        title="Marcar como lida"
                      >
                        <MailCheck className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="btn ghost"
                        data-danger="true"
                        onClick={() => { void deleteRow(row); }}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted">
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn ghost"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0 || loading}
            >
              Anterior
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1 || loading}
            >
              Seguinte
            </button>
          </div>
        </div>
      </section>

      {undoRef.current && (
        <div className="neo-panel neo-panel--compact flex flex-wrap items-center justify-between gap-3" role="status">
          <span className="text-sm font-medium text-fg">Notificação removida. Desejas desfazer?</span>
          <div className="flex items-center gap-2">
            <button type="button" className="btn" onClick={() => { void undoDelete(); }}>
              Desfazer
            </button>
            <button type="button" className="btn ghost" onClick={clearUndo}>
              Ignorar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
