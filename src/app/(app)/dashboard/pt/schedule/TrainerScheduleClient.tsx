'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import SessionFormClient from './SessionFormClient';
import { useTrainerPtsCounts } from '@/lib/hooks/usePtsCounts';

export type Row = {
  id: string;
  start_time?: string | null;
  end_time?: string | null;
  status?: 'scheduled' | 'done' | 'cancelled' | string | null;
  trainer_id?: string | null;
  client_id?: string | null;
  location?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Todos os estados' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'done', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

type StatusTone = 'ok' | 'warn' | 'down';

type Slot = { day: string; start: string; end: string };

type IconProps = { className?: string };

function statusLabel(value: string | null | undefined) {
  if (!value) return '—';
  const normalized = value.toString().trim().toLowerCase();
  switch (normalized) {
    case 'scheduled':
      return 'Agendado';
    case 'done':
      return 'Concluído';
    case 'cancelled':
      return 'Cancelado';
    default:
      return value;
  }
}

function statusTone(value: string | null | undefined): StatusTone {
  if (!value) return 'warn';
  const normalized = value.toString().trim().toLowerCase();
  if (normalized === 'done' || normalized === 'completed') return 'ok';
  if (normalized === 'cancelled') return 'down';
  return 'warn';
}

function formatSlot(row: Row): Slot {
  if (!row.start_time) {
    return { day: 'Por agendar', start: '—', end: row.end_time ? formatTime(row.end_time) : '—' };
  }
  const start = new Date(row.start_time);
  const day = start
    .toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })
    .replace('.', '')
    .toUpperCase();
  const end = row.end_time ? formatTime(row.end_time) : '—';
  return { day, start: formatTime(row.start_time), end };
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-PT');
}

function StatusPill({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span className="status-pill" data-state={tone}>
      {label}
    </span>
  );
}

function RefreshIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={className}
      aria-hidden
    >
      <path
        d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-8.66 6H5a1 1 0 0 1 0 2H2a1 1 0 0 1-1-1V4a1 1 0 0 1 2 0v1.18A11 11 0 0 1 12 1a11 11 0 1 1-10.95 12h2A9 9 0 1 0 21 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={className}
      aria-hidden
    >
      <path d="M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PrintIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={className}
      aria-hidden
    >
      <path
        d="M6 9V4h12v5M6 18h12v4H6z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x={4} y={9} width={16} height={8} rx={2} ry={2} />
      <path d="M7 12h.01M17 12h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="neo-dialog-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="neo-dialog">
        <header className="neo-dialog__header">
          <div>
            <span className="neo-surface__hint uppercase tracking-wide text-xs">{title}</span>
            <h2 className="neo-dialog__title">{title}</h2>
          </div>
          <button type="button" className="btn icon" onClick={onClose} aria-label="Fechar">
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>
        <div className="neo-dialog__content">{children}</div>
      </div>
    </div>
  );
}

export default function TrainerScheduleClient({ pageSize = 20 }: { pageSize?: number }) {
  const router = useRouter();
  const [status, setStatus] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({ page: 0, pageSize });
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const { today, next7, loading: loadingCounts } = useTrainerPtsCounts();

  const fetchRows = React.useCallback(async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/trainer/pts-schedule', window.location.origin);
      url.searchParams.set('page', String(pagination.page));
      url.searchParams.set('pageSize', String(pagination.pageSize));
      if (status) url.searchParams.set('status', status);

      const response = await fetch(url.toString(), { cache: 'no-store' });
      if (!response.ok) throw new Error(await response.text());
      const json = await response.json();
      const source: any[] = Array.isArray(json?.rows)
        ? json.rows
        : Array.isArray(json?.items)
        ? json.items
        : Array.isArray(json?.data)
        ? json.data
        : [];

      const mapped = source.map((row: any): Row => ({
        id: String(row?.id ?? crypto.randomUUID()),
        start_time: row?.start_time ?? row?.start ?? row?.starts_at ?? row?.scheduled_at ?? null,
        end_time: row?.end_time ?? row?.end ?? row?.ends_at ?? null,
        status: row?.status ?? row?.state ?? null,
        trainer_id: row?.trainer_id ?? row?.pt_id ?? null,
        client_id: row?.client_id ?? row?.member_id ?? null,
        location: row?.location ?? row?.place ?? null,
        notes: row?.notes ?? null,
        created_at: row?.created_at ?? null,
      }));

      setRows(mapped);
      setCount(Number(json?.count ?? mapped.length));
    } catch (err) {
      console.error('[trainer schedule] load failed', err);
      setRows([]);
      setCount(0);
      setError('Não foi possível sincronizar a agenda.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, status]);

  React.useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  const filteredRows = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => {
      const haystack = [row.client_id, row.location, row.status, row.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, query]);

  const statusMessage = React.useMemo(() => {
    if (loading) return 'A sincronizar…';
    if (error) return 'Falha ao sincronizar';
    if (filteredRows.length === 0) return 'Sem sessões visíveis';
    if (query.trim()) return `${filteredRows.length} resultado(s)`;
    return `${count} registo(s)`;
  }, [loading, error, filteredRows.length, query, count]);

  const statusState: StatusTone = loading ? 'warn' : error ? 'down' : 'ok';

  const totalPages = Math.max(1, Math.ceil(Math.max(count, 1) / pagination.pageSize));
  const currentPage = Math.min(pagination.page, totalPages - 1);
  const rangeStart = count === 0 ? 0 : currentPage * pagination.pageSize + 1;
  const rangeEnd = count === 0 ? 0 : Math.min(count, rangeStart + pagination.pageSize - 1);

  const handleDelete = React.useCallback(
    async (id: string) => {
      if (!window.confirm('Remover sessão?')) return;
      setDeletingId(id);
      try {
        const response = await fetch(`/api/trainer/pts-schedule/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(await response.text());
        await fetchRows();
      } catch (err) {
        console.error('[trainer schedule] delete failed', err);
        setError('Não foi possível remover a sessão.');
      } finally {
        setDeletingId(null);
      }
    },
    [fetchRows],
  );

  const exportCSV = React.useCallback(() => {
    const header = ['id', 'start_time', 'end_time', 'status', 'client_id', 'location', 'notes', 'created_at'];
    const lines = [
      header.join(','),
      ...filteredRows.map((row) =>
        [
          row.id,
          row.start_time ?? '',
          row.end_time ?? '',
          row.status ?? '',
          row.client_id ?? '',
          row.location ?? '',
          (row.notes ?? '').replace(/\r?\n/g, ' '),
          row.created_at ?? '',
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agenda-pt${status ? `-${status}` : ''}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredRows, status]);

  const printList = React.useCallback(() => {
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=1100,height=760');
    if (!popup) return;
    const rowsHtml = filteredRows
      .map((row) => {
        const slot = formatSlot(row);
        const cells = [
          `${slot.day} — ${slot.start} → ${slot.end}`,
          row.client_id ?? '—',
          row.location ?? '—',
          statusLabel(row.status ?? null),
          (row.notes ?? '').replace(/\r?\n/g, ' '),
        ]
          .map((cell) => `<td>${String(cell)}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Agenda do PT</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 24px; color: #0f172a; }
            h1 { font-size: 20px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 13px; text-align: left; }
            th { background: #f1f5f9; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; }
            tr:nth-child(even) td { background: #f8fafc; }
            footer { margin-top: 16px; font-size: 12px; color: #475569; }
            @media print { @page { margin: 12mm; } }
          </style>
        </head>
        <body>
          <h1>Agenda do Personal Trainer</h1>
          <table>
            <thead>
              <tr>
                <th>Horário</th>
                <th>Cliente</th>
                <th>Local</th>
                <th>Estado</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <footer>Exportado em ${new Date().toLocaleString('pt-PT')}</footer>
          <script>window.onload = function(){ window.print(); };</script>
        </body>
      </html>
    `;

    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  }, [filteredRows]);

  const handleCreateSuccess = React.useCallback(() => {
    setCreateOpen(false);
    void fetchRows();
  }, [fetchRows]);

  return (
    <div className="space-y-6">
      <section className="neo-panel space-y-5" aria-labelledby="pt-schedule-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="pt-schedule-heading" className="neo-panel__title">
              Agenda do personal trainer
            </h2>
            <p className="neo-panel__subtitle">
              Orquestra sessões com um cockpit completo e mantém o ritmo dos teus atletas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={statusState} label={statusMessage} />
            <button
              type="button"
              className="btn ghost inline-flex items-center gap-2"
              onClick={() => void fetchRows()}
              disabled={loading}
            >
              <RefreshIcon className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
              Recarregar
            </button>
          </div>
        </div>

        <div className="neo-grid auto-fit min-[260px]:grid-cols-2 lg:grid-cols-4">
          <article className="neo-surface space-y-2 p-4" data-variant="primary">
            <span className="neo-surface__hint uppercase tracking-wide">Sessões hoje</span>
            <span className="neo-surface__value text-2xl font-semibold text-fg">
              {loadingCounts ? '…' : today ?? 0}
            </span>
            <p className="text-xs text-muted">Número de sessões com início nas próximas 24 horas.</p>
          </article>
          <article className="neo-surface space-y-2 p-4" data-variant="success">
            <span className="neo-surface__hint uppercase tracking-wide">Próximos 7 dias</span>
            <span className="neo-surface__value text-2xl font-semibold text-fg">
              {loadingCounts ? '…' : next7 ?? 0}
            </span>
            <p className="text-xs text-muted">Carga semanal para planear recuperações e treinos.</p>
          </article>
          <article className="neo-surface space-y-2 p-4" data-variant="info">
            <span className="neo-surface__hint uppercase tracking-wide">Filtro actual</span>
            <span className="neo-surface__value text-2xl font-semibold text-fg">
              {status ? statusLabel(status) : 'Todos'}
            </span>
            <p className="text-xs text-muted">Amostra mostrada na tabela abaixo.</p>
          </article>
          <article className="neo-surface space-y-2 p-4" data-variant="warning">
            <span className="neo-surface__hint uppercase tracking-wide">Registos sincronizados</span>
            <span className="neo-surface__value text-2xl font-semibold text-fg">{count}</span>
            <p className="text-xs text-muted">Somatório de sessões carregadas deste período.</p>
          </article>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:gap-3">
            <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-muted">
              Estado
              <select
                className="neo-input"
                value={status}
                onChange={(event) => {
                  setPagination((prev) => ({ ...prev, page: 0 }));
                  setStatus(event.target.value);
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-muted">
              Pesquisa rápida
              <input
                className="neo-input"
                placeholder="Filtrar por cliente, local ou estado"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn ghost inline-flex items-center gap-2" onClick={exportCSV}>
              <DownloadIcon className="h-4 w-4" /> Exportar CSV
            </button>
            <button type="button" className="btn ghost inline-flex items-center gap-2" onClick={printList}>
              <PrintIcon className="h-4 w-4" /> Imprimir
            </button>
            <button type="button" className="btn primary inline-flex items-center gap-2" onClick={() => setCreateOpen(true)}>
              <PlusIcon className="h-4 w-4" /> Nova sessão
            </button>
          </div>
        </div>
      </section>

      <section className="neo-panel space-y-4" aria-label="Tabela da agenda">
        {error && !loading && (
          <div className="rounded-2xl border border-dashed border-red-300/70 bg-red-50/70 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}
        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Horário</th>
                <th scope="col">Cliente</th>
                <th scope="col">Local</th>
                <th scope="col">Estado</th>
                <th scope="col">Notas</th>
                <th scope="col" className="text-right">
                  Acções
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-white/50 bg-white/40 p-6 text-sm text-muted dark:border-slate-700/60 dark:bg-slate-900/40">
                      <span className="h-3 w-3 animate-spin rounded-full border-[2.5px] border-transparent border-t-current" aria-hidden />
                      A sincronizar agenda…
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="rounded-2xl border border-dashed border-white/40 bg-white/30 p-6 text-center text-sm text-muted dark:border-slate-700/60 dark:bg-slate-900/30">
                      Nenhuma sessão corresponde aos filtros actuais. Ajusta o estado ou limpa a pesquisa para ver mais registos.
                    </div>
                  </td>
                </tr>
              )}
              {filteredRows.map((row) => {
                const slot = formatSlot(row);
                return (
                  <tr key={row.id}>
                    <td>
                      <div className="space-y-1">
                        <span className="text-sm font-semibold text-fg">{slot.day}</span>
                        <p className="text-xs text-muted">
                          {slot.start} → {slot.end}
                        </p>
                        <span className="text-[11px] uppercase tracking-wide text-muted">{formatDateTime(row.start_time)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-fg">{row.client_id ?? '—'}</span>
                    </td>
                    <td>
                      <span className="text-sm text-muted">{row.location ?? 'A definir'}</span>
                    </td>
                    <td>
                      <StatusPill tone={statusTone(row.status)} label={statusLabel(row.status ?? null)} />
                    </td>
                    <td>
                      <span className="text-xs text-muted">{row.notes ?? '—'}</span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="btn ghost text-xs"
                          onClick={() => router.push(`/dashboard/pt/schedule/${row.id}`)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn ghost text-xs text-danger"
                          onClick={() => void handleDelete(row.id)}
                          disabled={deletingId === row.id}
                        >
                          {deletingId === row.id ? 'A remover…' : 'Remover'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/20 pt-4 text-sm text-muted dark:border-slate-700/60 md:flex-row md:items-center md:justify-between">
          <div>
            {count === 0 ? 'Sem registos' : `A mostrar ${filteredRows.length} registo(s) · ${rangeStart} – ${rangeEnd} de ${count}`}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs uppercase tracking-wide">
              <span>Itens por página</span>
              <select
                className="neo-input py-2 pl-3 pr-9 text-sm"
                value={pagination.pageSize}
                onChange={(event) =>
                  setPagination({ page: 0, pageSize: Number(event.target.value) || pageSize })
                }
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn icon"
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(0, currentPage - 1) }))}
                disabled={currentPage === 0}
                aria-label="Página anterior"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="text-xs uppercase tracking-wide">
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                type="button"
                className="btn icon"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: Math.min(totalPages - 1, currentPage + 1) }))
                }
                disabled={currentPage >= totalPages - 1}
                aria-label="Próxima página"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Modal open={createOpen} title="Nova sessão" onClose={() => setCreateOpen(false)}>
        <SessionFormClient
          mode="create"
          scope="trainer"
          onCompleted={handleCreateSuccess}
          onCancelled={() => setCreateOpen(false)}
        />
      </Modal>
    </div>
  );
}
