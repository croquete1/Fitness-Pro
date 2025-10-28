'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import SessionFormClient from './SessionFormClient';
import { useTrainerPtsCounts } from '@/lib/hooks/usePtsCounts';

type BaseRow = {
  id: string;
  start_time?: string | null;
  end_time?: string | null;
  status?: 'scheduled' | 'done' | 'cancelled' | string | null;
  trainer_id?: string | null;
  client_id?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  location?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

export type Row = BaseRow & { searchIndex: string };

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Todos os estados' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'done', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const OFFLINE_ERROR = 'Sem ligação à internet.';

type StatusTone = 'ok' | 'warn' | 'down';

type Slot = { day: string; start: string; end: string };

type IconProps = { className?: string };

function firstString(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

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

function normalizeString(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizePhone(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/\D+/g, '');
}

function formatDialable(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const digits = trimmed.replace(/\D+/g, '');
  if (!digits) return '';
  if (trimmed.startsWith('+')) return `+${digits}`;
  if (trimmed.startsWith('00') && digits.length > 2) {
    return `+${digits.slice(2)}`;
  }
  return digits;
}

function buildSearchIndex(row: BaseRow): string {
  const segments: string[] = [];
  const append = (value: string | null | undefined) => {
    if (!value) return;
    const normalized = normalizeString(String(value));
    if (normalized) segments.push(normalized);
    const digits = normalizePhone(String(value));
    if (digits) segments.push(digits);
  };

  append(row.id);
  append(row.client_id);
  append(row.client_name);
  append(row.client_email);
  append(row.client_phone);
  append(row.location);
  append(row.status);
  append(statusLabel(row.status ?? null));
  append(row.notes);

  return segments.join(' ');
}

function normalizeQuery(value: string): string[] {
  const normalized = normalizeString(value);
  const tokens = normalized ? normalized.split(' ').filter(Boolean) : [];
  const digits = normalizePhone(value);
  if (digits) tokens.push(digits);
  return tokens;
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function StatusPill({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span className="status-pill" data-state={tone} role="status" aria-live="polite">
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [status, setStatus] = React.useState(() => searchParams.get('status') ?? '');
  const [query, setQuery] = React.useState(() => searchParams.get('q') ?? '');
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState(() => {
    const page = Math.max(0, Number.parseInt(searchParams.get('page') ?? '0', 10) || 0);
    const parsedPageSize = Number.parseInt(searchParams.get('pageSize') ?? `${pageSize}`, 10);
    const safePageSize = PAGE_SIZE_OPTIONS.includes(parsedPageSize) ? parsedPageSize : pageSize;
    return { page, pageSize: safePageSize };
  });
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);
  const [isOffline, setIsOffline] = React.useState(
    () => (typeof navigator !== 'undefined' ? !navigator.onLine : false),
  );

  const deferredQuery = React.useDeferredValue(query);
  const abortRef = React.useRef<AbortController | null>(null);

  const { today, next7, loading: loadingCounts } = useTrainerPtsCounts();

  const fetchRows = React.useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (isOffline) {
      setLoading(false);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/trainer/pts-schedule', window.location.origin);
      url.searchParams.set('page', String(pagination.page));
      url.searchParams.set('pageSize', String(pagination.pageSize));
      if (status) url.searchParams.set('status', status);

      const response = await fetch(url.toString(), { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error(await response.text());
      const json = await response.json();
      const source: any[] = Array.isArray(json?.rows)
        ? json.rows
        : Array.isArray(json?.items)
        ? json.items
        : Array.isArray(json?.data)
        ? json.data
        : [];

      const mapped = source.map((row: any): Row => {
        const trainer = row?.trainer ?? row?.trainer_profile ?? null;
        const client = row?.client ?? row?.client_profile ?? null;
        const clientName = firstString(
          row?.client_name,
          row?.client_full_name,
          client?.full_name,
          client?.name,
        );
        const clientEmail = firstString(row?.client_email, client?.email);
        const clientPhone = firstString(row?.client_phone, client?.phone);
        const baseRow: BaseRow = {
          id: String(row?.id ?? crypto.randomUUID()),
          start_time: row?.start_time ?? row?.start ?? row?.starts_at ?? row?.scheduled_at ?? null,
          end_time: row?.end_time ?? row?.end ?? row?.ends_at ?? null,
          status: row?.status ?? row?.state ?? null,
          trainer_id: row?.trainer_id ?? row?.pt_id ?? trainer?.id ?? null,
          client_id: row?.client_id ?? row?.member_id ?? client?.id ?? null,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          location: row?.location ?? row?.place ?? null,
          notes: row?.notes ?? null,
          created_at: row?.created_at ?? null,
        };
        return { ...baseRow, searchIndex: buildSearchIndex(baseRow) };
      });

      setRows(mapped);
      setCount(Number(json?.count ?? mapped.length));
      setLastSyncedAt(new Date());
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      console.error('[trainer schedule] load failed', err);
      const offlineDetected = typeof navigator !== 'undefined' && !navigator.onLine;
      setError(offlineDetected ? OFFLINE_ERROR : 'Não foi possível sincronizar a agenda.');
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
        abortRef.current = null;
      }
    }
  }, [isOffline, pagination.page, pagination.pageSize, status]);

  React.useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  React.useEffect(() => () => abortRef.current?.abort(), []);

  React.useEffect(() => {
    if (isOffline) {
      setError(OFFLINE_ERROR);
    } else {
      setError((prev) => (prev === OFFLINE_ERROR ? null : prev));
    }
  }, [isOffline]);

  React.useEffect(() => {
    const nextStatus = searchParams.get('status') ?? '';
    const nextQuery = searchParams.get('q') ?? '';
    const nextPage = Math.max(0, Number.parseInt(searchParams.get('page') ?? '0', 10) || 0);
    const parsedPageSize = Number.parseInt(searchParams.get('pageSize') ?? `${pageSize}`, 10);
    const nextPageSize = PAGE_SIZE_OPTIONS.includes(parsedPageSize) ? parsedPageSize : pageSize;

    setStatus((prev) => (prev === nextStatus ? prev : nextStatus));
    setQuery((prev) => (prev === nextQuery ? prev : nextQuery));
    setPagination((prev) => {
      if (prev.page === nextPage && prev.pageSize === nextPageSize) return prev;
      return { page: nextPage, pageSize: nextPageSize };
    });
  }, [searchParams, pageSize]);

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (query) params.set('q', query);
    if (pagination.page) params.set('page', String(pagination.page));
    if (pagination.pageSize !== pageSize) params.set('pageSize', String(pagination.pageSize));
    const next = params.toString();
    const current = searchParams.toString();
    if (next === current) return;
    const target = next ? `${pathname}?${next}` : pathname;
    router.replace(target, { scroll: false });
  }, [status, query, pagination.page, pagination.pageSize, router, pathname, searchParams, pageSize]);

  const searchTokens = React.useMemo(() => normalizeQuery(deferredQuery), [deferredQuery]);

  const filteredRows = React.useMemo(() => {
    if (searchTokens.length === 0) return rows;
    return rows.filter((row) => searchTokens.every((token) => row.searchIndex.includes(token)));
  }, [rows, searchTokens]);

  const statusMessage = React.useMemo(() => {
    if (loading) return 'A sincronizar…';
    if (error) return error;
    const hasTokens = searchTokens.length > 0;
    if (filteredRows.length === 0) return hasTokens ? 'Nenhum resultado' : 'Sem sessões visíveis';
    const base = hasTokens ? `${filteredRows.length} resultado(s)` : `${count} registo(s)`;
    if (!lastSyncedAt) return base;
    return `${base} · Actualizado às ${lastSyncedAt.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }, [loading, error, searchTokens.length, filteredRows.length, count, lastSyncedAt]);

  const statusState: StatusTone = loading ? 'warn' : error ? 'down' : 'ok';

  React.useEffect(() => {
    setPagination((prev) => {
      const totalPages = Math.max(1, Math.ceil(Math.max(count, 1) / prev.pageSize));
      if (prev.page <= totalPages - 1) return prev;
      return { ...prev, page: totalPages - 1 };
    });
  }, [count, pagination.pageSize]);

  const totalPages = Math.max(1, Math.ceil(Math.max(count, 1) / pagination.pageSize));
  const currentPage = Math.min(pagination.page, totalPages - 1);
  const hasSearch = searchTokens.length > 0;
  const rangeStart = hasSearch ? filteredRows.length > 0 ? 1 : 0 : count === 0 ? 0 : currentPage * pagination.pageSize + 1;
  const rangeEnd = hasSearch ? filteredRows.length : count === 0 ? 0 : Math.min(count, rangeStart + pagination.pageSize - 1);

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
    const header = [
      'id',
      'start_time',
      'end_time',
      'status',
      'client_id',
      'client_name',
      'client_email',
      'client_phone',
      'location',
      'notes',
      'created_at',
    ];
    const lines = [
      header.join(','),
      ...filteredRows.map((row) =>
        [
          row.id,
          row.start_time ?? '',
          row.end_time ?? '',
          row.status ?? '',
          row.client_id ?? '',
          row.client_name ?? '',
          row.client_email ?? '',
          row.client_phone ?? '',
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
        const clientPrimary = firstString(row.client_name, row.client_id) ?? '—';
        const clientContacts = [row.client_email, row.client_phone]
          .filter((value): value is string => Boolean(value && value.trim()))
          .join(' · ');
        const clientCell = clientContacts ? `${clientPrimary} · ${clientContacts}` : clientPrimary;
        const cells = [
          `${slot.day} — ${slot.start} → ${slot.end}`,
          clientCell,
          row.location ?? '—',
          statusLabel(row.status ?? null),
          (row.notes ?? '').replace(/\r?\n/g, ' '),
        ]
          .map((cell) => `<td>${escapeHtml(String(cell))}</td>`)
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

  const filtersLayoutGap = { '--neo-stack-gap': '20px' } as React.CSSProperties;
  const footerGap = { '--neo-stack-gap': '14px' } as React.CSSProperties;
  const footerSummary = hasSearch
    ? filteredRows.length === 0
      ? 'Nenhum resultado para a pesquisa actual.'
      : `A mostrar ${filteredRows.length} registo(s) filtrados`
    : count === 0
    ? 'Sem registos'
    : `A mostrar ${filteredRows.length} registo(s) · ${rangeStart} – ${rangeEnd} de ${count}`;

  return (
    <div className="neo-stack neo-stack--xl">
      <section className="neo-panel neo-stack neo-stack--xl" aria-labelledby="pt-schedule-heading">
        <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md">
          <div>
            <h2 id="pt-schedule-heading" className="neo-panel__title">
              Agenda do personal trainer
            </h2>
            <p className="neo-panel__subtitle">
              Orquestra sessões com um cockpit completo e mantém o ritmo dos teus atletas.
            </p>
          </div>
          <div className="neo-inline neo-inline--wrap neo-inline--sm">
            <StatusPill tone={statusState} label={statusMessage} />
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              data-size="sm"
              onClick={() => void fetchRows()}
              disabled={loading}
            >
              <span className="btn__label">
                <span className="btn__icon">
                  <RefreshIcon className={loading ? 'neo-icon neo-icon--sm neo-spin' : 'neo-icon neo-icon--sm'} />
                </span>
                Recarregar
              </span>
            </button>
          </div>
        </div>

        <div className="neo-grid neo-grid--auto neo-grid--metrics-lg">
          <article className="neo-surface neo-surface--padded neo-stack neo-stack--sm" data-variant="primary">
            <span className="neo-surface__hint neo-text--uppercase">Sessões hoje</span>
            <span className="neo-surface__value">
              {loadingCounts ? '…' : today ?? 0}
            </span>
            <p className="neo-text--xs neo-text--muted">Número de sessões com início nas próximas 24 horas.</p>
          </article>
          <article className="neo-surface neo-surface--padded neo-stack neo-stack--sm" data-variant="success">
            <span className="neo-surface__hint neo-text--uppercase">Próximos 7 dias</span>
            <span className="neo-surface__value">
              {loadingCounts ? '…' : next7 ?? 0}
            </span>
            <p className="neo-text--xs neo-text--muted">Carga semanal para planear recuperações e treinos.</p>
          </article>
          <article className="neo-surface neo-surface--padded neo-stack neo-stack--sm" data-variant="info">
            <span className="neo-surface__hint neo-text--uppercase">Filtro actual</span>
            <span className="neo-surface__value">{status ? statusLabel(status) : 'Todos'}</span>
            <p className="neo-text--xs neo-text--muted">Amostra mostrada na tabela abaixo.</p>
          </article>
          <article className="neo-surface neo-surface--padded neo-stack neo-stack--sm" data-variant="warning">
            <span className="neo-surface__hint neo-text--uppercase">Registos sincronizados</span>
            <span className="neo-surface__value">{count}</span>
            <p className="neo-text--xs neo-text--muted">Somatório de sessões carregadas deste período.</p>
          </article>
        </div>

        <div className="neo-stack-lg-row" style={filtersLayoutGap}>
          <div className="neo-filters-grid">
            <label className="neo-stack neo-stack--xs">
              <span className="neo-text--xs neo-text--uppercase neo-text--muted neo-text--semibold">Estado</span>
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
            <label className="neo-stack neo-stack--xs">
              <span className="neo-text--xs neo-text--uppercase neo-text--muted neo-text--semibold">Pesquisa rápida</span>
              <input
                className="neo-input"
                placeholder="Filtrar por cliente, email, telefone, local ou estado"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
          <div className="neo-inline neo-inline--wrap neo-inline--sm">
            <button type="button" className="btn" data-variant="ghost" data-size="sm" onClick={exportCSV}>
              <span className="btn__label">
                <span className="btn__icon">
                  <DownloadIcon className="neo-icon neo-icon--sm" />
                </span>
                Exportar CSV
              </span>
            </button>
            <button type="button" className="btn" data-variant="ghost" data-size="sm" onClick={printList}>
              <span className="btn__label">
                <span className="btn__icon">
                  <PrintIcon className="neo-icon neo-icon--sm" />
                </span>
                Imprimir
              </span>
            </button>
            <button type="button" className="btn" data-variant="primary" onClick={() => setCreateOpen(true)}>
              <span className="btn__label">
                <span className="btn__icon">
                  <PlusIcon className="neo-icon neo-icon--sm" />
                </span>
                Nova sessão
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="neo-panel neo-stack neo-stack--lg" aria-label="Tabela da agenda">
        {error && !loading && (
          <div className="neo-alert" style={{ '--alert-color': 'var(--danger)' } as React.CSSProperties}>
            {error}
          </div>
        )}
        <div className="neo-table-wrapper" role="region" aria-live="polite" aria-busy={loading}>
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Horário</th>
                <th scope="col">Cliente</th>
                <th scope="col">Local</th>
                <th scope="col">Estado</th>
                <th scope="col">Notas</th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Acções
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="neo-table-empty">
                      <div className="neo-inline neo-inline--center neo-inline--sm neo-text--sm neo-text--muted">
                        <span className="neo-spinner" aria-hidden />
                        A sincronizar agenda…
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="neo-table-empty">
                      Nenhuma sessão corresponde aos filtros actuais. Ajusta o estado ou limpa a pesquisa para ver mais registos.
                    </div>
                  </td>
                </tr>
              )}
              {filteredRows.map((row) => {
                const slot = formatSlot(row);
                const dialablePhone = formatDialable(row.client_phone);
                return (
                  <tr key={row.id}>
                    <td>
                      <div className="neo-stack neo-stack--xs">
                        <span className="neo-text--sm neo-text--semibold text-fg">{slot.day}</span>
                        <p className="neo-text--xs neo-text--muted">
                          {slot.start} → {slot.end}
                        </p>
                        <span className="neo-text--xs neo-text--uppercase neo-text--muted">{formatDateTime(row.start_time)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="neo-stack neo-stack--xs">
                        <span className="neo-text--sm neo-text--semibold text-fg">
                          {firstString(row.client_name, row.client_id) ?? '—'}
                        </span>
                        {row.client_email && (
                          <a
                            className="neo-text--xs neo-text--muted"
                            href={`mailto:${row.client_email}`}
                          >
                            {row.client_email}
                          </a>
                        )}
                        {row.client_phone && (
                          dialablePhone ? (
                            <a
                              className="neo-text--xs neo-text--muted"
                              href={`tel:${dialablePhone}`}
                            >
                              {row.client_phone}
                            </a>
                          ) : (
                            <span className="neo-text--xs neo-text--muted">{row.client_phone}</span>
                          )
                        )}
                        {!row.client_name && row.client_id && (
                          <span className="neo-text--xs neo-text--muted">ID #{row.client_id}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="neo-text--sm neo-text--muted">{row.location ?? 'A definir'}</span>
                    </td>
                    <td>
                      <StatusPill tone={statusTone(row.status)} label={statusLabel(row.status ?? null)} />
                    </td>
                    <td>
                      <span className="neo-text--xs neo-text--muted">{row.notes ?? '—'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="neo-inline neo-inline--end neo-inline--sm">
                        <button
                          type="button"
                          className="btn"
                          data-variant="ghost"
                          data-size="sm"
                          onClick={() => router.push(`/dashboard/pt/schedule/${row.id}`)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn"
                          data-variant="ghost"
                          data-size="sm"
                          style={{ color: 'var(--danger)' }}
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
        <div className="neo-panel__footer" style={footerGap}>
          <div>{footerSummary}</div>
          <div className="neo-inline neo-inline--wrap neo-inline--md">
            <label className="neo-inline neo-inline--sm neo-text--xs neo-text--uppercase neo-text--muted">
              <span>Itens por página</span>
              <select
                className="neo-input neo-input--compact neo-text--sm"
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
            <div className="neo-inline neo-inline--sm neo-text--xs neo-text--uppercase neo-text--muted">
              <button
                type="button"
                className="btn neo-icon-btn"
                data-variant="ghost"
                data-size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(0, currentPage - 1) }))}
                disabled={currentPage === 0}
                aria-label="Página anterior"
              >
                <ChevronLeftIcon className="neo-icon neo-icon--sm" />
              </button>
              <span>
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                type="button"
                className="btn neo-icon-btn"
                data-variant="ghost"
                data-size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: Math.min(totalPages - 1, currentPage + 1) }))
                }
                disabled={currentPage >= totalPages - 1}
                aria-label="Próxima página"
              >
                <ChevronRightIcon className="neo-icon neo-icon--sm" />
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
