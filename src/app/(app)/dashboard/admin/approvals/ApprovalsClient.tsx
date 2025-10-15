'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  CheckCircle2,
  Download,
  Printer,
  RefreshCcw,
  Search,
  Trash2,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import OpenInNewToggle from '@/components/ui/OpenInNewToggle';
import { useToast } from '@/components/ui/ToastProvider';
import { navigate } from '@/lib/nav';

type Status = 'pending' | 'approved' | 'rejected' | string;

type Row = {
  id: string;
  user_id: string;
  name?: string | null;
  email?: string | null;
  requested_at?: string | null;
  status?: Status | null;
};

type ApprovalsApiResponse = {
  rows?: Array<{
    id: string | number;
    user_id?: string | number | null;
    uid?: string | number | null;
    user?: string | number | null;
    name?: string | null;
    email?: string | null;
    requested_at?: string | null;
    created_at?: string | null;
    status?: string | null;
  }>;
  count?: number;
  _supabaseConfigured?: boolean;
  error?: string;
};

type Banner = { message: string; severity: 'info' | 'success' | 'warning' | 'error' };

type UndoState = { row: Row; timer?: number } | null;

const statusCopy: Record<string, { label: string; tone: 'warning' | 'success' | 'danger' | 'neutral' }> = {
  pending: { label: 'Pendente', tone: 'warning' },
  approved: { label: 'Aprovado', tone: 'success' },
  rejected: { label: 'Rejeitado', tone: 'danger' },
};

function statusLabel(status?: Status | null) {
  if (!status) return { label: '—', tone: 'neutral' as const };
  const normalized = String(status).toLowerCase();
  return statusCopy[normalized] ?? { label: status, tone: 'neutral' as const };
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

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function ApprovalsClient({ pageSize = 20 }: { pageSize?: number }) {
  const toast = useToast();
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('');
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
    const pending = rows.filter((row) => (row.status ?? 'pending').toLowerCase() === 'pending').length;
    const approved = rows.filter((row) => (row.status ?? '').toLowerCase() === 'approved').length;
    const rejected = rows.filter((row) => (row.status ?? '').toLowerCase() === 'rejected').length;
    return [
      { id: 'pending', label: 'Pendentes', value: pending, tone: 'warning' as const },
      { id: 'approved', label: 'Aprovados', value: approved, tone: 'success' as const },
      { id: 'rejected', label: 'Rejeitados', value: rejected, tone: 'danger' as const },
      { id: 'total', label: 'Total página', value: rows.length, tone: 'info' as const },
    ];
  }, [rows]);

  const fetchRows = React.useCallback(async () => {
    const search = q.trim();
    setLoading(true);
    setBanner(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSizeState));
      if (search) params.set('q', search);
      if (status) params.set('status', status);

      const response = await fetch(`/api/admin/approvals?${params.toString()}`, {
        cache: 'no-store',
        credentials: 'same-origin',
      });

      if (response.status === 401 || response.status === 403) {
        setRows([]);
        setCount(0);
        setBanner({
          severity: 'warning',
          message: 'Sessão expirada — autentica-te novamente para gerir os pedidos reais.',
        });
        return;
      }

      if (!response.ok) {
        throw new Error((await response.text()) || 'Falha ao carregar pedidos de aprovação.');
      }

      const payload = (await response.json()) as ApprovalsApiResponse;
      if (payload._supabaseConfigured === false) {
        setRows([]);
        setCount(0);
        setBanner({
          severity: 'info',
          message: 'Supabase não está configurado — assim que ligares a base de dados, os pedidos reais vão aparecer aqui.',
        });
        return;
      }

      const mapped: Row[] = (payload.rows ?? []).map((row) => ({
        id: String(row.id),
        user_id: String(row.user_id ?? row.uid ?? row.user ?? row.id ?? ''),
        name: row.name ?? null,
        email: row.email ?? null,
        requested_at: row.requested_at ?? row.created_at ?? null,
        status: (row.status ?? 'pending') as Status,
      }));

      setRows(mapped);
      setCount(payload.count ?? mapped.length);
      if (payload.error) {
        setBanner({ severity: 'warning', message: 'Alguns pedidos podem não estar disponíveis neste momento.' });
      }
    } catch (error: any) {
      setRows([]);
      setCount(0);
      setBanner({
        severity: 'error',
        message: error?.message || 'Falha ao carregar pedidos de aprovação. Tenta novamente em instantes.',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSizeState, q, status]);

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
    if (undoRef.current?.timer) {
      window.clearTimeout(undoRef.current.timer);
    }
  }, []);

  const scheduleUndoClear = React.useCallback(() => {
    if (undoRef.current?.timer) {
      window.clearTimeout(undoRef.current.timer);
    }
    if (undoRef.current) {
      undoRef.current.timer = window.setTimeout(() => {
        undoRef.current = null;
        forceUpdate();
      }, 6000);
    }
  }, []);

  const exportCSV = React.useCallback(() => {
    if (!rows.length) {
      toast.info('Não há pedidos para exportar neste momento.');
      return;
    }
    const header = ['id', 'user_id', 'name', 'email', 'status', 'requested_at'];
    const lines = [
      header.join(','),
      ...rows.map((row) => [
        row.id,
        row.user_id,
        row.name ?? '',
        row.email ?? '',
        row.status ?? '',
        row.requested_at ?? '',
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `approvals${status ? `-${status}` : ''}${q ? `-q-${q}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exportação iniciada.');
  }, [rows, status, q, toast]);

  const printList = React.useCallback(() => {
    if (!rows.length) {
      toast.info('Não há pedidos para imprimir.');
      return;
    }
    const win = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=700');
    if (!win) return;
    const body = rows.map((row) => {
      const cells = [
        row.name ?? '',
        row.email ?? '',
        statusLabel(row.status).label,
        row.requested_at ? formatDate(row.requested_at) : '',
      ].map((cell) => `<td>${String(cell)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const html = `<!doctype html>
<html lang="pt-PT">
<head>
<meta charSet="utf-8" />
<title>Aprovações</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:16px;color:#111827;background:#f8fafc;}
 h1{font-size:18px;margin:0 0 12px;font-weight:600;}
 table{width:100%;border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;}
 th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left;font-size:12px;}
 th{background:#eef2ff;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;font-size:11px;}
</style>
</head>
<body>
<h1>Pedidos de aprovação</h1>
<table>
<thead><tr><th>Nome</th><th>Email</th><th>Estado</th><th>Pedido em</th></tr></thead>
<tbody>${body}</tbody>
</table>
<script>window.addEventListener('load',function(){window.print();});</script>
</body>
</html>`;
    win.document.write(html);
    win.document.close();
  }, [rows, toast]);

  const approveRow = React.useCallback(async (row: Row) => {
    try {
      const res = await fetch(`/api/admin/approvals/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Aprovação concluída.');
      void fetchRows();
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao aprovar pedido.');
    }
  }, [fetchRows, toast]);

  const deleteRow = React.useCallback(async (row: Row) => {
    if (!window.confirm(`Remover pedido de ${row.email || row.name || row.id}?`)) return;

    setRows((prev) => prev.filter((item) => item.id !== row.id));
    const previousUndo = undoRef.current;
    if (previousUndo?.timer) window.clearTimeout(previousUndo.timer);
    undoRef.current = { row };
    forceUpdate();
    scheduleUndoClear();

    try {
      const res = await fetch(`/api/admin/approvals/${row.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      toast.info('Pedido removido.');
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao remover pedido.');
      undoRef.current = null;
      forceUpdate();
      setRows((prev) => [row, ...prev]);
    }
  }, [scheduleUndoClear, toast]);

  const undoDelete = React.useCallback(async () => {
    const state = undoRef.current;
    if (!state) return;
    if (state.timer) {
      window.clearTimeout(state.timer);
    }
    undoRef.current = null;
    forceUpdate();
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: state.row.user_id,
          name: state.row.name,
          email: state.row.email,
          status: state.row.status ?? 'pending',
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Pedido restaurado.');
      void fetchRows();
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao restaurar o pedido.');
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
        title="Gestão de aprovações"
        subtitle="Filtra, aprova ou rejeita rapidamente os pedidos de acesso de treinadores e clientes."
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
        <div
          className="neo-surface p-4"
          data-variant={toneForBanner(banner.severity)}
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-fg">{banner.message}</p>
        </div>
      )}

      <section className="neo-panel space-y-5" aria-label="Filtros e indicadores">
        <div className="neo-grid auto-fit min-[220px]:grid-cols-2 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="neo-surface neo-surface--interactive space-y-2 p-4" data-variant={metric.tone}>
              <span className="neo-surface__hint uppercase tracking-wide">{metric.label}</span>
              <span className="neo-surface__value text-2xl font-semibold text-fg">{metric.value}</span>
            </div>
          ))}
        </div>

        <div className="neo-grid auto-fit min-[260px]:grid-cols-2 lg:grid-cols-4" role="group" aria-label="Filtros de pesquisa">
          <label htmlFor="approvals-search" className="flex flex-col gap-2">
            <span className="neo-surface__hint uppercase tracking-wide">Pesquisa</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="approvals-search"
                type="search"
                className="neo-input pl-9"
                placeholder="Nome ou email"
                value={q}
                onChange={(event) => {
                  setQ(event.target.value);
                  setPage(0);
                }}
              />
            </div>
          </label>

          <label htmlFor="approvals-status" className="flex flex-col gap-2">
            <span className="neo-surface__hint uppercase tracking-wide">Estado</span>
            <select
              id="approvals-status"
              className="neo-input"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(0);
              }}
            >
              <option value="">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="rejected">Rejeitados</option>
            </select>
          </label>

          <label htmlFor="approvals-page-size" className="flex flex-col gap-2">
            <span className="neo-surface__hint uppercase tracking-wide">Linhas por página</span>
            <select
              id="approvals-page-size"
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

          <div className="flex flex-col justify-end gap-2">
            <span className="neo-surface__hint uppercase tracking-wide">Ajuda rápida</span>
            <Link
              href="/dashboard/admin/users"
              className="btn ghost"
              prefetch={false}
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              <span>Ver utilizadores</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="neo-panel space-y-4" aria-label="Tabela de pedidos">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="neo-panel__title">Pedidos activos</h2>
            <p className="neo-panel__subtitle">Actualiza em tempo real quando alteras filtros ou navegas pelas páginas.</p>
          </div>
          <span className="neo-tag" data-tone="primary" aria-live="polite">
            {count} {count === 1 ? 'pedido' : 'pedidos'}
          </span>
        </div>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Email</th>
                <th scope="col">Estado</th>
                <th scope="col">Pedido em</th>
                <th scope="col" className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted">A carregar pedidos…</td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted">
                    Nenhum pedido encontrado. Ajusta os filtros ou tenta novamente mais tarde.
                  </td>
                </tr>
              )}

              {!loading && rows.map((row) => {
                const { label, tone } = statusLabel(row.status);
                return (
                  <tr key={row.id}>
                    <td data-title="Nome">
                      <div className="flex flex-col">
                        <span className="font-semibold text-fg">{row.name ?? '—'}</span>
                        <span className="text-xs text-muted">ID: {row.user_id}</span>
                      </div>
                    </td>
                    <td data-title="Email">{row.email ?? '—'}</td>
                    <td data-title="Estado">
                      <span className="neo-table__status" data-state={tone}>{label}</span>
                    </td>
                    <td data-title="Pedido em">{row.requested_at ? formatDate(row.requested_at) : '—'}</td>
                    <td data-title="Ações" className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => navigate(`/dashboard/admin/users/${row.user_id}`, openInNew)}
                          title="Ver utilizador"
                        >
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => { void approveRow(row); }}
                          title="Aprovar"
                        >
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
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
                );
              })}
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
          <span className="text-sm font-medium text-fg">
            Pedido removido. Tens alguns segundos para desfazer.
          </span>
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
